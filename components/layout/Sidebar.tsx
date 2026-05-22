'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { 
  Activity, 
  Database, 
  Settings, 
  GitBranch, 
  Plus,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Workflows", icon: GitBranch },
  { href: "/credentials", label: "Credentials", icon: Database },
  { href: "/executions", label: "Runs & Logs", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen select-none shrink-0">
      {/* Logo */}
      <div className="h-14 border-b border-zinc-800 flex items-center px-6 gap-2">
        <div className="h-6 w-6 rounded bg-white flex items-center justify-center text-black font-black text-xs">
          8
        </div>
        <span className="font-sans font-bold tracking-tight text-white">n8nc</span>
      </div>

      {/* New Workflow button */}
      <div className="p-4">
        <Link 
          href="/workflows/new"
          className="flex items-center justify-center gap-2 w-full h-10 bg-white text-black hover:bg-zinc-200 font-medium text-sm rounded-xl transition-all duration-150"
        >
          <Plus className="h-4 w-4" />
          New Workflow
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium transition-all duration-150",
                isActive 
                  ? "bg-zinc-900 text-white border border-zinc-800" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-zinc-800">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 h-10 w-full rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-all duration-150"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
