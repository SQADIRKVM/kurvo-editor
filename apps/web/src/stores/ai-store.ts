/**
 * AI Chat Layer Store
 * Manages chat messages, AI actions, and execution state.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  actions?: AIAction[];
  isLoading?: boolean;
}

export interface AIAction {
  type:
    | "trim"
    | "split"
    | "delete"
    | "add_text"
    | "add_caption"
    | "mute"
    | "zoom"
    | "silence_remove"
    | "reorder"
    | "set_speed"
    | "add_transition"
    | "info";
  params?: Record<string, unknown>;
  description: string;
  status?: "pending" | "executing" | "done" | "failed";
}

export interface AIActionResult {
  messageId: string;
  actionIndex: number;
  success: boolean;
  detail?: string;
}

interface AIStore {
  // Chat state
  messages: ChatMessage[];
  isThinking: boolean;
  chatOpen: boolean;

  // Actions
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => string;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  clearMessages: () => void;
  setChatOpen: (open: boolean) => void;
  setThinking: (v: boolean) => void;

  // AI send
  sendMessage: (text: string, projectId: string) => Promise<void>;
}

function genId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      messages: [],
      isThinking: false,
      chatOpen: false,

      addMessage: (msg) => {
        const id = genId();
        set((state) => ({
          messages: [
            ...state.messages,
            { ...msg, id, timestamp: Date.now() },
          ],
        }));
        return id;
      },

      updateMessage: (id, patch) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, ...patch } : m
          ),
        }));
      },

      clearMessages: () => set({ messages: [] }),

      setChatOpen: (open) => set({ chatOpen: open }),

      setThinking: (v) => set({ isThinking: v }),

      sendMessage: async (text, projectId) => {
        const { addMessage, updateMessage, setThinking, messages } = get();

        // Add user message
        addMessage({ role: "user", content: text });

        // Add loading placeholder
        const assistantId = addMessage({
          role: "assistant",
          content: "",
          isLoading: true,
        });

        setThinking(true);

        try {
          const res = await fetch("/api/ai-editor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: text,
              projectId,
              history: messages.slice(-6).map((m) => ({
                role: m.role,
                content: m.content,
              })),
            }),
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();

          updateMessage(assistantId, {
            content: data.reply ?? "Done! Check your timeline.",
            actions: data.actions ?? [],
            isLoading: false,
          });
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : "Unknown error";
          updateMessage(assistantId, {
            content: `⚠️ AI error: ${errorMsg}. Check your connection.`,
            isLoading: false,
          });
        } finally {
          setThinking(false);
        }
      },
    }),
    {
      name: "ai-chat-store",
      partialize: (state) => ({
        messages: state.messages.slice(-50), // Keep last 50 messages
        chatOpen: state.chatOpen,
      }),
    }
  )
);
