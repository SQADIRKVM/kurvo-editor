import type { TimelineTrack, TimelineElement } from "@/types/timeline";
import type { MediaAsset } from "@/types/assets";
import { RootNode } from "./nodes/root-node";
import { VideoNode } from "./nodes/video-node";
import { ImageNode } from "./nodes/image-node";
import { TextNode } from "./nodes/text-node";
import { StickerNode } from "./nodes/sticker-node";
import { ColorNode } from "./nodes/color-node";
import { CompositeEffectNode } from "./nodes/composite-effect-node";
import { EffectLayerNode } from "./nodes/effect-layer-node";
import { TransitionNode } from "./nodes/transition-node";
import type { BaseNode } from "./nodes/base-node";
import type { TBackground, TCanvasSize } from "@/types/project";
import { DEFAULT_BLUR_INTENSITY } from "@/constants/project-constants";
import { isMainTrack } from "@/lib/timeline";

const PREVIEW_MAX_IMAGE_SIZE = 2048;
const BLUR_BACKGROUND_ZOOM_SCALE = 1.4;

function getVisibleSortedElements({
	track,
}: {
	track: TimelineTrack;
}) {
	return track.elements
		.filter((element) => !("hidden" in element && element.hidden))
		.slice()
		.sort((a, b) => {
			if (a.startTime !== b.startTime) return a.startTime - b.startTime;
			return a.id.localeCompare(b.id);
		});
}

function createNodeForElement(
	element: TimelineElement,
	mediaMap: Map<string, MediaAsset>,
	canvasSize: TCanvasSize,
	isPreview?: boolean
): BaseNode | null {
	if (element.type === "effect") {
		return new EffectLayerNode({
			effectType: element.effectType,
			effectParams: element.params,
			timeOffset: element.startTime,
			duration: element.duration,
		});
	}

	if (element.type === "video" || element.type === "image") {
		const mediaAsset = mediaMap.get(element.mediaId);
		if (!mediaAsset?.file || !mediaAsset?.url) {
			return null;
		}

		if (mediaAsset.type === "video") {
			return new VideoNode({
				mediaId: mediaAsset.id,
				url: mediaAsset.url,
				file: mediaAsset.file,
				duration: element.duration,
				timeOffset: element.startTime,
				trimStart: element.trimStart,
				trimEnd: element.trimEnd,
				transform: element.transform,
				animations: element.animations,
				opacity: element.opacity,
				blendMode: element.blendMode,
				effects: element.effects,
				canvasFormat: "canvasFormat" in element ? element.canvasFormat : undefined,
			});
		}
		if (mediaAsset.type === "image") {
			return new ImageNode({
				url: mediaAsset.url,
				duration: element.duration,
				timeOffset: element.startTime,
				trimStart: element.trimStart,
				trimEnd: element.trimEnd,
				transform: element.transform,
				animations: element.animations,
				opacity: element.opacity,
				blendMode: element.blendMode,
				effects: element.effects,
				canvasFormat: "canvasFormat" in element ? element.canvasFormat : undefined,
				...(isPreview && {
					maxSourceSize: PREVIEW_MAX_IMAGE_SIZE,
				}),
			});
		}
	}

	if (element.type === "text") {
		return new TextNode({
			...element,
			canvasCenter: { x: canvasSize.width / 2, y: canvasSize.height / 2 },
			canvasHeight: canvasSize.height,
			textBaseline: "middle",
			effects: element.effects,
		});
	}

	if (element.type === "sticker") {
		return new StickerNode({
			stickerId: element.stickerId,
			duration: element.duration,
			timeOffset: element.startTime,
			trimStart: element.trimStart,
			trimEnd: element.trimEnd,
			transform: element.transform,
			animations: element.animations,
			opacity: element.opacity,
			blendMode: element.blendMode,
			effects: element.effects,
		});
	}

	return null;
}

function buildTrackNodes({
	tracks,
	mediaMap,
	canvasSize,
	isPreview,
}: {
	tracks: TimelineTrack[];
	mediaMap: Map<string, MediaAsset>;
	canvasSize: TCanvasSize;
	isPreview?: boolean;
}): BaseNode[] {
	const nodes: BaseNode[] = [];
	const handledElementIds = new Set<string>();

	for (const track of tracks) {
		const elements = getVisibleSortedElements({ track });

		for (const element of elements) {
			if (handledElementIds.has(element.id)) continue;

			if (element.type === "transition") {
				const mainTrack = tracks.find(isMainTrack);
				if (mainTrack) {
					const center = element.startTime + element.duration / 2;
					const tStart = element.startTime;
					const tEnd = element.startTime + element.duration;

					// Find the clip that ends around the transition center (outgoing clip)
					// and the clip that starts around the transition center (incoming clip)
					const fromElement = mainTrack.elements.find(
						(e) => e.id !== element.id && e.startTime < center && (e.startTime + e.duration) > tStart
					);
					const toElement = mainTrack.elements.find(
						(e) => e.id !== element.id && e.id !== fromElement?.id && e.startTime < tEnd && (e.startTime + e.duration) > center
					);

					console.log("[SceneBuilder] Transition:", element.transitionType,
						"startTime:", tStart, "dur:", element.duration, "center:", center,
						"| fromEl:", fromElement?.id ?? "NONE",
						"| toEl:", toElement?.id ?? "NONE",
						"| mainTrackEls:", mainTrack.elements.map(e => `${e.id}(${e.startTime}-${e.startTime + e.duration})`).join(", ")
					);

					if (fromElement && toElement) {
						const fromNode = createNodeForElement(fromElement, mediaMap, canvasSize, isPreview);
						const toNode = createNodeForElement(toElement, mediaMap, canvasSize, isPreview);

						if (fromNode && toNode) {
							// Tell both nodes to hide themselves specifically during the transition interval
							// so they don't double-render against the transition's own internal render.
							fromNode.addHiddenRange({ start: element.startTime, end: element.startTime + element.duration });
							toNode.addHiddenRange({ start: element.startTime, end: element.startTime + element.duration });

							nodes.push(
								new TransitionNode({
									fromNode,
									toNode,
									startTime: element.startTime,
									duration: element.duration,
									transitionType: element.transitionType,
								})
							);
							handledElementIds.add(element.id);
							continue;
						}
					}
				}
			}

			const node = createNodeForElement(element, mediaMap, canvasSize, isPreview);
			if (node) {
				nodes.push(node);
				handledElementIds.add(element.id);
			}
		}
	}

	return nodes;
}

export type BuildSceneParams = {
	canvasSize: TCanvasSize;
	tracks: TimelineTrack[];
	mediaAssets: MediaAsset[];
	duration: number;
	background: TBackground;
	isPreview?: boolean;
};

export function buildScene({
	canvasSize,
	tracks,
	mediaAssets,
	duration,
	background,
	isPreview,
}: BuildSceneParams) {
	const rootNode = new RootNode({ duration });
	const mediaMap = new Map(mediaAssets.map((m) => [m.id, m]));

	const visibleTracks = tracks.filter(
		(track) => !("hidden" in track && track.hidden),
	);

	const orderedTracksTopToBottom = [
		...visibleTracks.filter((track) => !isMainTrack(track)),
		...visibleTracks.filter((track) => isMainTrack(track)),
	];

	const orderedTracksBottomToTop = orderedTracksTopToBottom.slice().reverse();

	const allNodes = buildTrackNodes({
		tracks: orderedTracksBottomToTop,
		mediaMap,
		canvasSize,
		isPreview,
	});

	if (background.type === "blur") {
		rootNode.add(
			new CompositeEffectNode({
				contentNodes: allNodes.filter(
					(node) => !(node instanceof EffectLayerNode),
				),
				effectType: "blur",
				effectParams: {
					intensity:
						background.blurIntensity ?? DEFAULT_BLUR_INTENSITY,
				},
				scale: BLUR_BACKGROUND_ZOOM_SCALE,
			}),
		);
	} else if (background.type === "color" && background.color !== "transparent") {
		rootNode.add(new ColorNode({ color: background.color }));
	}

	for (const node of allNodes) {
		rootNode.add(node);
	}

	return rootNode;
}
