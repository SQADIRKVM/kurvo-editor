"use client";

import { useEditor } from "@/hooks/use-editor";
import { type VideoElement, type ImageElement, type CanvasFormat } from "@/types/timeline";
import { CapCutSlider } from "@/components/ui/capcut-slider";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  Section,
  SectionContent,
  SectionField,
  SectionFields,
  SectionHeader,
  SectionTitle,
} from "../section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface CanvasSectionProps {
  element: VideoElement | ImageElement;
  trackId: string;
}

export function CanvasSection({ element, trackId }: CanvasSectionProps) {
  const editor = useEditor();
  const canvasFormat = element.canvasFormat ?? { type: "color", color: "#000000" };
  const isEnabled = element.canvasFormat !== undefined;

  const updateCanvas = (updates: Partial<CanvasFormat> | undefined) => {
    editor.timeline.updateElements({
      updates: [{
        trackId,
        elementId: element.id,
        updates: { canvasFormat: updates === undefined ? undefined : { ...canvasFormat, ...updates } as CanvasFormat },
      }]
    });
  };

  return (
    <Section collapsible sectionKey={`${element.type}:canvas`}>
      <SectionHeader>
        <div className="flex flex-1 items-center justify-between pr-2">
            <SectionTitle>Canvas</SectionTitle>
            <Switch 
                checked={isEnabled}
                onCheckedChange={(checked) => updateCanvas(checked ? { type: "color", color: "#000000" } : undefined)}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
      </SectionHeader>
      {isEnabled && (
        <SectionContent>
            <SectionFields>
            <SectionField label="Format">
                <Select
                    value={canvasFormat.type}
                    onValueChange={(val: "color" | "blur") => updateCanvas({ type: val })}
                >
                    <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="color">Color</SelectItem>
                    <SelectItem value="blur">Blur</SelectItem>
                    </SelectContent>
                </Select>
            </SectionField>

            {canvasFormat.type === "color" && (
                <SectionField label="Color">
                    <ColorPicker
                        value={canvasFormat.color ?? "#000000"}
                        onChange={(val) => updateCanvas({ color: val })}
                    />
                </SectionField>
            )}

            {canvasFormat.type === "blur" && (
                <SectionField label="Blur">
                    <CapCutSlider
                        label=""
                        value={canvasFormat.blurLevel ?? 5}
                        onChange={(val) => updateCanvas({ blurLevel: val })}
                        min={1}
                        max={100}
                    />
                </SectionField>
            )}
            </SectionFields>
        </SectionContent>
      )}
    </Section>
  );
}
