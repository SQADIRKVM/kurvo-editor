# Kurvo Features & Transformation

This document details the features of the **Kurvo** video editor and the significant enhancements made from its **OpenCut** foundation.

---

## 🏗 Platform Evolution: OpenCut → Kurvo

| OpenCut (Baseline) | Kurvo (Redesign & Rebrand) |
| :--- | :--- |
| **Floating Island UI**: Gaps between panels, rounded corners, "unrefined" feel. | **Docked Pro Shell**: Zero-gap layout, sharp structural boundaries, integrated header/sidebar. |
| **Basic Trim/Split**: Foundational editing tools. | **Advanced Tools**: Freeze Frame, Chroma Key (Green Screen), Detach Audio, and Speed Curve Editor. |
| **Standard Export**: Basic FFmpeg pipeline. | **Optimized Engine Engine**: Decoupled state for high-FPS scrubbing and advanced multi-track transitions. |
| **Generic Brand**: Open-source placeholder. | **Premium Brand**: Metallic "K" logo, "Kurvo Intelligence" AI integration, and "Spatial Glass" aesthetic. |

---

## 🎨 Core Features (Implemented)

### 1. Professional Layout & Design
- **Integrated Pro Docking**: Header and Sidebar are full-width/height, eliminating floating margins.
- **Zero-Gap Panel System**: Resizable panels with sharp, professional borders.
- **Spatial Glass Aesthetic**: Premium materials with background blurs and violet metallic tokens.

### 2. Advanced Motion & Animation
- **Visual Animation Grids**: Easy-to-browse `In`, `Out`, and `Combo` presets.
- **Speed Curves**: Interactive SVG curve editor for precise velocity ramps.
- **Easing Engine**: Support for Linear, Quad, Cubic, Quart, and Custom interpolations.

### 3. Video Composition
- **Chroma Key**: Advanced color picker with similarity and smoothness controls for green-screen removal.
- **Freeze Frame**: One-click freeze frame with automatic canvas capture and insertion.
- **LUTS & Filters**: Cinematic and Vintage filter presets for professional color grading.
- **Transitions Engine**: Smooth wipes, slides, and zooms between clips via FFmpeg `xfade`.

### 4. Audio Control
- **Detach Audio**: Extract audio from video tracks for independent editing.
- **Advanced Audio Panel**: Volume sliders, Fade-in/out ramps, and Equalizer presets.
- **Voice Effects**: Tone shifting and pitch adjustment (Keep Pitch support).

### 5. Intelligence
- **Kurvo Intelligence (Magic Bar)**: Contextual AI actions accessible via `Ctrl+K` for autonomous editing workflows.

---

## ⚡ Performance Optimization
- **Decoupled Playhead**: Time updates are handled outside the React rendering loop to ensure 60fps playback.
- **Drag Store decoupling**: Moving elements on the timeline uses a lightweight store to prevent heavy UI re-renders.
- **IndexedDB & OPFS**: Efficient local storage for media assets and project state.
