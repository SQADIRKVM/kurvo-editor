import { Command } from "@/lib/commands/base-command";
import type { TimelineTrack, AudioElement, VideoElement } from "@/types/timeline";
import { canElementHaveAudio } from "@/lib/timeline/element-utils";
import { EditorCore } from "@/core";

export class DetachAudioCommand extends Command {
	private savedState: TimelineTrack[] | null = null;

	constructor(private elements: { trackId: string; elementId: string }[]) {
		super();
	}

	execute(): void {
		const editor = EditorCore.getInstance();
		this.savedState = editor.timeline.getTracks();

		let updatedTracks = [...this.savedState];

		for (const { trackId, elementId } of this.elements) {
			const track = updatedTracks.find((t) => t.id === trackId);
			const element = track?.elements.find((e) => e.id === elementId) as VideoElement;

			if (!element || !canElementHaveAudio(element) || element.type !== "video") {
				continue;
			}

			// 1. Mute the video element
			updatedTracks = updatedTracks.map((t) => {
				if (t.id !== trackId) return t;
				return {
					...t,
					elements: t.elements.map((e) => 
						e.id === elementId ? { ...e, muted: true } : e
					)
				};
			}) as TimelineTrack[];

			// 2. Create audio element
			const audioElement: AudioElement = {
				id: crypto.randomUUID(),
				name: `${element.name} (Audio)`,
				type: "audio",
				mediaId: element.mediaId,
				sourceType: "upload",
				startTime: element.startTime,
				duration: element.duration,
				trimStart: element.trimStart,
				trimEnd: element.trimEnd,
				volume: 1,
				muted: false,
				animations: { channels: {} },
			};

			// 3. Find or create an audio track
			let audioTrack = updatedTracks.find(t => t.type === "audio");
			if (!audioTrack) {
				const newTrackId = crypto.randomUUID();
				audioTrack = {
					id: newTrackId,
					type: "audio",
					name: "Audio 1",
					elements: [],
					muted: false,
				} as any;
				updatedTracks.push(audioTrack as TimelineTrack);
			}

			// 4. Add audio element to track
			const targetTrackId = (audioTrack as any).id;
			updatedTracks = updatedTracks.map(t => {
				if (t.id !== targetTrackId) return t;
				return {
					...t,
					elements: [...t.elements, audioElement]
				};
			}) as TimelineTrack[];
		}

		editor.timeline.updateTracks(updatedTracks);
	}

	undo(): void {
		if (this.savedState) {
			const editor = EditorCore.getInstance();
			editor.timeline.updateTracks(this.savedState);
		}
	}
}
