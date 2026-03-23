"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAIStore } from "@/stores/ai-store";
import { Sparkles, Scissors, Trash, VolumeX, Type, Languages, Zap } from "lucide-react";
import { cn } from "@/utils/ui";
import { motion, AnimatePresence } from "motion/react";

interface MagicBarProps {
  projectId: string;
}

export function MagicBar({ projectId }: MagicBarProps) {
  const [open, setOpen] = React.useState(false);
  const { sendMessage, isThinking } = useAIStore();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: string) => {
    sendMessage(command, projectId);
    setOpen(false);
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-violet-600/10 via-transparent to-emerald-500/10 pointer-events-none" />
          
          <div className="flex items-center border-b border-white/5 px-4 py-4 bg-black/40 backdrop-blur-3xl">
            <div className="relative mr-4">
               <Sparkles className="h-6 w-6 text-violet-400 animate-pulse" />
               <motion.div 
                className="absolute inset-0 bg-violet-500/30 blur-xl rounded-full"
                animate={{ scale: [1, 2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
               />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-white tracking-[0.4em] uppercase">Kurvo Intelligence</span>
              <span className="text-[8px] text-violet-400/60 font-medium tracking-[0.2em] uppercase">Autonomous Creative Engine</span>
            </div>
            
            <AnimatePresence>
              {isThinking && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="ml-auto flex items-center gap-2"
                >
                  <Zap className="h-3 w-3 text-emerald-500 animate-bounce" />
                  <span className="text-[10px] text-emerald-500 font-mono">THINKING...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <CommandInput 
            placeholder="What should I do? (e.g. 'split the clip', 'add malayalam captions')" 
            className="text-base py-6 border-none focus:ring-0"
          />
          
          <CommandList className="max-h-[350px] p-2 scrollbar-hidden">
            <CommandEmpty className="py-12 flex flex-col items-center gap-2">
              <Sparkles className="h-8 w-8 text-muted-foreground/20" />
              <p className="text-muted-foreground text-xs">No magic found for that query...</p>
            </CommandEmpty>
            
            <CommandGroup heading="Timeline Magic" className="px-2">
              <CommandItem 
                onSelect={() => runCommand("split")}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-violet-500/10 group cursor-pointer transition-all"
              >
                <div className="p-2 rounded-lg bg-zinc-900 border border-white/5 group-hover:border-violet-500/30">
                  <Scissors className="h-4 w-4 text-violet-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Razor Split</span>
                  <span className="text-[10px] text-muted-foreground">Cut the selected clip at the playhead</span>
                </div>
              </CommandItem>

              <CommandItem 
                onSelect={() => runCommand("delete selected")}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 group cursor-pointer transition-all"
              >
                <div className="p-2 rounded-lg bg-zinc-900 border border-white/5 group-hover:border-destructive/30">
                  <Trash className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Delete Selection</span>
                  <span className="text-[10px] text-muted-foreground">Remove the active clips from timeline</span>
                </div>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator className="my-2 bg-white/5" />

            <CommandGroup heading="AI Intelligence" className="px-2">
              <CommandItem 
                onSelect={() => runCommand("add captions")}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-500/10 group cursor-pointer transition-all"
              >
                <div className="p-2 rounded-lg bg-zinc-900 border border-white/5 group-hover:border-emerald-500/30">
                  <Type className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Dynamic Captions</span>
                  <span className="text-[10px] text-muted-foreground">Auto-generate viral subtitles</span>
                </div>
              </CommandItem>

              <CommandItem 
                onSelect={() => runCommand("add malayalam captions")}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-500/10 group cursor-pointer transition-all"
              >
                <div className="p-2 rounded-lg bg-zinc-900 border border-white/5 group-hover:border-orange-500/30">
                  <Languages className="h-4 w-4 text-orange-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Malayalam Captions</span>
                  <span className="text-[10px] text-muted-foreground">Localize video with Malayalam subs</span>
                </div>
              </CommandItem>
            </CommandGroup>
          </CommandList>
          
          <div className="p-3 border-t bg-black/20 flex justify-between items-center px-5">
            <div className="flex items-center gap-1.5 opacity-50">
              <kbd className="px-1.5 py-0.5 rounded-sm bg-zinc-800 text-[9px] border border-white/10 font-sans">ESC</kbd>
              <span className="text-[10px]">to close</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded-sm bg-violet-600 text-white text-[9px] border border-violet-400/50 font-sans font-bold shadow-[0_0_10px_rgba(139,92,246,0.3)]">ENTER</kbd>
              <span className="text-[10px] opacity-70">to execute</span>
            </div>
          </div>
        </div>
      </CommandDialog>

      {/* Floating Magic Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-violet-600 text-white shadow-2xl shadow-violet-600/40 border border-violet-400/50 cursor-pointer overflow-hidden group"
      >
        <motion.div 
          className="absolute inset-0 bg-linear-to-tr from-violet-400 to-transparent opacity-0 group-hover:opacity-30 transition-opacity"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        <Sparkles className="h-6 w-6 relative z-10" />
      </motion.button>
    </>
  );
}
