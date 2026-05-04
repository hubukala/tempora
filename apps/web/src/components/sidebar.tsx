"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Clock,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Timer,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Time", href: "/time", icon: Clock },
  { label: "Invoices", href: "/invoices", icon: FileText },
  { label: "Clients", href: "/clients", icon: Users },
];

interface SidebarProps {
  user: { name?: string | null; email?: string | null };
}

function SidebarContent({
  pathname,
  user,
  onNavClick,
}: {
  pathname: string;
  user: SidebarProps["user"];
  onNavClick?: () => void;
}) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-5">
        <Timer className="h-5 w-5 text-brand-400" />
        <span className="text-base font-semibold tracking-tight">Tempora</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Button
              key={href}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2.5 font-normal",
                isActive && "font-medium"
              )}
              asChild
              onClick={onNavClick}
            >
              <Link href={href}>
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="border-t px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name ?? "—"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r md:flex md:flex-col">
        <SidebarContent pathname={pathname} user={user} />
      </aside>

      {/* Mobile: hamburger + Sheet */}
      <div className="fixed left-0 top-0 z-40 flex items-center p-3 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0" showCloseButton={false}>
            <SidebarContent
              pathname={pathname}
              user={user}
              onNavClick={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
