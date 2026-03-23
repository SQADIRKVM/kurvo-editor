import type { EditorCore } from "@/core";
import type { AudioClipSource } from "@/lib/media/audio";
import { createAudioContext, collectAudioClips } from "@/lib/media/audio";
import {
	ALL_FORMATS,
	AudioBufferSink,
	BlobSource,
	Input,
	type WrappedAudioBuffer,
} from "mediabunny";

export class AudioManager {
	private audioContext: AudioContext | null = null;
	private masterGain: GainNode | null = null;
	private playbackStartTime = 0;
	private playbackStartContextTime = 0;
	private scheduleTimer: number | null = null;
	private lookaheadSeconds = 2;
	private scheduleIntervalMs = 500;
	private clips: AudioClipSource[] = [];
	private sinks = new Map<string, AudioBufferSink>();
	private inputs = new Map<string, Input>();
	private activeClipIds = new Set<string>();
	private clipIterators = new Map<
		string,
		AsyncGenerator<WrappedAudioBuffer, void, unknown>
	>();
	private queuedSources = new Set<AudioBufferSourceNode>();
	private playbackSessionId = 0;
	private lastIsPlaying = false;
	private lastVolume = 1;
	private playbackLatencyCompensationSeconds = 0;
	private unsubscribers: Array<() => void> = [];

	constructor(private editor: EditorCore) {
		this.lastVolume = this.editor.playback.getVolume();

		this.unsubscribers.push(
			this.editor.playback.subscribe(this.handlePlaybackChange),
			this.editor.timeline.subscribe(this.handleTimelineChange),
			this.editor.media.subscribe(this.handleTimelineChange),
		);
		if (typeof window !== "undefined") {
			window.addEventListener("playback-seek", this.handleSeek);
		}
	}

	dispose(): void {
		this.stopPlayback();
		for (const unsub of this.unsubscribers) {
			unsub();
		}
		this.unsubscribers = [];
		if (typeof window !== "undefined") {
			window.removeEventListener("playback-seek", this.handleSeek);
		}
		this.disposeSinks();
		if (this.audioContext) {
			void this.audioContext.close();
			this.audioContext = null;
			this.masterGain = null;
		}
	}

	private handlePlaybackChange = (): void => {
		const isPlaying = this.editor.playback.getIsPlaying();
		const volume = this.editor.playback.getVolume();

		if (volume !== this.lastVolume) {
			this.lastVolume = volume;
			this.updateGain();
		}

		if (isPlaying !== this.lastIsPlaying) {
			this.lastIsPlaying = isPlaying;
			if (isPlaying) {
				void this.startPlayback({
					time: this.editor.playback.getCurrentTime(),
				});
			} else {
				this.stopPlayback();
			}
		}
	};

	private handleSeek = (event: Event): void => {
		const detail = (event as CustomEvent<{ time: number }>).detail;
		if (!detail) return;

		if (this.editor.playback.getIsScrubbing()) {
			this.stopPlayback();
			return;
		}

		if (this.editor.playback.getIsPlaying()) {
			void this.startPlayback({ time: detail.time });
			return;
		}

		this.stopPlayback();
	};

	private handleTimelineChange = (): void => {
		this.disposeSinks();

		if (!this.editor.playback.getIsPlaying()) return;

		void this.startPlayback({ time: this.editor.playback.getCurrentTime() });
	};

	private ensureAudioContext(): AudioContext | null {
		if (this.audioContext) return this.audioContext;
		if (typeof window === "undefined") return null;

		this.audioContext = createAudioContext();
		this.masterGain = this.audioContext.createGain();
		this.masterGain.gain.value = this.lastVolume;
		this.masterGain.connect(this.audioContext.destination);
		return this.audioContext;
	}

	private updateGain(): void {
		if (!this.masterGain) return;
		this.masterGain.gain.value = this.lastVolume;
	}

	private getPlaybackTime(): number {
		if (!this.audioContext) return this.playbackStartTime;
		const elapsed =
			this.audioContext.currentTime - this.playbackStartContextTime;
		return this.playbackStartTime + elapsed;
	}

	private async startPlayback({ time }: { time: number }): Promise<void> {
		const audioContext = this.ensureAudioContext();
		if (!audioContext) return;

		this.stopPlayback();
		this.playbackSessionId++;
		this.playbackLatencyCompensationSeconds = 0;

		const tracks = this.editor.timeline.getTracks();
		const mediaAssets = this.editor.media.getAssets();
		const duration = this.editor.timeline.getTotalDuration();

		if (duration <= 0) return;

		if (audioContext.state === "suspended") {
			await audioContext.resume();
		}

		this.clips = await collectAudioClips({ tracks, mediaAssets });
		if (!this.editor.playback.getIsPlaying()) return;

		this.playbackStartTime = time;
		this.playbackStartContextTime = audioContext.currentTime;

		this.scheduleUpcomingClips();

		if (typeof window !== "undefined") {
			this.scheduleTimer = window.setInterval(() => {
				this.scheduleUpcomingClips();
			}, this.scheduleIntervalMs);
		}
	}

	private scheduleUpcomingClips(): void {
		if (!this.editor.playback.getIsPlaying()) return;

		const currentTime = this.getPlaybackTime();
		const windowEnd = currentTime + this.lookaheadSeconds;

		for (const clip of this.clips) {
			if (clip.muted) continue;
			if (this.activeClipIds.has(clip.id)) continue;

			const clipEnd = clip.startTime + clip.duration;
			if (clipEnd <= currentTime) continue;
			if (clip.startTime > windowEnd) continue;

			this.activeClipIds.add(clip.id);
			void this.runClipIterator({
				clip,
				startTime: currentTime,
				sessionId: this.playbackSessionId,
			});
		}
	}

	private stopPlayback(): void {
		if (this.scheduleTimer && typeof window !== "undefined") {
			window.clearInterval(this.scheduleTimer);
		}
		this.scheduleTimer = null;

		for (const iterator of this.clipIterators.values()) {
			void iterator.return();
		}
		this.clipIterators.clear();
		this.activeClipIds.clear();

		for (const source of this.queuedSources) {
			try {
				source.stop();
			} catch {}
			source.disconnect();
		}
		this.queuedSources.clear();
	}

	private async runClipIterator({
		clip,
		startTime,
		sessionId,
	}: {
		clip: AudioClipSource;
		startTime: number;
		sessionId: number;
	}): Promise<void> {
		const audioContext = this.ensureAudioContext();
		if (!audioContext) return;

		const sink = await this.getAudioSink({ clip });
		if (!sink || !this.editor.playback.getIsPlaying()) return;
		if (sessionId !== this.playbackSessionId) return;

		const clipStart = clip.startTime;
		const clipEnd = clip.startTime + clip.duration;
		const playbackTimeAfterSinkReady = this.getPlaybackTime();
		const iteratorStartTime = Math.max(
			startTime,
			clipStart,
			playbackTimeAfterSinkReady,
		);
		if (iteratorStartTime >= clipEnd) {
			return;
		}
		const sourceStartTime =
			clip.trimStart + (iteratorStartTime - clip.startTime);

		const iterator = sink.buffers(sourceStartTime);
		this.clipIterators.set(clip.id, iterator);
		let consecutiveDroppedBufferCount = 0;

		try {
			for await (const { buffer, timestamp } of iterator) {
				if (!this.editor.playback.getIsPlaying()) return;
				if (sessionId !== this.playbackSessionId) return;

				const timelineTime = clip.startTime + (timestamp - clip.trimStart);
				if (timelineTime >= clipEnd) break;

				const node = audioContext.createBufferSource();
				node.buffer = buffer;
				
				// Voice Changer (Simple Pitch Shift)
				if (clip.voiceChanger === "deep") {
					node.detune.value = -600;
				} else if (clip.voiceChanger === "high" || clip.voiceChanger === "chipmunk") {
					node.detune.value = clip.voiceChanger === "chipmunk" ? 1200 : 600;
				} else if (clip.voiceChanger === "robot") {
					node.detune.value = -400; // Ring modulation prep or deep harsh
				}

				// Per-clip gain node for volume and fades
				const chunkGain = audioContext.createGain();
				const baseVolume = clip.volume ?? 1;
				
				const relativeTimeInClip = timelineTime - clip.startTime;
				const chunkDuration = buffer.duration;
				
				const startTimestamp =
					this.playbackStartContextTime +
					this.playbackLatencyCompensationSeconds +
					(timelineTime - this.playbackStartTime);

				// Initialize gain
				let targetVolume = baseVolume;

				// Apply Auto Ducking
				if (clip.autoDucking) {
					const isOtherClipPlaying = this.clips.some(other => 
						!other.muted && 
						!other.autoDucking && 
						other.id !== clip.id &&
						timelineTime < (other.startTime + other.duration) &&
						(timelineTime + chunkDuration) > other.startTime
					);
					
					if (isOtherClipPlaying) {
						targetVolume *= 0.2; // Duck to 20%
					}
				}

				chunkGain.gain.setValueAtTime(targetVolume, startTimestamp);

				// Apply Fade In
				if (clip.fadeInDuration && relativeTimeInClip < clip.fadeInDuration) {
					const fadeStart = Math.max(0, relativeTimeInClip);
					const fadeEnd = Math.min(clip.fadeInDuration, relativeTimeInClip + chunkDuration);
					
					const startGain = (fadeStart / clip.fadeInDuration) * targetVolume;
					const endGain = (fadeEnd / clip.fadeInDuration) * targetVolume;
					
					chunkGain.gain.setValueAtTime(startGain, startTimestamp);
					chunkGain.gain.linearRampToValueAtTime(endGain, startTimestamp + chunkDuration);
				}

				// Apply Fade Out
				const fadeOutStartOffset = clip.duration - (clip.fadeOutDuration ?? 0);
				if (clip.fadeOutDuration && (relativeTimeInClip + chunkDuration) > fadeOutStartOffset) {
					const fadeStart = Math.max(fadeOutStartOffset, relativeTimeInClip);
					const fadeEnd = Math.min(clip.duration, relativeTimeInClip + chunkDuration);
					
					const startGain = ((clip.duration - fadeStart) / clip.fadeOutDuration) * targetVolume;
					const endGain = ((clip.duration - fadeEnd) / clip.fadeOutDuration) * targetVolume;
					
					// If we already had a ramp from fade-in, we need to respect the timing
					chunkGain.gain.setValueAtTime(startGain, startTimestamp + (fadeStart - relativeTimeInClip));
					chunkGain.gain.linearRampToValueAtTime(endGain, startTimestamp + (fadeEnd - relativeTimeInClip));
				}

				node.connect(chunkGain);

				// --- Audio Processing Chain ---
				let lastNode: AudioNode = chunkGain;

				// 0. Equalizer (BiquadFilter mapping)
				if (clip.equalizer && clip.equalizer !== "none") {
					const ctx = audioContext;
					const eq = ctx.createBiquadFilter();
					eq.type = "peaking";
					eq.Q.value = 1.0;
					
					const eqBass = ctx.createBiquadFilter();
					eqBass.type = "lowshelf";
					eqBass.frequency.value = 250;

					const eqTreble = ctx.createBiquadFilter();
					eqTreble.type = "highshelf";
					eqTreble.frequency.value = 4000;

					switch (clip.equalizer) {
						case "pop":
							eq.frequency.value = 2000;
							eq.gain.value = 3;
							break;
						case "rock":
							eq.frequency.value = 1000; // Mid scoop
							eq.gain.value = -3;
							eqBass.gain.value = 4;
							eqTreble.gain.value = 4;
							break;
						case "jazz":
							eq.frequency.value = 400; // Warm mids
							eq.gain.value = 2;
							eqTreble.gain.value = 1;
							break;
						case "classical":
							eqBass.gain.value = 2; 
							eqTreble.gain.value = 2;
							break;
						case "electronic":
							eqBass.gain.value = 5;
							eqTreble.gain.value = 4;
							break;
						case "dance":
							eqBass.gain.value = 6;
							eq.frequency.value = 1000;
							eq.gain.value = -2;
							eqTreble.gain.value = 4;
							break;
					}

					lastNode.connect(eqBass);
					eqBass.connect(eq);
					eq.connect(eqTreble);
					lastNode = eqTreble;
				}

				// 1. Noise Reduction (Simple Bandpass)
				if (clip.noiseReduction) {
					const hp = audioContext.createBiquadFilter();
					hp.type = "highpass";
					hp.frequency.value = 200;
					
					const lp = audioContext.createBiquadFilter();
					lp.type = "lowpass";
					lp.frequency.value = 8000;

					lastNode.connect(hp);
					hp.connect(lp);
					lastNode = lp;
				}

				// 2. Voice Enhancement (Compression + EQ)
				if (clip.voiceEnchancement) {
					const compressor = audioContext.createDynamicsCompressor();
					compressor.threshold.value = -24;
					compressor.knee.value = 30;
					compressor.ratio.value = 12;
					compressor.attack.value = 0.003;
					compressor.release.value = 0.25;

					const eq = audioContext.createBiquadFilter();
					eq.type = "peaking";
					eq.frequency.value = 3000;
					eq.Q.value = 1;
					eq.gain.value = 4; // 4dB boost for clarity

					lastNode.connect(compressor);
					compressor.connect(eq);
					lastNode = eq;
				}

				lastNode.connect(this.masterGain ?? audioContext.destination);

				if (startTimestamp >= audioContext.currentTime) {
					node.start(startTimestamp);
					consecutiveDroppedBufferCount = 0;
				} else {
					const offset = audioContext.currentTime - startTimestamp;
					if (offset < buffer.duration) {
						node.start(audioContext.currentTime, offset);
						consecutiveDroppedBufferCount = 0;
					} else {
						consecutiveDroppedBufferCount += 1;
						if (consecutiveDroppedBufferCount >= 5) {
							const nextCompensationSeconds = Math.max(
								this.playbackLatencyCompensationSeconds,
								Math.min(0.25, offset + 0.01),
							);
							if (
								nextCompensationSeconds >
								this.playbackLatencyCompensationSeconds + 0.001
							) {
								this.playbackLatencyCompensationSeconds =
									nextCompensationSeconds;
							}
							const resyncStartTime = this.getPlaybackTime();
							this.clipIterators.delete(clip.id);
							void this.runClipIterator({
								clip,
								startTime: resyncStartTime,
								sessionId,
							});
							return;
						}
						continue;
					}
				}

				this.queuedSources.add(node);
				node.addEventListener("ended", () => {
					node.disconnect();
					this.queuedSources.delete(node);
				});

				const aheadTime = timelineTime - this.getPlaybackTime();
				if (aheadTime >= 1) {
					await this.waitUntilCaughtUp({ timelineTime, targetAhead: 1 });
					if (sessionId !== this.playbackSessionId) return;
				}
			}
		} catch (error) {
			if (error instanceof Error && error.message.toLowerCase().includes("dispose")) {
				return;
			}
			console.error("Audio playback error:", error);
		} finally {
			if (sessionId === this.playbackSessionId) {
				this.clipIterators.delete(clip.id);
			}
			// don't remove from activeClipIds - prevents scheduler from restarting this clip
			// the set is cleared on stopPlayback anyway
		}
	}

	private waitUntilCaughtUp({
		timelineTime,
		targetAhead,
	}: {
		timelineTime: number;
		targetAhead: number;
	}): Promise<void> {
		return new Promise((resolve) => {
			const checkInterval = setInterval(() => {
				if (!this.editor.playback.getIsPlaying()) {
					clearInterval(checkInterval);
					resolve();
					return;
				}

				const playbackTime = this.getPlaybackTime();
				if (timelineTime - playbackTime < targetAhead) {
					clearInterval(checkInterval);
					resolve();
				}
			}, 100);
		});
	}

	private disposeSinks(): void {
		for (const iterator of this.clipIterators.values()) {
			void iterator.return();
		}
		this.clipIterators.clear();
		this.activeClipIds.clear();

		for (const input of this.inputs.values()) {
			input.dispose();
		}
		this.inputs.clear();
		this.sinks.clear();
	}

	private async getAudioSink({
		clip,
	}: {
		clip: AudioClipSource;
	}): Promise<AudioBufferSink | null> {
		const existingSink = this.sinks.get(clip.sourceKey);
		if (existingSink) return existingSink;

		try {
			const input = new Input({
				source: new BlobSource(clip.file),
				formats: ALL_FORMATS,
			});
			const audioTrack = await input.getPrimaryAudioTrack();
			if (!audioTrack) {
				input.dispose();
				return null;
			}

			const sink = new AudioBufferSink(audioTrack);
			this.inputs.set(clip.sourceKey, input);
			this.sinks.set(clip.sourceKey, sink);
			return sink;
		} catch (error) {
			console.warn("Failed to initialize audio sink:", error);
			return null;
		}
	}
}
