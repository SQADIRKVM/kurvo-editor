import type {
	ImageElement,
	StickerElement,
	VideoElement,
} from "@/types/timeline";
import { AnimationsSection, AudioSection, BlendingSection, TransformSection, SpeedSection, AdjustSection, CanvasSection, StabilizationSection } from "./sections";
import { ChromaKeySection } from "./sections/chroma-key";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function VideoProperties({
	element,
	trackId,
}: {
	element: VideoElement | ImageElement | StickerElement;
	trackId: string;
}) {
	const isVideo = element.type === "video";

	return (
		<Tabs defaultValue="video" className="flex h-full flex-col">
			<div className="flex-none px-4 pt-3 border-b border-white/5 bg-white/[0.02]">
				<TabsList className="flex h-9 w-full justify-start bg-transparent p-0 gap-4 overflow-x-auto scrollbar-hidden">
					<TabsTrigger value="video" className="flex-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet-500 data-[state=active]:text-white rounded-none border-b-2 border-transparent px-1 pb-2 pt-1 h-9 text-[11px] font-bold uppercase tracking-wider text-white/40 w-auto whitespace-nowrap transition-all hover:text-white/80">Basic</TabsTrigger>
					{isVideo && <TabsTrigger value="audio" className="flex-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet-500 data-[state=active]:text-white rounded-none border-b-2 border-transparent px-1 pb-2 pt-1 h-9 text-[11px] font-bold uppercase tracking-wider text-white/40 w-auto whitespace-nowrap transition-all hover:text-white/80">Audio</TabsTrigger>}
					{isVideo && <TabsTrigger value="speed" className="flex-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet-500 data-[state=active]:text-white rounded-none border-b-2 border-transparent px-1 pb-2 pt-1 h-9 text-[11px] font-bold uppercase tracking-wider text-white/40 w-auto whitespace-nowrap transition-all hover:text-white/80">Speed</TabsTrigger>}
					<TabsTrigger value="animation" className="flex-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet-500 data-[state=active]:text-white rounded-none border-b-2 border-transparent px-1 pb-2 pt-1 h-9 text-[11px] font-bold uppercase tracking-wider text-white/40 w-auto whitespace-nowrap transition-all hover:text-white/80">Animation</TabsTrigger>
					<TabsTrigger value="adjust" className="flex-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet-500 data-[state=active]:text-white rounded-none border-b-2 border-transparent px-1 pb-2 pt-1 h-9 text-[11px] font-bold uppercase tracking-wider text-white/40 w-auto whitespace-nowrap transition-all hover:text-white/80">Adjustment</TabsTrigger>
				</TabsList>
			</div>

			<div className="flex-1 overflow-y-auto min-h-0">
				<TabsContent value="video" className="m-0 outline-none">
					<TransformSection element={element} trackId={trackId} showTopBorder={false} />
					<BlendingSection element={element} trackId={trackId} />
					<CanvasSection element={element as VideoElement | ImageElement} trackId={trackId} />
					{isVideo && <StabilizationSection element={element as VideoElement} trackId={trackId} />}
					{isVideo && <ChromaKeySection element={element as VideoElement} trackId={trackId} />}
				</TabsContent>
				
				{isVideo && (
					<TabsContent value="audio" className="m-0 outline-none">
						<AudioSection element={element as VideoElement} trackId={trackId} showTopBorder={false} />
					</TabsContent>
				)}

				{isVideo && (
					<TabsContent value="speed" className="m-0 outline-none">
						<SpeedSection element={element as VideoElement} trackId={trackId} />
					</TabsContent>
				)}

				<TabsContent value="animation" className="m-0 outline-none">
					<AnimationsSection element={element} trackId={trackId} />
				</TabsContent>

				<TabsContent value="adjust" className="m-0 outline-none">
					<AdjustSection element={element} trackId={trackId} />
				</TabsContent>
			</div>
		</Tabs>
	);
}
