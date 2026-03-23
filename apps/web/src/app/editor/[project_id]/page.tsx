"use client";

import { useParams } from "next/navigation";
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from "@/components/ui/resizable";
import { AssetsPanel } from "@/components/editor/panels/assets";
import { PropertiesPanel } from "@/components/editor/panels/properties";
import { Timeline } from "@/components/editor/panels/timeline";
import { PreviewPanel } from "@/components/editor/panels/preview";
import { MagicBar } from "@/components/editor/magic/magic-bar";
import { EditorHeader } from "@/components/editor/editor-header";
import { LeftNavBar } from "@/components/editor/layout/left-nav-bar";
import { EditorProvider } from "@/components/providers/editor-provider";
import { Onboarding } from "@/components/editor/onboarding";
import { MigrationDialog } from "@/components/editor/dialogs/migration-dialog";
import { usePanelStore } from "@/stores/panel-store";
import { usePasteMedia } from "@/hooks/use-paste-media";
import { MobileGate } from "@/components/editor/mobile-gate";

export default function Editor() {
	const params = useParams();
	const projectId = params.project_id as string;

	return (
		<MobileGate>
			<EditorProvider projectId={projectId}>
				<div className="bg-background flex h-screen w-screen flex-col overflow-hidden">
					<EditorHeader />
					<div className="relative min-h-0 min-w-0 flex-1">
						<EditorLayout />
					</div>
					<Onboarding />
					<MigrationDialog />
				</div>
			</EditorProvider>
		</MobileGate>
	);
}

function EditorLayout() {
	usePasteMedia();
	const { panels, setPanel } = usePanelStore();
	const params = useParams();
	const projectId = params.project_id as string;

	return (
		<div className="relative flex size-full bg-[#050508] overflow-hidden">
			{/* Spatial Cinematic Background Layer */}
			<div className="absolute inset-0 z-0 pointer-events-none opacity-20">
				<div className="absolute top-0 left-1/4 w-[40%] h-[30%] bg-violet-600/10 blur-[120px] rounded-full mix-blend-screen" />
				<div className="absolute bottom-1/4 right-0 w-[30%] h-[40%] bg-pink-600/10 blur-[100px] rounded-full mix-blend-screen" />
			</div>

			<LeftNavBar />
			
			<div className="flex-1 flex flex-col min-w-0 z-10">
				<ResizablePanelGroup
					direction="vertical"
					className="size-full"
					onLayout={(sizes) => {
						setPanel("mainContent", sizes[0] ?? panels.mainContent);
						setPanel("timeline", sizes[1] ?? panels.timeline);
					}}
				>
					<ResizablePanel
						defaultSize={panels.mainContent}
						minSize={30}
						maxSize={85}
						className="min-h-0"
					>
						<ResizablePanelGroup
							direction="horizontal"
							className="size-full"
							onLayout={(sizes) => {
								setPanel("tools", sizes[0] ?? panels.tools);
								setPanel("preview", sizes[1] ?? panels.preview);
								setPanel("properties", sizes[2] ?? panels.properties);
							}}
						>
							<ResizablePanel
								defaultSize={panels.tools}
								minSize={15}
								maxSize={40}
								className="min-w-0 border-r border-white/5 bg-transparent overflow-hidden"
							>
								<AssetsPanel />
							</ResizablePanel>
							
							<ResizableHandle className="w-[1px] bg-white/5 hover:bg-violet-500/50 transition-colors" />

							<ResizablePanel
								defaultSize={panels.preview}
								minSize={30}
								className="min-h-0 min-w-0 flex-1 bg-black/20 overflow-hidden flex flex-col"
							>
								<PreviewPanel />
							</ResizablePanel>
							
							<ResizableHandle className="w-[1px] bg-white/5 hover:bg-violet-500/50 transition-colors" />

							<ResizablePanel
								defaultSize={panels.properties}
								minSize={20}
								maxSize={40}
								className="min-w-0 border-l border-white/5 bg-transparent overflow-hidden"
							>
								<PropertiesPanel />
							</ResizablePanel>
						</ResizablePanelGroup>
					</ResizablePanel>

					<ResizableHandle className="h-[1px] bg-white/5 hover:bg-violet-500/50 transition-colors" />

					<ResizablePanel
						defaultSize={panels.timeline}
						minSize={15}
						maxSize={70}
						className="min-h-0 border-t border-white/5 bg-black/10 overflow-hidden relative"
					>
						<Timeline />
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
			<MagicBar projectId={projectId} />
		</div>
	);
}
