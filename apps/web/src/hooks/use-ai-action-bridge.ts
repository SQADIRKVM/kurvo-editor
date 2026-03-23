"use client";

import { useEffect, useRef } from "react";
import { useAIStore, type AIAction } from "@/stores/ai-store";
import { EditorCore } from "@/core";

/**
 * AI Action Bridge
 * Listens for actions in the AIStore and executes them using EditorCore.
 */
export function useAIActionBridge() {
  const { messages } = useAIStore();
  const processedActions = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Only process the latest assistant message
    const lastMessage = messages[messages.length - 1];
    if (
      !lastMessage || 
      lastMessage.role !== "assistant" || 
      !lastMessage.actions || 
      lastMessage.actions.length === 0 ||
      lastMessage.isLoading
    ) {
      return;
    }

    // Skip if already processed
    if (processedActions.current.has(lastMessage.id)) return;

    const executeActions = async () => {
      const editor = EditorCore.getInstance();
      const actions = lastMessage.actions!;

      console.log(`[AI Bridge] Processing ${actions.length} actions for message ${lastMessage.id}`);

      for (const action of actions) {
        try {
          console.log(`[AI Bridge] Executing action: ${action.type}`, action.params);
          await handleAction(editor, action);
        } catch (err) {
          console.error(`[AI Bridge] Failed to execute ${action.type}:`, err);
        }
      }

      processedActions.current.add(lastMessage.id);
    };

    executeActions();
  }, [messages]);
}

async function handleAction(editor: EditorCore, action: AIAction) {
  const timeline = editor.timeline;
  const playback = editor.playback;
  const selection = editor.selection;

  switch (action.type) {
    case "split": {
      const currentTime = playback.getCurrentTime();
      const selected = selection.getSelectedElements();
      
      let targets = selected;
      
      // If nothing selected, find what's under the playhead
      if (targets.length === 0) {
        const tracks = timeline.getTracks();
        targets = tracks.flatMap(track => 
          track.elements
            .filter(el => {
              const start = el.startTime;
              const end = el.startTime + el.duration;
              return currentTime >= start && currentTime <= end;
            })
            .map(el => ({ trackId: track.id, elementId: el.id }))
        );
      }

      if (targets.length > 0) {
        timeline.splitElements({
          elements: targets,
          splitTime: currentTime,
          retainSide: "both"
        });
      }
      break;
    }

    case "delete": {
      const selected = selection.getSelectedElements();
      if (selected.length > 0) {
        timeline.deleteElements({ elements: selected });
      }
      break;
    }

    case "mute": {
      const selected = selection.getSelectedElements();
      if (selected.length > 0) {
        timeline.toggleElementsMuted({ elements: selected });
      }
      break;
    }

    case "add_caption": {
      const tracks = timeline.getTracks();
      const textTrack = tracks.find(t => t.type === "text") as any;
      
      const targetTrack = textTrack || { id: timeline.addTrack({ type: "text" }) };

      if (targetTrack) {
        timeline.insertElement({
          element: {
            type: "text",
            name: "AI Caption",
            content: "NEW CAPTION",
            startTime: playback.getCurrentTime(),
            duration: 2,
            trimStart: 0,
            trimEnd: 0,
            fontSize: 48,
            fontFamily: "Inter",
            color: "#FFFFFF",
            textAlign: "center",
            fontWeight: "bold",
            fontStyle: "normal",
            textDecoration: "none",
            opacity: 1,
            transform: { x: 0, y: 0, scale: 1, rotation: 0 },
            background: { enabled: true, color: "#000000" }
          } as any,
          placement: { 
            mode: "explicit",
            trackId: targetTrack.id
          }
        });
      }
      break;
    }

    case "info":
      // Just a confirmation action, nothing to execute on timeline
      break;

    default:
      console.warn(`[AI Bridge] Unhandled action type: ${action.type}`);
  }
}
