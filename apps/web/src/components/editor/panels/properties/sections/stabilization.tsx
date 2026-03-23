"use client";

import { useEditor } from "@/hooks/use-editor";
import { type VideoElement } from "@/types/timeline";
import { CapCutSlider } from "@/components/ui/capcut-slider";
import { Switch } from "@/components/ui/switch";
import {
  Section,
  SectionContent,
  SectionField,
  SectionFields,
  SectionHeader,
  SectionTitle,
} from "../section";

interface StabilizationSectionProps {
  element: VideoElement;
  trackId: string;
}

export function StabilizationSection({ element, trackId }: StabilizationSectionProps) {
  const editor = useEditor();
  const isEnabled = element.stabilization !== undefined;

  const updateStabilization = (val: number | undefined) => {
    editor.timeline.updateElements({
      updates: [{
        trackId,
        elementId: element.id,
        updates: { stabilization: val },
      }]
    });
  };

  return (
    <Section collapsible sectionKey={`${element.type}:stabilization`}>
      <SectionHeader>
        <div className="flex flex-1 items-center justify-between pr-2">
            <SectionTitle>Stabilization</SectionTitle>
            <Switch 
                checked={isEnabled}
                onCheckedChange={(checked) => updateStabilization(checked ? 1 : undefined)}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
      </SectionHeader>
      {isEnabled && (
        <SectionContent>
            <SectionFields>
            <SectionField label="Level">
                <CapCutSlider
                    label="Level"
                    value={element.stabilization ?? 1}
                    onChange={(val) => updateStabilization(Math.round(val))}
                    min={1}
                    max={3}
                />
            </SectionField>
            </SectionFields>
        </SectionContent>
      )}
    </Section>
  );
}
