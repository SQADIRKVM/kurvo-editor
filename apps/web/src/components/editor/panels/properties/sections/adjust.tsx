"use client";

import { useEditor } from "@/hooks/use-editor";
import { type VideoElement, type ImageElement, type StickerElement, type TextElement } from "@/types/timeline";
import { Slider } from "@/components/ui/slider";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "../section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurveEditor, type CurvePoint } from "@/components/editor/ui/curve-editor";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings01Icon, PaintBrush01Icon } from "@hugeicons/core-free-icons";
import { motion } from "motion/react";
import { useState } from "react";

interface AdjustSectionProps {
  element: VideoElement | ImageElement | StickerElement | TextElement;
  trackId: string;
}

const DEFAULT_LUMA_CURVE: CurvePoint[] = [
  { id: "1", x: 0, y: 0 },
  { id: "2", x: 100, y: 100 },
];

export function AdjustSection({ element, trackId }: AdjustSectionProps) {
  const editor = useEditor();
  const [lumaCurve, setLumaCurve] = useState<CurvePoint[]>(DEFAULT_LUMA_CURVE);

  // Helper to update individual effect parameters
  const updateEffectParam = (effectType: string, paramKey: string, value: any) => {
    const effects = element.effects ?? [];
    const effectIndex = effects.findIndex((e) => e.type === effectType);
    
    let updatedEffects = [...effects];
    if (effectIndex > -1) {
      updatedEffects[effectIndex] = {
        ...updatedEffects[effectIndex],
        params: { ...updatedEffects[effectIndex].params, [paramKey]: value }
      };
    } else {
      updatedEffects.push({
        id: Math.random().toString(36).substr(2, 9),
        type: effectType,
        enabled: true,
        params: { [paramKey]: value }
      });
    }

    editor.timeline.updateElements({
      updates: [{
        trackId,
        elementId: element.id,
        updates: { effects: updatedEffects },
      }]
    });
  };

  const updateSpeed = (value: number) => {
    editor.timeline.updateElements({
      updates: [{
        trackId,
        elementId: element.id,
        updates: { speed: value },
      }]
    });
  };

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          <HugeiconsIcon icon={PaintBrush01Icon} size={16} className="mr-2" />
          Adjust
        </SectionTitle>
      </SectionHeader>
      <SectionContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-0.5 h-8">
            <TabsTrigger value="basic" className="text-xs h-7">Basic</TabsTrigger>
            <TabsTrigger value="curves" className="text-xs h-7">Curves</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-4 space-y-4 outline-none">
            {/* Brightness */}
            <AdjustmentSlider 
              label="Brightness" 
              value={50} 
              onChange={(v) => updateEffectParam('brightness', 'amount', v / 50)} 
            />
            {/* Contrast */}
            <AdjustmentSlider 
              label="Contrast" 
              value={50} 
              onChange={(v) => updateEffectParam('contrast', 'amount', v / 50)} 
            />
            {/* Saturation */}
            <AdjustmentSlider 
              label="Saturation" 
              value={50} 
              onChange={(v) => updateEffectParam('saturation', 'amount', v / 50)} 
            />
            {/* Exposure */}
            <AdjustmentSlider 
              label="Exposure" 
              value={50} 
              onChange={(v) => updateEffectParam('exposure', 'amount', v / 50)} 
            />
          </TabsContent>

          <TabsContent value="curves" className="mt-4 outline-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Luma Curve</span>
                <button 
                  className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
                  onClick={() => setLumaCurve(DEFAULT_LUMA_CURVE)}
                >
                  Reset
                </button>
              </div>
              <CurveEditor 
                points={lumaCurve} 
                onChange={setLumaCurve} 
                className="h-40"
              />
              <div className="flex items-center gap-2 justify-center">
                {['white', 'red', 'green', 'blue'].map(c => (
                  <div key={c} className={`size-3 rounded-full bg-${c === 'white' ? 'white' : c}-500 cursor-pointer border border-white/10`} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SectionContent>
    </Section>
  );
}

function AdjustmentSlider({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="text-[11px] font-mono">{value}</span>
      </div>
      <Slider
        defaultValue={[value]}
        max={100}
        step={1}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}
