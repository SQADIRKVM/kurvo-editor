import { BaseNode } from "./base-node";
import type { CanvasRenderer } from "../canvas-renderer";
import { createOffscreenCanvas } from "../canvas-utils";

export type TransitionNodeParams = {
	fromNode: BaseNode;
	toNode: BaseNode;
	startTime: number;
	duration: number;
	transitionType: string;
};

export class TransitionNode extends BaseNode<TransitionNodeParams> {
	private bufferA: OffscreenCanvas | HTMLCanvasElement | null = null;
	private bufferB: OffscreenCanvas | HTMLCanvasElement | null = null;

	async render({ renderer, time }: { renderer: CanvasRenderer; time: number }) {
		const { fromNode, toNode, startTime, duration, transitionType } = this.params;
		
		// If outside duration, render either from or to
		if (time <= startTime) {
			await fromNode.render({ renderer, time });
			return;
		}
		if (time >= startTime + duration) {
			await toNode.render({ renderer, time });
			return;
		}

		const progress = Math.max(0, Math.min(1, (time - startTime) / duration));

		// Reuse or create buffers
		if (!this.bufferA || this.bufferA.width !== renderer.width || this.bufferA.height !== renderer.height) {
			this.bufferA = createOffscreenCanvas({ width: renderer.width, height: renderer.height });
		}
		if (!this.bufferB || this.bufferB.width !== renderer.width || this.bufferB.height !== renderer.height) {
			this.bufferB = createOffscreenCanvas({ width: renderer.width, height: renderer.height });
		}

		const ctxA = this.bufferA.getContext("2d") as OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;
		const ctxB = this.bufferB.getContext("2d") as OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;
		if (!ctxA || !ctxB) return;

		const originalContext = renderer.context;

		// Clear buffers
		ctxA.clearRect(0, 0, renderer.width, renderer.height);
		ctxB.clearRect(0, 0, renderer.width, renderer.height);

		// Render "From" node to buffer A
		renderer.context = ctxA as any;
		await fromNode.render({ renderer, time, ignoreHidden: true });

		// Render "To" node to buffer B
		renderer.context = ctxB as any;
		await toNode.render({ renderer, time, ignoreHidden: true });

		renderer.context = originalContext;

		// Blend them to the main canvas
		renderer.context.save();
		
		if (transitionType === "fade-black" || transitionType === "fade-white") {
			const color = transitionType === "fade-black" ? "black" : "white";
			if (progress < 0.5) {
				const localP = progress * 2;
				renderer.context.drawImage(this.bufferA, 0, 0);
				renderer.context.fillStyle = color;
				renderer.context.globalAlpha = localP;
				renderer.context.fillRect(0, 0, renderer.width, renderer.height);
			} else {
				const localP = (progress - 0.5) * 2;
				renderer.context.fillStyle = color;
				renderer.context.fillRect(0, 0, renderer.width, renderer.height);
				renderer.context.globalAlpha = 1 - localP;
				renderer.context.drawImage(this.bufferB, 0, 0);
			}
		} else if (transitionType.startsWith("wipe-")) {
			const dir = transitionType.split("-")[1];
			renderer.context.drawImage(this.bufferA, 0, 0);
			
			renderer.context.save();
			renderer.context.beginPath();
			if (dir === "left") renderer.context.rect(renderer.width * (1 - progress), 0, renderer.width * progress, renderer.height);
			else if (dir === "right") renderer.context.rect(0, 0, renderer.width * progress, renderer.height);
			else if (dir === "up") renderer.context.rect(0, renderer.height * (1 - progress), renderer.width, renderer.height * progress);
			else if (dir === "down") renderer.context.rect(0, 0, renderer.width, renderer.height * progress);
			renderer.context.clip();
			
			renderer.context.drawImage(this.bufferB, 0, 0);
			renderer.context.restore();
		} else if (transitionType.startsWith("slide-")) {
			const dir = transitionType.split("-")[1];
			if (dir === "left") {
				renderer.context.drawImage(this.bufferA, -renderer.width * progress, 0);
				renderer.context.drawImage(this.bufferB, renderer.width * (1 - progress), 0);
			} else if (dir === "right") {
				renderer.context.drawImage(this.bufferA, renderer.width * progress, 0);
				renderer.context.drawImage(this.bufferB, -renderer.width * (1 - progress), 0);
			} else if (dir === "up") {
				renderer.context.drawImage(this.bufferA, 0, -renderer.height * progress);
				renderer.context.drawImage(this.bufferB, 0, renderer.height * (1 - progress));
			} else if (dir === "down") {
				renderer.context.drawImage(this.bufferA, 0, renderer.height * progress);
				renderer.context.drawImage(this.bufferB, 0, -renderer.height * (1 - progress));
			}
		} else if (transitionType.startsWith("circle-")) {
			const isClose = transitionType === "circle-close";
			const maxRadius = Math.sqrt(Math.pow(renderer.width, 2) + Math.pow(renderer.height, 2)) / 2;
			const currentR = isClose ? maxRadius * (1 - progress) : maxRadius * progress;
			
			renderer.context.drawImage(this.bufferA, 0, 0);
			renderer.context.save();
			renderer.context.beginPath();
			renderer.context.arc(renderer.width / 2, renderer.height / 2, currentR, 0, Math.PI * 2);
			renderer.context.clip();
			renderer.context.drawImage(this.bufferB, 0, 0);
			renderer.context.restore();
		} else if (transitionType === "zoom-in") {
			renderer.context.drawImage(this.bufferA, 0, 0);
			renderer.context.globalAlpha = progress;
			const scale = 0.5 + 0.5 * progress;
			const w = renderer.width * scale;
			const h = renderer.height * scale;
			renderer.context.drawImage(this.bufferB, (renderer.width - w) / 2, (renderer.height - h) / 2, w, h);
		} else if (transitionType === "zoom-out") {
			renderer.context.drawImage(this.bufferB, 0, 0);
			renderer.context.globalAlpha = 1 - progress;
			const scale = 1 + progress;
			const w = renderer.width * scale;
			const h = renderer.height * scale;
			renderer.context.drawImage(this.bufferA, (renderer.width - w) / 2, (renderer.height - h) / 2, w, h);
		} else {
			// Default: Cross Fade
			renderer.context.globalAlpha = 1 - progress;
			renderer.context.drawImage(this.bufferA, 0, 0);
			renderer.context.globalAlpha = progress;
			renderer.context.drawImage(this.bufferB, 0, 0);
		}

		renderer.context.restore();
	}
}
