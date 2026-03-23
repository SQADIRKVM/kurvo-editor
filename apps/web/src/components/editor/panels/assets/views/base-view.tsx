import { cn } from "@/utils/ui";

interface PanelViewProps extends React.HTMLAttributes<HTMLDivElement> {
	title?: string;
	actions?: React.ReactNode;
	children: React.ReactNode;
	contentClassName?: string;
	hideHeader?: boolean;
	ref?: React.Ref<HTMLDivElement>;
	onScroll?: React.UIEventHandler<HTMLDivElement>;
	scrollRef?: React.Ref<HTMLDivElement>;
}

export function PanelView({
	title,
	actions,
	children,
	className,
	contentClassName,
	hideHeader = false,
	ref,
	onScroll,
	scrollRef,
	...rest
}: PanelViewProps) {
	return (
		<div
			className={cn("relative flex h-full flex-col", className)}
			ref={ref}
			{...rest}
		>
			{!hideHeader && (
				<div className="bg-background h-10 shrink-0 px-3 flex items-center justify-between border-b">
					<span className="text-muted-foreground/60 text-[11px] font-medium uppercase tracking-wider">{title}</span>
					{actions}
				</div>
			)}
			<div
				className={cn(
					"scrollbar-thin size-full overflow-y-auto",
					hideHeader ? "pt-2" : "pt-0",
				)}
				ref={scrollRef}
				onScroll={onScroll}
			>
				<div className={cn("w-full flex-1 pt-0", contentClassName)}>
					{children}
				</div>
			</div>
		</div>
	);
}
