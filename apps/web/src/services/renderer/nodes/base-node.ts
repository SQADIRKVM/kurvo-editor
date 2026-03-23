import type { CanvasRenderer } from "../canvas-renderer";

export type BaseNodeParams = object | undefined;

export class BaseNode<Params extends BaseNodeParams = BaseNodeParams> {
	params: Params;

	constructor(params?: Params) {
		this.params = params ?? ({} as Params);
	}

	hiddenRanges: { start: number; end: number }[] = [];

	addHiddenRange(range: { start: number; end: number }) {
		this.hiddenRanges.push(range);
	}

	isShowingAt(time: number): boolean {
		return !this.hiddenRanges.some((r) => time >= r.start && time < r.end);
	}

	children: BaseNode[] = [];

	add(child: BaseNode) {
		this.children.push(child);
		return this;
	}

	remove(child: BaseNode) {
		this.children = this.children.filter((c) => c !== child);
		return this;
	}

	async render({
		renderer,
		time,
		ignoreHidden,
	}: {
		renderer: CanvasRenderer;
		time: number;
		ignoreHidden?: boolean;
	}): Promise<void> {
		if (!ignoreHidden && !this.isShowingAt(time)) return;
		for (const child of this.children) {
			await child.render({ renderer, time, ignoreHidden });
		}
	}
}
