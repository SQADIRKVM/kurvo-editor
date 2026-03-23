"use client";

import { nanoid } from "nanoid";
import { useEditor } from "@/hooks/use-editor";
import { useElementSelection } from "@/hooks/timeline/element/use-element-selection";
import { PanelView } from "./base-view";
import { 
	Section, 
	SectionContent, 
	SectionHeader, 
	SectionTitle, 
	SectionFields 
} from "../../properties/section";
import { EffectParamField } from "../../properties/effect-param-field";
import { getEffect } from "@/lib/effects/registry";
import { isVisualElement } from "@/lib/timeline";
import { EmptyState } from "@/components/ui/empty-state";
import { Settings01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function AdjustmentView() {
	const editor = useEditor();
	const { selectedElements } = useElementSelection();
	
	// Get the first selected visual element reference
	const selectedElementRef = selectedElements[0];
	
	// Resolve the actual element
	const track = selectedElementRef 
		? editor.timeline.getTrackById({ trackId: selectedElementRef.trackId }) 
		: null;
	const element = track?.elements.find(e => e.id === selectedElementRef?.elementId);
	const selectedVisualElement = element && isVisualElement(element) ? element : null;

	if (!selectedVisualElement || !track) {
		return (
			<PanelView title="Adjustment">
				<EmptyState 
					icon={<HugeiconsIcon icon={Settings01Icon} className="size-12 text-muted-foreground/20" />}
					title="No clip selected"
					description="Select a video or image to adjust its properties"
				/>
			</PanelView>
		);
	}

	return (
		<PanelView title="Adjustment" className="overflow-hidden">
			<div className="flex flex-col gap-4">
				<AdjustmentSection 
					element={selectedVisualElement} 
					trackId={track.id} 
					effectType="adjust" 
					title="Color Correction"
				/>
				<AdjustmentSection 
					element={selectedVisualElement} 
					trackId={track.id} 
					effectType="zoom" 
					title="Transform"
				/>
			</div>
		</PanelView>
	);
}

function AdjustmentSection({ 
	element, 
	trackId, 
	effectType,
	title
}: { 
	element: any, 
	trackId: string, 
	effectType: string,
	title: string 
}) {
	const editor = useEditor();
	const definition = getEffect({ effectType });
	const effect = (element.effects ?? []).find((e: any) => e.type === effectType);

	const previewParam = ({ key }: { key: string }) => (value: number | string | boolean) => {
		const updatedEffects = [...(element.effects ?? [])];
		const existingIndex = updatedEffects.findIndex(e => e.type === effectType);

		if (existingIndex >= 0) {
			updatedEffects[existingIndex] = {
				...updatedEffects[existingIndex],
				params: { ...updatedEffects[existingIndex].params, [key]: value },
				enabled: true
			};
		} else {
			// Add new effect if it doesn't exist
			updatedEffects.push({
				id: nanoid(),
				type: effectType,
				params: { 
					...definition.params.reduce((acc, p) => ({ ...acc, [p.key]: p.default }), {}),
					[key]: value 
				},
				enabled: true
			});
		}

		editor.timeline.previewElements({
			updates: [
				{
					trackId,
					elementId: element.id,
					updates: { effects: updatedEffects },
				},
			],
		});
	};

	const commitParam = () => editor.timeline.commitPreview();

	return (
		<Section sectionKey={`adjust:${effectType}`} showTopBorder={false}>
			<SectionHeader>
				<SectionTitle>{title}</SectionTitle>
			</SectionHeader>
			<SectionContent>
				<SectionFields>
					{definition.params.map((param) => (
						<EffectParamField
							key={param.key}
							param={param}
							value={effect?.params[param.key] ?? param.default}
							onPreview={previewParam({ key: param.key })}
							onCommit={commitParam}
						/>
					))}
				</SectionFields>
			</SectionContent>
		</Section>
	);
}
