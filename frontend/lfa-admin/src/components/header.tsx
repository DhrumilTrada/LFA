"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { sidebarData } from "./sidebar";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  // Find the active link based on current pathname
  const activeLink =
    sidebarData.mainNav.find((item) => pathname === item.url)?.title || "";

  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 cursor-pointer" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <span className="text-sm font-medium">{activeLink}</span>
      </div>
    </header>
  );
}
