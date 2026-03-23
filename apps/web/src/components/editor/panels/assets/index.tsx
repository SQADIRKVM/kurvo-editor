"use client";

import { Separator } from "@/components/ui/separator";
import { type Tab, useAssetsPanelStore } from "@/stores/assets-panel-store";
import { PanelView } from "./views/base-view";
import { EmptyState } from "@/components/ui/empty-state";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image02Icon, GridViewIcon } from "@hugeicons/core-free-icons";
import { Captions } from "./views/captions";
import { MediaView } from "./views/assets";
import { SettingsView } from "./views/settings";
import { SoundsView } from "./views/sounds";
import { StickersView } from "./views/stickers";
import { TextView } from "./views/text";
import { EffectsView } from "./views/effects";
import { TransitionsView } from "./views/transitions";
import { AdjustmentView } from "./views/adjustment";
import { FiltersView } from "./views/filters";

export function AssetsPanel() {
	const { activeTab } = useAssetsPanelStore();

	const viewMap: Record<Tab, React.ReactNode> = {
		media: <MediaView />,
		sounds: <SoundsView />,
		text: <TextView />,
		stickers: <StickersView />,
		effects: <EffectsView />,
		transitions: <TransitionsView />,
		captions: <Captions />,
		filters: <FiltersView />,
		adjustment: <AdjustmentView />,
		settings: <SettingsView />,
	};

	return (
		<div className="panel bg-transparent flex h-full overflow-hidden">
			<div className="flex-1 overflow-hidden">{viewMap[activeTab]}</div>
		</div>
	);
}
