import { useAnimationPresets } from "@/hooks/use-animation-presets";
import { type TimelineElement } from "@/types/timeline";
import { Button } from "@/components/ui/button";
import {
  Section,
  SectionContent,
  SectionFields,
  SectionHeader,
  SectionTitle,
} from "../section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon, Delete02Icon } from "@hugeicons/core-free-icons";
import { ANIMATION_PRESETS, type AnimationPreset } from "@/constants/animation-presets";

interface AnimationsSectionProps {
  element: TimelineElement;
  trackId: string;
}

export function AnimationsSection({ element, trackId }: AnimationsSectionProps) {
  const { applyPreset, removeAnimations, presets } = useAnimationPresets();

  const inPresets = presets.filter((p) => p.type === "in");
  const outPresets = presets.filter((p) => p.type === "out");
  const comboPresets = presets.filter((p) => p.type === "combo");

  return (
    <Section>
      <SectionHeader>
        <div className="flex items-center justify-between w-full">
          <SectionTitle>
            <HugeiconsIcon icon={AiMagicIcon} size={16} className="mr-2" />
            Animations
          </SectionTitle>
          {element.animations && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={() => removeAnimations({ trackId, element })}
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} />
            </Button>
          )}
        </div>
      </SectionHeader>
      <SectionContent>
        <Tabs defaultValue="in" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50 p-0.5 h-8">
            <TabsTrigger value="in" className="text-xs h-7">In</TabsTrigger>
            <TabsTrigger value="out" className="text-xs h-7">Out</TabsTrigger>
            <TabsTrigger value="combo" className="text-xs h-7">Combo</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 flex items-center justify-between px-1 mb-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Curve / Easing</span>
            <select 
              className="bg-secondary/50 text-[10px] rounded px-2 py-1 outline-none border-none cursor-pointer hover:bg-secondary transition-colors"
              onChange={(e) => {
                // Future: State management for easing
                console.log("Selected easing:", e.target.value);
              }}
            >
              <option value="linear">Linear</option>
              <option value="easeIn">Ease In</option>
              <option value="easeOut">Ease Out</option>
              <option value="smooth">Smooth</option>
              <option value="bounce">Bounce (Punch)</option>
            </select>
          </div>

          <div className="mt-2">
            <TabsContent value="in" className="mt-0 outline-none">
              <PresetGrid
                presets={inPresets}
                onSelect={(presetId) => applyPreset({ trackId, element, presetId })}
              />
            </TabsContent>
            <TabsContent value="out" className="mt-0 outline-none">
              <PresetGrid
                presets={outPresets}
                onSelect={(presetId) => applyPreset({ trackId, element, presetId })}
              />
            </TabsContent>
            <TabsContent value="combo" className="mt-0 outline-none">
              <PresetGrid
                presets={comboPresets}
                onSelect={(presetId) => applyPreset({ trackId, element, presetId })}
              />
            </TabsContent>
          </div>
        </Tabs>
      </SectionContent>
    </Section>
  );
}

function PresetGrid({
  presets,
  onSelect,
}: {
  presets: AnimationPreset[];
  onSelect: (id: string) => void;
}) {
  return (
    <ScrollArea className="h-[210px] w-full">
      <div className="grid grid-cols-3 gap-2 pr-3 pb-2 w-full justify-items-center">
        {presets.map((preset: AnimationPreset) => (
          <Button
            key={preset.id}
            variant="outline"
            className="group h-[76px] w-[76px] flex flex-col items-center justify-between bg-[#181818] hover:bg-nexus-neon/10 border border-transparent hover:border-nexus-neon transition-all p-1.5"
            onClick={() => onSelect(preset.id)}
          >
            <div className="flex-1 flex items-center justify-center">
              <HugeiconsIcon 
                icon={preset.type === 'combo' ? AiMagicIcon : AiMagicIcon} 
                size={22} 
                className="text-muted-foreground group-hover:text-nexus-neon transition-colors" 
              />
            </div>
            <div className="w-full flex-none mt-1">
              <span className="block truncate w-full text-[10px] font-medium text-center text-foreground/90">{preset.name}</span>
              <span className="block text-[8px] text-muted-foreground opacity-60 text-center">{preset.duration}s</span>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
