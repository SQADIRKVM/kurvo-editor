export type TransitionType = 
  | "fade"
  | "cross-fade" 
  | "fade-white" 
  | "fade-black" 
  | "fade-grays"
  | "dissolve"
  | "pixelize"
  | "glitch"
  | "radial"
  | "hblur"
  | "wipe-left" 
  | "wipe-right" 
  | "wipe-up" 
  | "wipe-down"
  | "slide-left" 
  | "slide-right" 
  | "slide-up" 
  | "slide-down"
  | "smooth-left"
  | "smooth-right"
  | "smooth-up"
  | "smooth-down"
  | "circle-open"
  | "circle-close"
  | "horz-open"
  | "horz-close"
  | "vert-open"
  | "vert-close"
  | "diag-tl"
  | "diag-tr"
  | "diag-bl"
  | "diag-br"
  | "wipe-tl"
  | "wipe-tr"
  | "wipe-bl"
  | "wipe-br"
  | "squeeze-h"
  | "squeeze-v"
  | "zoom-in"
  | "zoom-out"
  | "hl-slice"
  | "hr-slice"
  | "vu-slice"
  | "vd-slice"
  | "distance"
  | "edge"
  | "hsv";

export interface TransitionDefinition {
  type: TransitionType;
  name: string;
  duration: number;
}

export interface TransitionElement {
  id: string;
  type: "transition";
  transitionType: TransitionType;
  duration: number;
  startTime: number;
  params: Record<string, any>;
}
