import { getDropLineY } from "@/lib/timeline/drop-utils";
import type { TimelineTrack, DropTarget } from "@/types/timeline";
import { useTimelineDragStore } from "@/stores/timeline-drag-store";

interface DragLineProps {
	dropTarget?: DropTarget | null;
	tracks: TimelineTrack[];
	isVisible?: boolean;
	headerHeight?: number;
	useDragStore?: boolean;
}

export function DragLine({
	dropTarget: explicitDropTarget,
	tracks,
	isVisible: explicitIsVisible,
	headerHeight = 0,
	useDragStore = false,
}: DragLineProps) {
	const storeIsVisible = useTimelineDragStore((s) => s.dragState.isDragging);
	const storeDropTarget = useTimelineDragStore((s) => s.dragDropTarget);

	const isVisible = useDragStore ? storeIsVisible : explicitIsVisible;
	const dropTarget = useDragStore ? storeDropTarget : explicitDropTarget;

	if (!isVisible || !dropTarget) return null;

	const y = getDropLineY({ dropTarget, tracks });
	const lineTop = y + headerHeight;

	return (
		<div
			className="bg-primary pointer-events-none absolute right-0 left-0 h-0.5"
			style={{ top: `${lineTop}px` }}
		/>
	);
}
