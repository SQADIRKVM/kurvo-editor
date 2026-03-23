"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Send, Bot, User, Loader2, Sparkles, Trash2, X } from "lucide-react";
import { useAIStore } from "@/stores/ai-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/ui";

export function AIChatPanel() {
  const { messages, isThinking, sendMessage, clearMessages } = useAIStore();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const projectId = params.project_id as string;

  const handleSend = () => {
    if (!inputValue.trim() || isThinking) return;
    sendMessage(inputValue, projectId);
    setInputValue("");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  return (
    <div className="flex bg-background h-full flex-col border rounded-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-bold uppercase tracking-wider">AI Editor</span>
        </div>
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={clearMessages}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        <div className="flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Bot className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">How can I help you edit?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try: "Split clip at 5s", "Mute audio", or "Add subtitles"
                </p>
              </div>
            </div>
          )}
          
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex gap-3 max-w-[90%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-full shrink-0 flex items-center justify-center border",
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-orange-500" />}
              </div>
              <div className={cn(
                "flex flex-col gap-1.5",
                msg.role === "user" ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "px-3 py-2 rounded-lg text-[13px] leading-relaxed",
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted/50 border rounded-tl-none"
                )}>
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2 py-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs italic opacity-70">Thinking...</span>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
                
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {msg.actions.map((action, idx) => (
                      <div 
                        key={`${msg.id}-action-${idx}`}
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-500 font-medium"
                      >
                         <Sparkles className="w-3 h-3" />
                         {action.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t bg-muted/20">
        <div className="relative">
          <Input 
            placeholder="Ask AI to edit..." 
            className="pr-10 bg-background text-[13px] h-9 focus-visible:ring-orange-500"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute right-1 top-1 h-7 w-7 text-orange-500"
            disabled={!inputValue.trim() || isThinking}
            onClick={handleSend}
          >
            {isThinking ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
