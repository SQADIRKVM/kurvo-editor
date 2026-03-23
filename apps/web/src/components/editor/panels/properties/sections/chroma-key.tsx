"use client";

import { useEditor } from "@/hooks/use-editor";
import { type VideoElement } from "@/types/timeline";
import { CapCutSlider } from "@/components/ui/capcut-slider";
import {
  Section,
  SectionContent,
  SectionField,
  SectionFields,
  SectionHeader,
  SectionTitle,
} from "../section";
import { Switch } from "@/components/ui/switch";
import { ColorPicker } from "@/components/ui/color-picker";

interface ChromaKeySectionProps {
  element: VideoElement;
  trackId: string;
}

export function ChromaKeySection({ element, trackId }: ChromaKeySectionProps) {
  const editor = useEditor();
  // @ts-ignore – chromaKey is a custom extension field we are adding to VideoElement
  const chromaKey: { color: string; similarity: number; smoothness: number } | undefined =
    (element as VideoElement & { chromaKey?: { color: string; similarity: number; smoothness: number } }).chromaKey;
  const isEnabled = chromaKey !== undefined;

  const updateChromaKey = (
    updates: { color?: string; similarity?: number; smoothness?: number } | undefined,
  ) => {
    const merged =
      updates === undefined
        ? undefined
        : {
            color: "#00FF00",
            similarity: 40,
            smoothness: 10,
            ...chromaKey,
            ...updates,
          };

    editor.timeline.updateElements({
      updates: [
        {
          trackId,
          elementId: element.id,
          updates: { chromaKey: merged } as Partial<VideoElement>,
        },
      ],
    });
  };

  return (
    <Section collapsible sectionKey={`${element.type}:chromakey`}>
      <SectionHeader>
        <div className="flex flex-1 items-center justify-between pr-2">
          <SectionTitle>Chroma Key</SectionTitle>
          <Switch
            checked={isEnabled}
            onCheckedChange={(checked) =>
              updateChromaKey(
                checked ? { color: "#00FF00", similarity: 40, smoothness: 10 } : undefined,
              )
            }
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </SectionHeader>

      {isEnabled && chromaKey && (
        <SectionContent>
          <SectionFields>
            <SectionField label="Key Color">
              <ColorPicker
                value={chromaKey.color}
                onChange={(val) => updateChromaKey({ color: val })}
              />
            </SectionField>

            <SectionField label="Similarity">
              <CapCutSlider
                label=""
                value={chromaKey.similarity}
                onChange={(val) => updateChromaKey({ similarity: val })}
                min={0}
                max={100}
              />
            </SectionField>

            <SectionField label="Smoothness">
              <CapCutSlider
                label=""
                value={chromaKey.smoothness}
                onChange={(val) => updateChromaKey({ smoothness: val })}
                min={0}
                max={100}
              />
            </SectionField>
          </SectionFields>
        </SectionContent>
      )}
    </Section>
  );
}
