import type { CanvasRenderer } from "../canvas-renderer";
import { createOffscreenCanvas } from "../canvas-utils";
import { BaseNode } from "./base-node";
import type { Effect } from "@/types/effects";
import type { BlendMode } from "@/types/rendering";
import type { Transform, CanvasFormat, ChromaKeyConfig } from "@/types/timeline";
import type { ElementAnimations } from "@/types/animation";
import {
	getElementLocalTime,
	resolveOpacityAtTime,
	resolveTransformAtTime,
} from "@/lib/animation";
import { resolveEffectParamsAtTime } from "@/lib/animation/effect-param-channel";
import { TIME_EPSILON_SECONDS } from "@/constants/animation-constants";
import { getEffect } from "@/lib/effects";
import { webglEffectRenderer } from "../webgl-effect-renderer";

export interface VisualNodeParams {
	duration: number;
	timeOffset: number;
	trimStart: number;
	trimEnd: number;
	transform: Transform;
	animations?: ElementAnimations;
	opacity: number;
	blendMode?: BlendMode;
	effects?: Effect[];
	canvasFormat?: CanvasFormat;
	chromaKey?: ChromaKeyConfig;
}

export abstract class VisualNode<
	Params extends VisualNodeParams = VisualNodeParams,
> extends BaseNode<Params> {
	protected getSourceLocalTime({ time }: { time: number }): number {
		return time - this.params.timeOffset + this.params.trimStart;
	}

	protected getAnimationLocalTime({ time }: { time: number }): number {
		return getElementLocalTime({
			timelineTime: time,
			elementStartTime: this.params.timeOffset,
			elementDuration: this.params.duration,
		});
	}

	protected isInRange({ time }: { time: number }): boolean {
		const localTime = this.getSourceLocalTime({ time });
		return (
			localTime >= this.params.trimStart - TIME_EPSILON_SECONDS &&
			localTime < this.params.trimStart + this.params.duration
		);
	}

	protected renderVisual({
		renderer,
		source,
		sourceWidth,
		sourceHeight,
		timelineTime,
	}: {
		renderer: CanvasRenderer;
		source: CanvasImageSource;
		sourceWidth: number;
		sourceHeight: number;
		timelineTime: number;
	}): void {
		renderer.context.save();

		const animationLocalTime = this.getAnimationLocalTime({ time: timelineTime });
		const transform = resolveTransformAtTime({
			baseTransform: this.params.transform,
			animations: this.params.animations,
			localTime: animationLocalTime,
		});
		const opacity = resolveOpacityAtTime({
			baseOpacity: this.params.opacity,
			animations: this.params.animations,
			localTime: animationLocalTime,
		});
		const containScale = Math.min(
			renderer.width / sourceWidth,
			renderer.height / sourceHeight,
		);
		const scaledWidth = sourceWidth * containScale * transform.scale;
		const scaledHeight = sourceHeight * containScale * transform.scale;
		const x = renderer.width / 2 + transform.position.x - scaledWidth / 2;
		const y = renderer.height / 2 + transform.position.y - scaledHeight / 2;

		renderer.context.globalCompositeOperation = (
			this.params.blendMode && this.params.blendMode !== "normal"
				? this.params.blendMode
				: "source-over"
		) as GlobalCompositeOperation;
		renderer.context.globalAlpha = opacity;

		if (this.params.canvasFormat) {
			renderer.context.save();
			if (this.params.canvasFormat.type === "color" && this.params.canvasFormat.color) {
				renderer.context.fillStyle = this.params.canvasFormat.color;
				renderer.context.fillRect(0, 0, renderer.width, renderer.height);
			} else if (this.params.canvasFormat.type === "blur" && this.params.canvasFormat.blurLevel) {
				const fillScale = Math.max(
					renderer.width / sourceWidth,
					renderer.height / sourceHeight,
				);
				const fillWidth = sourceWidth * fillScale;
				const fillHeight = sourceHeight * fillScale;
				const fillX = renderer.width / 2 - fillWidth / 2;
				const fillY = renderer.height / 2 - fillHeight / 2;
				renderer.context.filter = `blur(${this.params.canvasFormat.blurLevel}px)`;
				renderer.context.drawImage(source, fillX, fillY, fillWidth, fillHeight);
			}
			renderer.context.restore();
		}

		if (transform.rotate !== 0) {
			const centerX = x + scaledWidth / 2;
			const centerY = y + scaledHeight / 2;
			renderer.context.translate(centerX, centerY);
			renderer.context.rotate((transform.rotate * Math.PI) / 180);
			renderer.context.translate(-centerX, -centerY);
		}

		const enabledEffects =
			this.params.effects?.filter((effect) => effect.enabled) ?? [];

		if (enabledEffects.length === 0) {
			// Draw source (with optional chroma key masking)
			if (this.params.chromaKey) {
				renderer.context.drawImage(
					applyChromaKey({ source, width: Math.round(scaledWidth), height: Math.round(scaledHeight), chromaKey: this.params.chromaKey }),
					x, y, scaledWidth, scaledHeight,
				);
			} else {
				renderer.context.drawImage(source, x, y, scaledWidth, scaledHeight);
			}
			renderer.context.restore();
			return;
		}

		const elementCanvas = createOffscreenCanvas({
			width: Math.round(scaledWidth),
			height: Math.round(scaledHeight),
		});
		const elementCtx = elementCanvas.getContext("2d") as
			| CanvasRenderingContext2D
			| OffscreenCanvasRenderingContext2D
			| null;
		if (!elementCtx) {
			renderer.context.drawImage(source, x, y, scaledWidth, scaledHeight);
			renderer.context.restore();
			return;
		}

		elementCtx.drawImage(source, 0, 0, scaledWidth, scaledHeight);

		let currentResult: CanvasImageSource = elementCanvas;

		for (const effect of enabledEffects) {
			const resolvedParams = resolveEffectParamsAtTime({
				effect,
				animations: this.params.animations,
				localTime: animationLocalTime,
			});
			const definition = getEffect({ effectType: effect.type });
			const passes = definition.renderer.passes.map((pass) => ({
				fragmentShader: pass.fragmentShader,
				uniforms: pass.uniforms({
					effectParams: resolvedParams,
					width: scaledWidth,
					height: scaledHeight,
				}),
			}));
			currentResult = webglEffectRenderer.applyEffect({
				source: currentResult,
				width: Math.round(scaledWidth),
				height: Math.round(scaledHeight),
				passes,
			});
		}

		renderer.context.drawImage(
			this.params.chromaKey
				? applyChromaKey({ source: currentResult, width: Math.round(scaledWidth), height: Math.round(scaledHeight), chromaKey: this.params.chromaKey })
				: currentResult,
			x,
			y,
			scaledWidth,
			scaledHeight,
		);
		renderer.context.restore();
	}
}

// ─── Chroma Key Helper ────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
	const clean = hex.replace("#", "");
	const r = parseInt(clean.substring(0, 2), 16);
	const g = parseInt(clean.substring(2, 4), 16);
	const b = parseInt(clean.substring(4, 6), 16);
	return [r, g, b];
}

function applyChromaKey({
	source,
	width,
	height,
	chromaKey,
}: {
	source: CanvasImageSource;
	width: number;
	height: number;
	chromaKey: ChromaKeyConfig;
}): HTMLCanvasElement {
	const offscreen = document.createElement("canvas");
	offscreen.width = width;
	offscreen.height = height;
	const ctx = offscreen.getContext("2d")!;
	ctx.drawImage(source, 0, 0, width, height);

	const imageData = ctx.getImageData(0, 0, width, height);
	const data = imageData.data;

	const [kr, kg, kb] = hexToRgb(chromaKey.color);
	const simThreshold = chromaKey.similarity / 100; // 0..1
	const smoothRange = chromaKey.smoothness / 100 * 0.2; // soft feather amount

	for (let i = 0; i < data.length; i += 4) {
		const r = data[i]!;
		const g = data[i + 1]!;
		const b = data[i + 2]!;

		// Normalised Euclidean distance in RGB space
		const dist = Math.sqrt(
			((r - kr) / 255) ** 2 +
			((g - kg) / 255) ** 2 +
			((b - kb) / 255) ** 2,
		) / Math.sqrt(3); // Normalize to 0..1 range

		if (dist < simThreshold) {
			// Fully transparent or feathered
			if (smoothRange > 0 && dist > simThreshold - smoothRange) {
				const t = (dist - (simThreshold - smoothRange)) / smoothRange;
				data[i + 3] = Math.round(255 * t);
			} else {
				data[i + 3] = 0;
			}
		}
	}

	ctx.putImageData(imageData, 0, 0);
	return offscreen;
}
