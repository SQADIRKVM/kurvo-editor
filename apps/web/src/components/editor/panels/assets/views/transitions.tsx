"use client";

import { PanelView } from "@/components/editor/panels/assets/views/base-view";
import { DraggableItem } from "@/components/editor/panels/assets/draggable-item";
import { useCallback } from "react";
import { useEditor } from "@/hooks/use-editor";
import { TransitionType, TransitionDefinition } from "@/types/transitions";
import { TransitionElement, CreateTransitionElement } from "@/types/timeline";
import { cn } from "@/utils/ui";

function TransitionIcon({ type, className }: { type: TransitionType; className?: string }) {
	const Icon = (() => {
		if (type.includes("fade")) return SquareIcon;
		if (type.includes("wipe")) return SquareIcon;
		if (type.includes("slide")) return SquareIcon;
		if (type.includes("smooth")) return SquareIcon;
		if (type.includes("circle")) return CircleIcon;
		if (type.includes("zoom")) return SquareIcon;
		return SquareIcon;
	})();

	return <Icon className={className} />;
}

function SquareIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
			<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
		</svg>
	);
}

function CircleIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
			<circle cx="12" cy="12" r="10" />
		</svg>
	);
}

const TRANSITIONS: TransitionDefinition[] = [
	// Basic
	{ type: "fade", name: "Fade", duration: 1 },
	{ type: "cross-fade", name: "Cross Fade", duration: 1 },
	{ type: "dissolve", name: "Dissolve", duration: 1 },
	{ type: "fade-black", name: "Fade to Black", duration: 1 },
	{ type: "fade-white", name: "Fade to White", duration: 1 },
	
	// Wipes
	{ type: "wipe-left", name: "Wipe Left", duration: 1 },
	{ type: "wipe-right", name: "Wipe Right", duration: 1 },
	{ type: "wipe-up", name: "Wipe Up", duration: 1 },
	{ type: "wipe-down", name: "Wipe Down", duration: 1 },
	{ type: "wipe-tl", name: "Wipe Top-Left", duration: 1 },
	{ type: "wipe-tr", name: "Wipe Top-Right", duration: 1 },
	
	// Slides
	{ type: "slide-left", name: "Slide Left", duration: 1 },
	{ type: "slide-right", name: "Slide Right", duration: 1 },
	{ type: "slide-up", name: "Slide Up", duration: 1 },
	{ type: "slide-down", name: "Slide Down", duration: 1 },
	
	// Smooth
	{ type: "smooth-left", name: "Smooth Left", duration: 1 },
	{ type: "smooth-right", name: "Smooth Right", duration: 1 },
	{ type: "smooth-up", name: "Smooth Up", duration: 1 },
	{ type: "smooth-down", name: "Smooth Down", duration: 1 },
	
	// Shapes
	{ type: "circle-open", name: "Circle Open", duration: 1 },
	{ type: "circle-close", name: "Circle Close", duration: 1 },
	{ type: "horz-open", name: "Horz Open", duration: 1 },
	{ type: "horz-close", name: "Horz Close", duration: 1 },
	{ type: "vert-open", name: "Vert Open", duration: 1 },
	{ type: "vert-close", name: "Vert Close", duration: 1 },
	
	// Special
	{ type: "zoom-in", name: "Zoom In", duration: 1 },
	{ type: "zoom-out", name: "Zoom Out", duration: 1 },
	{ type: "glitch", name: "Glitch", duration: 0.5 },
	{ type: "pixelize", name: "Pixelize", duration: 1 },
	{ type: "radial", name: "Radial", duration: 1 },
	{ type: "hblur", name: "H-Blur", duration: 1 },
	{ type: "squeeze-h", name: "Squeeze H", duration: 1 },
	{ type: "squeeze-v", name: "Squeeze V", duration: 1 },
];

export function TransitionsView() {
	return (
		<PanelView title="Transitions">
			<div
				className="grid gap-2"
				style={{ gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))" }}
			>
				{TRANSITIONS.map((transition) => (
					<TransitionItem key={transition.type} transition={transition} />
				))}
			</div>
		</PanelView>
	);
}

function TransitionItem({ transition }: { transition: TransitionDefinition }) {
	const editor = useEditor();

	const handleAddToTimeline = useCallback(() => {
		const currentTime = editor.playback.getCurrentTime();

		let tracks: ReturnType<typeof editor.scenes.getActiveScene>["tracks"] = [];
		try {
			tracks = editor.scenes.getActiveScene().tracks;
		} catch {
			return; // no active scene - bail
		}

		// Find the main video track id and elements
		const mainTrack = tracks.find(
			(t): t is Extract<typeof t, { type: "video" }> & { isMain: boolean } =>
				t.type === "video" && (t as { isMain?: boolean }).isMain === true
		);

		if (!mainTrack || mainTrack.elements.length === 0) {
			console.warn("[Transitions] No main track or no clips found");
			return;
		}

		const sorted = [...mainTrack.elements].sort((a, b) => a.startTime - b.startTime);

		// ── CASE 1: Find an existing cut point near the playhead ────────────────
		let bestCutTime = -1;
		let bestDist = Infinity;
		for (let i = 0; i < sorted.length - 1; i++) {
			const cutTime = sorted[i].startTime + sorted[i].duration;
			const dist = Math.abs(cutTime - currentTime);
			if (dist < bestDist) {
				bestDist = dist;
				bestCutTime = cutTime;
			}
		}

		// If we found a cut within 5 seconds, use it directly
		if (bestCutTime >= 0 && bestDist < 5) {
			const halfDur = transition.duration / 2;
			const transitionStartTime = Math.max(0, bestCutTime - halfDur);
			console.log("[Transitions] Using existing cut at", bestCutTime);
			editor.timeline.insertElement({
				placement: { mode: "auto", trackType: "transition" },
				element: {
					name: transition.name,
					type: "transition",
					transitionType: transition.type,
					duration: transition.duration,
					startTime: transitionStartTime,
					trimStart: 0,
					trimEnd: 0,
					params: {}
				} as CreateTransitionElement
			});
			return;
		}

		// ── CASE 2: Auto-split the clip at the playhead (CapCut style) ──────────
		// Find which clip the playhead is inside
		const clipUnderPlayhead = sorted.find(
			(e) => currentTime > e.startTime && currentTime < e.startTime + e.duration
		);

		if (!clipUnderPlayhead) {
			console.warn("[Transitions] Playhead is not inside any clip. Move playhead into a video clip first.");
			return;
		}

		// Ensure the playhead isn't too close to either end (need room for the transition)
		const clipEnd = clipUnderPlayhead.startTime + clipUnderPlayhead.duration;
		const minDistFromEdge = transition.duration / 2 + 0.05;
		if (
			currentTime - clipUnderPlayhead.startTime < minDistFromEdge ||
			clipEnd - currentTime < minDistFromEdge
		) {
			console.warn("[Transitions] Playhead too close to clip edge to add transition");
			return;
		}

		console.log("[Transitions] Auto-splitting clip", clipUnderPlayhead.id, "at", currentTime, "and adding", transition.type);

		// Split the clip at the current playhead
		editor.timeline.splitElements({
			elements: [{ trackId: mainTrack.id, elementId: clipUnderPlayhead.id }],
			splitTime: currentTime,
		});

		// After splitting, insert the transition centered on the split point
		const halfDur = transition.duration / 2;
		const transitionStartTime = Math.max(0, currentTime - halfDur);

		editor.timeline.insertElement({
			placement: { mode: "auto", trackType: "transition" },
			element: {
				name: transition.name,
				type: "transition",
				transitionType: transition.type,
				duration: transition.duration,
				startTime: transitionStartTime,
				trimStart: 0,
				trimEnd: 0,
				params: {}
			} as CreateTransitionElement
		});
	}, [editor, transition]);

	return (
		<DraggableItem
			name={transition.name}
			preview={
				<div className="relative size-full overflow-hidden rounded-lg group">
					<img 
						src="/effects/preview.jpg" 
						alt="" 
						className="size-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-500 blur-[1px]"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
					<div className="absolute inset-0 flex flex-col items-center justify-center p-2">
						<div className="mb-1 rounded-full bg-violet-500/20 p-1.5 ring-1 ring-violet-500/40 group-hover:bg-violet-500/40 transition-colors shadow-lg shadow-violet-500/20">
							<TransitionIcon type={transition.type} className="size-4 text-violet-100" />
						</div>
						<span className="text-[10px] font-bold text-violet-200 uppercase tracking-tighter drop-shadow-md">
							{transition.type.split('-').pop()}
						</span>
					</div>
				</div>
			}
			dragData={{
				id: transition.type,
				name: transition.name,
				type: "transition",
				transitionType: transition.type,
			}}
			onAddToTimeline={handleAddToTimeline}
			aspectRatio={1}
			isRounded
			variant="card"
			containerClassName="w-full"
		/>
	);
}
