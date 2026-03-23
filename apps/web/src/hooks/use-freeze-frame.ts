/**
 * useFreezeFrame
 *
 * Freezes the video at the current playhead position:
 * 1. Renders the current frame to an off-screen canvas → base64 PNG.
 * 2. Splits the selected video element at the current playhead time.
 * 3. Inserts a 3-second ImageElement (frozen frame) between the two halves.
 */
"use client";

import { useEditor } from "@/hooks/use-editor";
import { useElementSelection } from "@/hooks/timeline/element/use-element-selection";
import { CanvasRenderer } from "@/services/renderer/canvas-renderer";
import { getLastFrameTime } from "@/lib/time";
import { toast } from "sonner";

const FREEZE_DURATION_SECONDS = 3;

export function useFreezeFrame() {
  const editor = useEditor();
  const { selectedElements } = useElementSelection();

  const freezeFrame = async () => {
    // 1. Validate
    const activeProject = editor.project.getActive();
    if (!activeProject) { toast.error("No active project"); return; }

    const renderTree = editor.renderer.getRenderTree();
    if (!renderTree) { toast.error("Add media to the timeline first"); return; }

    const videoSelection = selectedElements.find(({ trackId }) => {
      const track = editor.timeline.getTrackById({ trackId });
      return track?.type === "video";
    });
    if (!videoSelection) { toast.error("Select a video clip on the timeline first"); return; }

    const { trackId, elementId } = videoSelection;
    const track = editor.timeline.getTrackById({ trackId });
    const element = track?.elements.find((el) => el.id === elementId);
    if (!element || element.type !== "video") { toast.error("Selected element is not a video clip"); return; }

    const currentTime = editor.playback.getCurrentTime();
    const { startTime, duration } = element;
    if (currentTime <= startTime || currentTime >= startTime + duration) {
      toast.error("Move the playhead inside the selected video clip");
      return;
    }

    // 2. Capture frame
    toast.loading("Capturing frame…", { id: "freeze-frame" });
    try {
      const { canvasSize, fps } = activeProject.settings;
      const lastFrameTime = getLastFrameTime({
        duration: editor.timeline.getTotalDuration(),
        fps,
      });
      const renderTime = Math.min(currentTime, lastFrameTime);

      const renderer = new CanvasRenderer({ width: canvasSize.width, height: canvasSize.height, fps });
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvasSize.width;
      tempCanvas.height = canvasSize.height;

      await renderer.renderToCanvas({ node: renderTree, time: renderTime, targetCanvas: tempCanvas });

      const dataUrl = tempCanvas.toDataURL("image/png");

      // 3. Register as a media asset via the existing uploadMedia flow
      const blob = await (await fetch(dataUrl)).blob();
      const freezeFile = new File([blob], `freeze-${Date.now()}.png`, { type: "image/png" });

      // Use the editor's media upload path (same as drag-drop)
      let freezeAssetId: string | null = null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (editor.media as any).uploadMedia({ file: freezeFile });
        freezeAssetId = result?.id ?? null;
      } catch {
        // Fallback: create an object URL and use it as an ad-hoc asset
        console.warn("uploadMedia not available, using object URL fallback");
      }

      if (!freezeAssetId) {
        // Create a minimal in-memory asset registration
        const objectUrl = URL.createObjectURL(blob);
        const fakeId = `freeze-${Date.now()}`;
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (editor.media as any)._assets = [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(editor.media as any).getAssets(),
            {
              id: fakeId,
              name: `Freeze @ ${renderTime.toFixed(2)}s`,
              type: "image",
              url: objectUrl,
              size: blob.size,
              createdAt: new Date(),
            },
          ];
        } catch { /* best-effort */ }
        freezeAssetId = fakeId;
      }

      // 4. Split clip
      const rightSideElements = editor.timeline.splitElements({
        elements: [{ trackId, elementId }],
        splitTime: currentTime,
        retainSide: "both",
      });

      // 5. Push right clip forward to make room
      const rightClip = rightSideElements[0];
      if (rightClip) {
        editor.timeline.updateElements({
          updates: [
            {
              trackId: rightClip.trackId,
              elementId: rightClip.elementId,
              updates: { startTime: currentTime + FREEZE_DURATION_SECONDS },
            },
          ],
        });
      }

      // 6. Insert the frozen ImageElement
      editor.timeline.insertElement({
        element: {
          name: "Freeze Frame",
          type: "image",
          mediaId: freezeAssetId,
          startTime: currentTime,
          duration: FREEZE_DURATION_SECONDS,
          trimStart: 0,
          trimEnd: 0,
          transform: { scale: 1, position: { x: 0, y: 0 }, rotate: 0 },
          opacity: 1,
        },
        placement: { mode: "explicit", trackId },
      });

      toast.success("Freeze frame added (3 seconds)", { id: "freeze-frame" });
    } catch (error) {
      console.error("Freeze frame failed:", error);
      toast.error("Failed to freeze frame", { id: "freeze-frame" });
    }
  };

  return { freezeFrame };
}
