"use client";

import { cn } from "@/utils/ui";
import { type ReactNode } from "react";

interface EmptyStateProps {
	icon: ReactNode;
	title: string;
	description: string;
	className?: string;
}

export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
	return (
		<div className={cn("flex flex-col items-center justify-center p-8 text-center space-y-4", className)}>
			<div className="p-4 rounded-full bg-muted/20 border border-muted/30">
				{icon}
			</div>
			<div className="space-y-1">
				<h3 className="text-sm font-medium text-foreground">{title}</h3>
				<p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
					{description}
				</p>
			</div>
		</div>
	);
}
