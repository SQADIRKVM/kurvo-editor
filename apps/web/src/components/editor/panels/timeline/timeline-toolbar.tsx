import { useEditor } from "@/hooks/use-editor";
import {
	TooltipProvider,
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { SplitSquareHorizontal } from "lucide-react";
import {
	SplitButton,
	SplitButtonLeft,
	SplitButtonRight,
	SplitButtonSeparator,
} from "@/components/ui/split-button";
import { Slider } from "@/components/ui/slider";
import { TIMELINE_CONSTANTS } from "@/constants/timeline-constants";
import { sliderToZoom, zoomToSlider } from "@/lib/timeline/zoom-utils";
import { ScenesView } from "../../scenes-view";
import { type TAction, invokeAction } from "@/lib/actions";
import { cn } from "@/utils/ui";
import { useTimelineStore } from "@/stores/timeline-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useElementSelection } from "@/hooks/timeline/element/use-element-selection";
import {
	Bookmark02Icon,
	Delete02Icon,
	SnowIcon,
	ScissorIcon,
	MagnetIcon,
	Link04Icon,
	SearchAddIcon,
	SearchMinusIcon,
	Copy01Icon,
	AlignLeftIcon,
	AlignRightIcon,
	Layers01Icon,
	HeadphonesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { canElementHaveAudio } from "@/lib/timeline/element-utils";
import { useCurrentTime } from "@/hooks/use-current-time";
import { useFreezeFrame } from "@/hooks/use-freeze-frame";

export function TimelineToolbar({
	zoomLevel,
	minZoom,
	setZoomLevel,
}: {
	zoomLevel: number;
	minZoom: number;
	setZoomLevel: ({ zoom }: { zoom: number }) => void;
}) {
	const handleZoom = ({ direction }: { direction: "in" | "out" }) => {
		const newZoomLevel =
			direction === "in"
				? Math.min(
						TIMELINE_CONSTANTS.ZOOM_MAX,
						zoomLevel * TIMELINE_CONSTANTS.ZOOM_BUTTON_FACTOR,
					)
				: Math.max(minZoom, zoomLevel / TIMELINE_CONSTANTS.ZOOM_BUTTON_FACTOR);
		setZoomLevel({ zoom: newZoomLevel });
	};

	return (
		<TooltipProvider delayDuration={500}>
			<div className="flex h-12 items-center justify-between border-b border-white/5 px-4 bg-black/20 backdrop-blur-md">
				<ToolbarLeftSection />
				<SceneSelector />
				<ToolbarRightSection
					zoomLevel={zoomLevel}
					minZoom={minZoom}
					onZoomChange={(zoom) => setZoomLevel({ zoom })}
					onZoom={handleZoom}
				/>
			</div>
		</TooltipProvider>
	);
}

function ToolbarLeftSection() {
	const editor = useEditor();
	const { selectedElements } = useElementSelection();
	const currentTime = useCurrentTime();
	const isCurrentlyBookmarked = editor.scenes.isBookmarked({ time: currentTime });
	const { freezeFrame } = useFreezeFrame();

	const handleAction = ({
		action,
		event,
	}: {
		action: TAction;
		event: React.MouseEvent;
	}) => {
		event.stopPropagation();
		invokeAction(action);
	};

	return (
		<div className="flex items-center gap-1 bg-white/5 rounded-full px-1.5 py-0.5 border border-white/5 shadow-inner">
			<ToolbarButton
				icon={<HugeiconsIcon icon={ScissorIcon} className="size-4" />}
				tooltip="Split element"
				onClick={({ event }) => handleAction({ action: "split", event })}
			/>

			<div className="h-4 w-px bg-white/10 mx-0.5" />

			<ToolbarButton
				icon={<HugeiconsIcon icon={AlignLeftIcon} className="size-4" />}
				tooltip="Split left"
				onClick={({ event }) => handleAction({ action: "split-left", event })}
			/>

			<ToolbarButton
				icon={<HugeiconsIcon icon={AlignRightIcon} className="size-4" />}
				tooltip="Split right"
				onClick={({ event }) =>
					handleAction({ action: "split-right", event })
				}
			/>

			<div className="h-4 w-px bg-white/10 mx-0.5" />

			<ToolbarButton
				icon={<HugeiconsIcon icon={HeadphonesIcon} className="size-4" />}
				tooltip="Separate audio"
				disabled={selectedElements.length === 0 || !selectedElements.some(el => {
					const track = editor.timeline.getTracks().find(t => t.id === el.trackId);
					const element = track?.elements.find(e => e.id === el.elementId);
					return element && canElementHaveAudio(element) && element.type === "video";
				})}
				onClick={({ event }) => {
					event.stopPropagation();
					editor.timeline.detachAudio({ elements: selectedElements });
				} }
			/>

			<ToolbarButton
				icon={<HugeiconsIcon icon={Copy01Icon} className="size-4" />}
				tooltip="Duplicate element"
				onClick={({ event }) =>
					handleAction({ action: "duplicate-selected", event })
				}
			/>

			<ToolbarButton
				icon={<HugeiconsIcon icon={SnowIcon} className="size-4" />}
				tooltip="Freeze frame (3s)"
				disabled={selectedElements.length === 0}
				onClick={({ event }) => {
					event.stopPropagation();
					freezeFrame();
				}}
			/>

			<div className="h-4 w-px bg-white/10 mx-0.5" />

			<ToolbarButton
				icon={<HugeiconsIcon icon={Delete02Icon} className="size-4" />}
				tooltip="Delete element"
				onClick={({ event }) =>
					handleAction({ action: "delete-selected", event })
				}
			/>

			<div className="h-4 w-px bg-white/10 mx-0.5" />

			<ToolbarButton
				icon={<HugeiconsIcon icon={Bookmark02Icon} className="size-4" />}
				isActive={isCurrentlyBookmarked}
				tooltip={isCurrentlyBookmarked ? "Remove bookmark" : "Add bookmark"}
				onClick={({ event }) =>
					handleAction({ action: "toggle-bookmark", event })
				}
			/>
		</div>
	);
}

function SceneSelector() {
	const editor = useEditor();
	const currentScene = editor.scenes.getActiveScene();

	return (
		<div className="flex items-center">
			<SplitButton className="border-white/10 border bg-white/5 rounded-full h-8 px-1">
				<SplitButtonLeft className="text-[11px] font-medium tracking-wide text-white/80 hover:text-white px-3">
					{currentScene?.name || "No Scene"}
				</SplitButtonLeft>
				<SplitButtonSeparator className="bg-white/10" />
				<ScenesView>
					<SplitButtonRight onClick={() => {}} className="px-2">
						<HugeiconsIcon icon={Layers01Icon} className="size-3.5 text-white/60" />
					</SplitButtonRight>
				</ScenesView>
			</SplitButton>
		</div>
	);
}

function ToolbarRightSection({
	zoomLevel,
	minZoom,
	onZoomChange,
	onZoom,
}: {
	zoomLevel: number;
	minZoom: number;
	onZoomChange: (zoom: number) => void;
	onZoom: (options: { direction: "in" | "out" }) => void;
}) {
	const snappingEnabled = useTimelineStore((s) => s.snappingEnabled);
	const rippleEditingEnabled = useTimelineStore((s) => s.rippleEditingEnabled);
	const toggleSnapping = useTimelineStore((s) => s.toggleSnapping);
	const toggleRippleEditing = useTimelineStore((s) => s.toggleRippleEditing);

	return (
		<div className="flex items-center gap-2">
			<div className="flex items-center gap-1 bg-white/5 rounded-full px-1 py-0.5 border border-white/5 shadow-inner">
				<ToolbarButton
					icon={<HugeiconsIcon icon={MagnetIcon} className="size-4" />}
					isActive={snappingEnabled}
					tooltip="Auto snapping"
					onClick={() => toggleSnapping()}
				/>

				<ToolbarButton
					icon={<HugeiconsIcon icon={Link04Icon} className="size-4 scale-110" />}
					isActive={rippleEditingEnabled}
					tooltip="Ripple editing"
					onClick={() => toggleRippleEditing()}
				/>
			</div>

			<div className="flex items-center gap-1 bg-white/5 rounded-full px-2 py-0.5 border border-white/5 shadow-inner min-w-[180px]">
				<Button
					variant="text"
					size="icon"
					className="size-7 text-white/40 hover:text-white"
					onClick={() => onZoom({ direction: "out" })}
				>
					<HugeiconsIcon icon={SearchMinusIcon} className="size-4" />
				</Button>
				<Slider
					className="w-24 px-1"
					value={[zoomToSlider({ zoomLevel, minZoom })]}
					onValueChange={(values) =>
						onZoomChange(sliderToZoom({ sliderPosition: values[0], minZoom }))
					}
					min={0}
					max={1}
					step={0.005}
				/>
				<Button
					variant="text"
					size="icon"
					className="size-7 text-white/40 hover:text-white"
					onClick={() => onZoom({ direction: "in" })}
				>
					<HugeiconsIcon icon={SearchAddIcon} className="size-4" />
				</Button>
			</div>
		</div>
	);
}

function ToolbarButton({
	icon,
	tooltip,
	onClick,
	disabled,
	isActive,
}: {
	icon: React.ReactNode;
	tooltip: string;
	onClick: ({ event }: { event: React.MouseEvent }) => void;
	disabled?: boolean;
	isActive?: boolean;
}) {
	return (
		<Tooltip delayDuration={200}>
			<TooltipTrigger asChild>
				<Button
					variant={isActive ? "secondary" : "text"}
					size="icon"
					onClick={(event) => onClick({ event })}
					title={tooltip}
					className={cn(
						"rounded-sm",
						disabled ? "cursor-not-allowed opacity-50" : "",
					)}
				>
					{icon}
				</Button>
			</TooltipTrigger>
			<TooltipContent side="top" className="z-[100]">{tooltip}</TooltipContent>
		</Tooltip>
	);
}
