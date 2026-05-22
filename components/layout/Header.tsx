'use client';

import { Play, Save, CheckCircle2 } from "lucide-react";
import { UserButton, Show, SignInButton } from "@clerk/nextjs";

interface HeaderProps {
  title?: string;
  isSaved?: boolean;
}

export default function Header({ title = "Untitled Workflow", isSaved = true }: HeaderProps) {
  return (
    <header className="h-14 border-b border-zinc-800 bg-black flex items-center justify-between px-6 sticky top-0 z-50 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="font-semibold text-white tracking-tight">{title}</h1>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          {isSaved ? "Saved" : "Unsaved changes"}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 h-8 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg border border-zinc-800 transition-all cursor-pointer">
            <Play className="h-3.5 w-3.5 fill-white stroke-none" />
            Run
          </button>
          <button className="flex items-center gap-2 px-3 h-8 bg-white text-black hover:bg-zinc-200 font-medium text-xs rounded-lg transition-all cursor-pointer">
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
        </div>
        <div className="h-4 w-px bg-zinc-800" />
        <Show when="signed-in">
          <UserButton />
        </Show>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="px-3 h-8 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg border border-zinc-800 transition-all cursor-pointer">
              Sign In
            </button>
          </SignInButton>
        </Show>
      </div>
    </header>
  );
}

