import { create } from "zustand";
import type { ElementDragState, DropTarget } from "@/types/timeline";

export const initialDragState: ElementDragState = {
	isDragging: false,
	elementId: null,
	trackId: null,
	startMouseX: 0,
	startMouseY: 0,
	startElementTime: 0,
	clickOffsetTime: 0,
	currentTime: 0,
	currentMouseY: 0,
};

export interface TimelineDragStore {
	dragState: ElementDragState;
	dragDropTarget: DropTarget | null;
	setDragState: (state: ElementDragState | ((prev: ElementDragState) => ElementDragState)) => void;
	setDragDropTarget: (target: DropTarget | null) => void;
	endDrag: () => void;
}

export const useTimelineDragStore = create<TimelineDragStore>((set) => ({
	dragState: initialDragState,
	dragDropTarget: null,
	setDragState: (updater) =>
		set((state) => ({
			dragState: typeof updater === "function" ? updater(state.dragState) : updater,
		})),
	setDragDropTarget: (dragDropTarget) => set({ dragDropTarget }),
	endDrag: () => set({ dragState: initialDragState, dragDropTarget: null }),
}));
