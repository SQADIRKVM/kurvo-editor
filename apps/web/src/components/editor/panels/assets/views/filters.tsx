import { useMemo } from "react";
import { PanelView } from "@/components/editor/panels/assets/views/base-view";
import { DraggableItem } from "@/components/editor/panels/assets/draggable-item";
import { getAllEffects, EFFECT_TARGET_ELEMENT_TYPES } from "@/lib/effects";
import { useEditor } from "@/hooks/use-editor";
import { buildEffectElement } from "@/lib/timeline/element-utils";
import type { EffectDefinition } from "@/types/effects";
import { effectPreviewService, onPreviewImageReady } from "@/services/renderer/effect-preview";
import { useEffect, useRef, useCallback } from "react";

export function FiltersView() {
	const effects = getAllEffects();
	const filters = useMemo(() => 
		effects.filter(e => e.type.startsWith("filter-")), 
		[effects]
	);

	return (
		<PanelView title="Filters & LUTs">
			<FiltersGrid filters={filters} />
		</PanelView>
	);
}

function FiltersGrid({ filters }: { filters: EffectDefinition[] }) {
	return (
		<div
			className="grid gap-3 p-1"
			style={{ gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))" }}
		>
			{filters.map((filter) => (
				<FilterItem key={filter.type} filter={filter} />
			))}
		</div>
	);
}

function FilterPreviewCanvas({ effectType }: { effectType: string }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const render = () => {
			if (canvasRef.current) {
				effectPreviewService.renderPreview({
					effectType,
					params: {},
					targetCanvas: canvasRef.current,
				});
			}
		};

		render();
		return onPreviewImageReady({ callback: render });
	}, [effectType]);

	return <canvas ref={canvasRef} className="size-full object-cover" />;
}

function FilterItem({ filter }: { filter: EffectDefinition }) {
	const editor = useEditor();

	const handleAddToTimeline = useCallback(() => {
		const currentTime = editor.playback.getCurrentTime();
		const element = buildEffectElement({
			effectType: filter.type,
			startTime: currentTime,
		});

		editor.timeline.insertElement({
			placement: { mode: "auto", trackType: "effect" },
			element,
		});
	}, [editor, filter.type]);

	const preview = <FilterPreviewCanvas effectType={filter.type} />;

	return (
		<DraggableItem
			name={filter.name}
			preview={preview}
			dragData={{
				id: filter.type,
				name: filter.name,
				type: "effect",
				effectType: filter.type,
				targetElementTypes: EFFECT_TARGET_ELEMENT_TYPES,
			}}
			onAddToTimeline={handleAddToTimeline}
			aspectRatio={0.8}
			isRounded
			variant="card"
			containerClassName="w-full"
		/>
	);
}
