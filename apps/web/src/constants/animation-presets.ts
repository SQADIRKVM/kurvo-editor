import type { AnimationPropertyPath, AnimationInterpolation } from "@/types/animation";

export interface AnimationPresetKeyframe {
  offset: number; // 0 to 1, relative to animation duration (e.g. 0.5s)
  value: number;
  interpolation?: AnimationInterpolation;
}

export interface AnimationPreset {
  id: string;
  name: string;
  type: "in" | "out" | "combo";
  duration: number; // default duration in seconds
  properties: Partial<Record<AnimationPropertyPath, AnimationPresetKeyframe[]>>;
}

export const ANIMATION_PRESETS: AnimationPreset[] = [
  // --- IN ANIMATIONS ---
  {
    id: "fade-in",
    name: "Fade In",
    type: "in",
    duration: 0.5,
    properties: {
      "opacity": [
        { offset: 0, value: 0 },
        { offset: 1, value: 1 }
      ]
    }
  },
  {
    id: "punch-zoom",
    name: "Punch Zoom",
    type: "in",
    duration: 0.4,
    properties: {
      "transform.scale": [
        { offset: 0, value: 0.5 },
        { offset: 0.7, value: 1.1 },
        { offset: 1, value: 1 }
      ]
    }
  },
  {
    id: "zoom-in",
    name: "Zoom In",
    type: "in",
    duration: 0.5,
    properties: {
      "transform.scale": [
        { offset: 0, value: 0 },
        { offset: 1, value: 1 }
      ]
    }
  },
  {
    id: "slide-right",
    name: "Slide Right",
    type: "in",
    duration: 0.5,
    properties: {
      "transform.position.x": [
        { offset: 0, value: -200 },
        { offset: 1, value: 0 }
      ]
    }
  },
  {
    id: "slide-left",
    name: "Slide Left",
    type: "in",
    duration: 0.5,
    properties: {
      "transform.position.x": [
        { offset: 0, value: 200 },
        { offset: 1, value: 0 }
      ]
    }
  },
  // --- OUT ANIMATIONS ---
  {
    id: "fade-out",
    name: "Fade Out",
    type: "out",
    duration: 0.5,
    properties: {
      "opacity": [
        { offset: 0, value: 1 },
        { offset: 1, value: 0 }
      ]
    }
  },
  {
    id: "zoom-out",
    name: "Zoom Out",
    type: "out",
    duration: 0.5,
    properties: {
      "transform.scale": [
        { offset: 0, value: 1 },
        { offset: 1, value: 0 }
      ]
    }
  },
  // --- COMBO ---
  {
    id: "zoom-in-out",
    name: "Zoom In & Out",
    type: "combo",
    duration: 1.0,
    properties: {
      "transform.scale": [
        { offset: 0, value: 0 },
        { offset: 0.5, value: 1.2 },
        { offset: 1, value: 0 }
      ]
    }
  }
];
