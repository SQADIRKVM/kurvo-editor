"use client";

import { Button } from "../ui/button";
import { useRef, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import { RenameProjectDialog } from "./dialogs/rename-project-dialog";
import { DeleteProjectDialog } from "./dialogs/delete-project-dialog";
import { useRouter, useParams } from "next/navigation";
import { FaDiscord } from "react-icons/fa6";
import { ExportButton } from "./export-button";
import { ThemeToggle } from "../theme-toggle";
import { DASHBOARD_URL, DEFAULT_LOGO_URL, SOCIAL_LINKS } from "@/constants/site-constants";
import { toast } from "sonner";
import { useEditor } from "@/hooks/use-editor";
import { 
	CommandIcon, 
	Logout05Icon, 
	Home01Icon, 
	SearchAddIcon, 
	TaskAdd02Icon, 
	MagnetIcon 
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShortcutsDialog } from "./dialogs/shortcuts-dialog";
import Image from "next/image";
import { cn } from "@/utils/ui";

export function EditorHeader() {
	const [openDialog, setOpenDialog] = useState<"delete" | "rename" | "shortcuts" | null>(null);
	const editor = useEditor();
	const router = useRouter();
	const activeProject = editor.project.getActive();

	const handleSaveProjectName = async (newName: string) => {
		if (activeProject && newName.trim() && newName !== activeProject.metadata.name) {
			try {
				await editor.project.renameProject({
					id: activeProject.metadata.id,
					name: newName.trim(),
				});
				toast.success("Project renamed");
			} catch (error) {
				toast.error("Failed to rename project");
			} finally {
				setOpenDialog(null);
			}
		}
	};

	const handleDeleteProject = async () => {
		if (activeProject) {
			try {
				await editor.project.deleteProjects({
					ids: [activeProject.metadata.id],
				});
				router.push("/");
			} catch (error) {
				toast.error("Failed to delete project");
			} finally {
				setOpenDialog(null);
			}
		}
	};

	return (
		<header className="flex h-12 w-full items-center justify-between px-4 bg-[#121216]/90 backdrop-blur-3xl border-b border-white/5 z-50 shrink-0 select-none">
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					className="rounded-md hover:bg-white/10 h-8 w-8"
					onClick={() => window.location.href = DASHBOARD_URL}
					title="Exit to Dashboard"
				>
					<HugeiconsIcon icon={Home01Icon} className="size-4.5 text-white/70" />
				</Button>
				
				<div className="h-4 w-px bg-white/10 mx-1" />

				<div className="flex items-center gap-2.5 px-3 py-1 mr-2 rounded-full bg-violet-500/10 border border-violet-500/20">
					<Image src="/brand/kurvo-logo.png" alt="Kurvo Logo" width={16} height={16} className="rounded-sm" />
					<span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">Kurvo</span>
					<div className="size-1 rounded-full bg-pink-500 animate-pulse" />
				</div>

				<ProjectDropdown setOpenDialog={setOpenDialog} />
				<div className="h-4 w-px bg-white/10 mx-2" />
				<EditableProjectName />
			</div>

			<nav className="flex items-center gap-4">
				<div className="flex items-center gap-2 mr-2">
					<Button
						variant="ghost"
						size="sm"
						className="hidden md:flex gap-2 items-center text-xs font-semibold text-white/60 hover:text-white"
						onClick={() => window.open(SOCIAL_LINKS.discord, "_blank")}
					>
						<FaDiscord className="size-4" />
						Feedback
					</Button>
					
					<div className="h-4 w-px bg-white/10 mx-1 hidden md:block" />
					
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-white/60 hover:text-white"
						onClick={() => setOpenDialog("shortcuts")}
					>
						<HugeiconsIcon icon={CommandIcon} className="size-4" />
					</Button>
				</div>
				
				<ThemeToggle />
				<ExportButton />
			</nav>

			<ShortcutsDialog 
				isOpen={openDialog === "shortcuts"} 
				onOpenChange={(open) => !open && setOpenDialog(null)} 
			/>

			{activeProject && (
				<>
					<RenameProjectDialog
						isOpen={openDialog === "rename"}
						onOpenChange={(open) => !open && setOpenDialog(null)}
						onConfirm={handleSaveProjectName}
						projectName={activeProject.metadata.name}
					/>
					<DeleteProjectDialog
						isOpen={openDialog === "delete"}
						onOpenChange={(open) => !open && setOpenDialog(null)}
						onConfirm={handleDeleteProject}
						projectNames={[activeProject.metadata.name]}
					/>
				</>
			)}
		</header>
	);
}

function ProjectDropdown({ setOpenDialog }: { setOpenDialog: (v: "delete" | "rename" | "shortcuts" | null) => void }) {
	const params = useParams();
	const router = useRouter();
	const editor = useEditor();
	const activeProject = editor.project.getActive();
	const [isExiting, setIsExiting] = useState(false);

	const handleExit = async () => {
		if (isExiting) return;
		setIsExiting(true);
		router.push(DASHBOARD_URL);
	};

	const handleUpgrade = () => {
		toast.info("Pro Upgrade coming soon!", {
			description: "Unlock advanced AI features and 4K exports."
		});
	};

	if (!activeProject) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 gap-2 px-2 hover:bg-white/5 text-xs font-medium text-white/80"
				>
					<div className="size-5 rounded-sm overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
						<Image
							src={activeProject.metadata.thumbnail || DEFAULT_LOGO_URL}
							alt={activeProject.metadata.name}
							width={20}
							height={20}
							className="object-cover"
						/>
					</div>
					<span className="max-w-[120px] truncate">{activeProject.metadata.name}</span>
					<HugeiconsIcon icon={SearchAddIcon} className="size-3 opacity-40 rotate-90" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-56 bg-[#121216] border-white/10 z-[100]">
				<DropdownMenuItem onClick={() => setOpenDialog("rename")} className="gap-2">
					<HugeiconsIcon icon={TaskAdd02Icon} className="size-4" />
					Rename Project
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleUpgrade} className="gap-2 text-violet-400 focus:text-violet-300">
					<HugeiconsIcon icon={MagnetIcon} className="size-4 shrink-0" />
					Upgrade to Pro
				</DropdownMenuItem>
				<DropdownMenuSeparator className="bg-white/5" />
				<DropdownMenuItem onClick={() => setOpenDialog("delete")} className="gap-2 text-destructive focus:text-destructive">
					<HugeiconsIcon icon={Logout05Icon} className="size-4" />
					Delete Project
				</DropdownMenuItem>
				<DropdownMenuSeparator className="bg-white/5" />
				<DropdownMenuItem onClick={handleExit} className="gap-2 text-white/60">
					<HugeiconsIcon icon={Home01Icon} className="size-4" />
					Exit to Dashboard
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function EditableProjectName() {
	const editor = useEditor();
	const activeProject = editor.project.getActive();

	if (!activeProject) return null;

	return (
		<span className="text-xs font-medium text-white/40 hidden sm:block">
			{activeProject.metadata.id.slice(0, 8)}
		</span>
	);
}
