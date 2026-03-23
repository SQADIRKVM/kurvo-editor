"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/ui";
import { useTimelineStore } from "@/stores/timeline-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	TAB_KEYS,
	tabs,
	useAssetsPanelStore,
} from "@/stores/assets-panel-store";

export function LeftNavBar() {
	const { activeTab, setActiveTab } = useAssetsPanelStore();
	const [showTopFade, setShowTopFade] = useState(false);
	const [showBottomFade, setShowBottomFade] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	const checkScrollPosition = useCallback(() => {
		const element = scrollRef.current;
		if (!element) return;

		const { scrollTop, scrollHeight, clientHeight } = element;
		setShowTopFade(scrollTop > 0);
		setShowBottomFade(scrollTop < scrollHeight - clientHeight - 1);
	}, []);

	useEffect(() => {
		const element = scrollRef.current;
		if (!element) return;

		checkScrollPosition();
		element.addEventListener("scroll", checkScrollPosition);

		const resizeObserver = new ResizeObserver(checkScrollPosition);
		resizeObserver.observe(element);

		return () => {
			element.removeEventListener("scroll", checkScrollPosition);
			resizeObserver.disconnect();
		};
	}, [checkScrollPosition]);

	// Renaming for clarity based on the provided snippet, though the store still uses activeTab/setActiveTab
	const currentTab = activeTab;
	const handleTabClick = setActiveTab;

	// Assuming TABS is derived from TAB_KEYS and tabs for the new structure
	const TABS = TAB_KEYS.map(key => ({ id: key, ...tabs[key] }));

	return (
		<aside className="w-20 h-full flex flex-col items-center py-4 bg-[#0a0a0c] border-r border-white/5 z-40 shrink-0 select-none">
			<ScrollArea ref={scrollRef} className="flex-1 w-full">
				<div className="flex flex-col items-center gap-4 px-2">
					{TABS.map((tab) => {
						const isActive = currentTab === tab.id;
						return (
							<button
								key={tab.id}
								onClick={() => handleTabClick(tab.id)}
								className={cn(
									"flex flex-col items-center justify-center gap-1.5 w-full py-3 transition-all duration-200 group cursor-pointer relative rounded-xl",
									isActive ? "bg-white/5 text-white shadow-lg" : "text-white/40 hover:text-white hover:bg-white/[0.02]"
								)}
							>
								{isActive && (
									<div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-violet-500 rounded-r-full shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
								)}
								<tab.icon className={cn(
									"size-5 transition-transform group-hover:scale-110",
									isActive ? "text-violet-400" : ""
								)} />
								<span className={cn(
									"text-[10px] tracking-wide uppercase font-bold text-center",
									isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"
								)}>
									{tab.label}
								</span>
							</button>
						);
					})}
				</div>
			</ScrollArea>
			{/* Fade overlays might need adjustment if ScrollArea handles its own fading or if they are meant to be outside the scrollable area */}
			<FadeOverlay direction="top" show={showTopFade} />
			<FadeOverlay direction="bottom" show={showBottomFade} />
		</aside>
	);
}

function FadeOverlay({
	direction,
	show,
}: {
	direction: "top" | "bottom";
	show: boolean;
}) {
	return (
		<div
			className={cn(
				"pointer-events-none absolute right-0 left-0 h-6",
				direction === "top" && show
					? "from-background top-0 bg-gradient-to-b to-transparent"
					: "from-background bottom-0 bg-gradient-to-t to-transparent",
			)}
		/>
	);
}
