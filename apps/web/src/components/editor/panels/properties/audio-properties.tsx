import { AudioSection, SpeedSection } from "./sections";
import type { AudioElement } from "@/types/timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AudioProperties({
	element,
	trackId,
}: {
	element: AudioElement;
	trackId: string;
}) {
	return (
		<Tabs defaultValue="audio" className="flex h-full flex-col">
			<div className="flex-none px-4 pt-3 border-b border-white/5 bg-white/[0.02]">
				<TabsList className="flex h-9 w-full justify-start bg-transparent p-0 gap-4 overflow-x-auto scrollbar-hidden">
					<TabsTrigger value="audio" className="flex-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet-500 data-[state=active]:text-white rounded-none border-b-2 border-transparent px-1 pb-2 pt-1 h-9 text-[11px] font-bold uppercase tracking-wider text-white/40 w-auto whitespace-nowrap transition-all hover:text-white/80">Audio</TabsTrigger>
					<TabsTrigger value="speed" className="flex-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet-500 data-[state=active]:text-white rounded-none border-b-2 border-transparent px-1 pb-2 pt-1 h-9 text-[11px] font-bold uppercase tracking-wider text-white/40 w-auto whitespace-nowrap transition-all hover:text-white/80">Speed</TabsTrigger>
				</TabsList>
			</div>

			<div className="flex-1 overflow-y-auto min-h-0">
				<TabsContent value="audio" className="m-0 outline-none">
					<AudioSection element={element} trackId={trackId} showTopBorder={false} />
				</TabsContent>
				<TabsContent value="speed" className="m-0 outline-none">
					<SpeedSection element={element} trackId={trackId} />
				</TabsContent>
			</div>
		</Tabs>
	);
}
