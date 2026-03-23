import { useEditor } from "@/hooks/use-editor";
import { ANIMATION_PRESETS, type AnimationPreset } from "@/constants/animation-presets";
import { generateUUID } from "@/utils/id";
import { type TimelineElement } from "@/types/timeline";
import { type AnimationChannel, type AnimationKeyframe } from "@/types/animation";
import { getAnimationPropertyDefinition } from "@/lib/animation/property-registry";

export function useAnimationPresets() {
  const editor = useEditor();

  const applyPreset = ({
    trackId,
    element,
    presetId,
  }: {
    trackId: string;
    element: TimelineElement;
    presetId: string;
  }) => {
    const preset = ANIMATION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const elementDuration = element.duration;
    const animations = element.animations ?? { channels: {} };
    const nextChannels = { ...animations.channels };

    for (const [propertyPath, presetKeyframes] of Object.entries(preset.properties)) {
      if (!presetKeyframes) continue;

      const propertyDefinition = getAnimationPropertyDefinition({ propertyPath: propertyPath as any });
      
      // Calculate start time and scaled duration for the preset
      let startTime = 0;
      let duration = preset.duration;

      if (preset.type === "out") {
        startTime = Math.max(0, elementDuration - preset.duration);
        duration = Math.min(preset.duration, elementDuration);
      } else if (preset.type === "combo") {
        startTime = 0;
        duration = elementDuration;
      } else {
        // "in"
        startTime = 0;
        duration = Math.min(preset.duration, elementDuration);
      }

      const keyframes: AnimationKeyframe[] = presetKeyframes.map((pk) => {
        const time = startTime + pk.offset * duration;
        return {
          id: generateUUID(),
          time,
          value: pk.value,
          interpolation: pk.interpolation ?? (propertyDefinition.valueKind === "discrete" ? "hold" : "linear"),
        } as AnimationKeyframe;
      });

      nextChannels[propertyPath] = {
        valueKind: propertyDefinition.valueKind,
        keyframes: keyframes.sort((a, b) => a.time - b.time),
      } as AnimationChannel;
    }

    editor.timeline.updateElements({
      updates: [
        {
          trackId,
          elementId: element.id,
          updates: {
            animations: {
              channels: nextChannels,
            },
          },
        },
      ],
    });
  };

  const removeAnimations = ({
    trackId,
    element,
  }: {
    trackId: string;
    element: TimelineElement;
  }) => {
    editor.timeline.updateElements({
      updates: [
        {
          trackId,
          elementId: element.id,
          updates: {
            animations: undefined,
          },
        },
      ],
    });
  };

  return {
    applyPreset,
    removeAnimations,
    presets: ANIMATION_PRESETS,
  };
}
