"use client";

import { useEditor } from "@/hooks/use-editor";
import { type VideoElement, type AudioElement } from "@/types/timeline";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Section,
  SectionContent,
  SectionFields,
  SectionHeader,
  SectionTitle,
} from "../section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurveEditor, type CurvePoint } from "@/components/editor/ui/curve-editor";
import { HugeiconsIcon } from "@hugeicons/react";
import { DashboardSpeed01Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";

interface SpeedSectionProps {
  element: VideoElement | AudioElement;
  trackId: string;
}

const DEFAULT_CURVE: CurvePoint[] = [
  { id: "1", x: 0, y: 50 },
  { id: "2", x: 100, y: 50 },
];

export function SpeedSection({ element, trackId }: SpeedSectionProps) {
  const editor = useEditor();
  const [curvePoints, setCurvePoints] = useState<CurvePoint[]>(DEFAULT_CURVE);

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
          <HugeiconsIcon icon={DashboardSpeed01Icon} size={16} className="mr-2" />
          Speed
        </SectionTitle>
      </SectionHeader>
      <SectionContent>
        <Tabs defaultValue="normal" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-0.5 h-8">
            <TabsTrigger value="normal" className="text-xs h-7">Normal</TabsTrigger>
            <TabsTrigger value="curve" className="text-xs h-7">Curve</TabsTrigger>
          </TabsList>

          <TabsContent value="normal" className="mt-4 outline-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Speed</span>
                <span className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">
                  {(element.speed ?? 1).toFixed(1)}x
                </span>
              </div>
              <Slider
                value={[element.speed ?? 1]}
                min={0.1}
                max={10}
                step={0.1}
                onValueChange={([val]) => updateSpeed(val)}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0.1x</span>
                <span>1x</span>
                <span>10x</span>
              </div>
              {(element.type === 'audio' || element.type === 'video') && (
                <div className="flex items-center justify-between pt-4 pb-2">
                  <span className="text-xs font-medium">Keep pitch</span>
                  <Switch
                    checked={element.keepPitch ?? false}
                    onCheckedChange={(checked) => editor.timeline.updateElements({
                      updates: [{ trackId, elementId: element.id, updates: { keepPitch: checked } }]
                    })}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="curve" className="mt-4 outline-none">
            <div className="space-y-4">
              <CurveEditor 
                points={curvePoints} 
                onChange={setCurvePoints} 
                className="h-32"
              />
              <div className="grid grid-cols-3 gap-2">
                {["Flash In", "Slow Mo", "Jump"].map(preset => (
                  <button 
                    key={preset}
                    className="text-[10px] bg-secondary/30 hover:bg-secondary py-1 rounded transition-colors"
                    onClick={() => {
                        // Preset logic
                        if (preset === "Flash In") {
                            setCurvePoints([
                                { id: "1", x: 0, y: 80 },
                                { id: "2", x: 30, y: 20 },
                                { id: "3", x: 100, y: 50 }
                            ]);
                        } else if (preset === "Slow Mo") {
                             setCurvePoints([
                                { id: "1", x: 0, y: 50 },
                                { id: "2", x: 50, y: 10 },
                                { id: "3", x: 100, y: 50 }
                            ]);
                        }
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SectionContent>
    </Section>
  );
}
