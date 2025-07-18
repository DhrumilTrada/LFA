"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Image,
  Users,
  BookOpen,
  Edit,
  Folder,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible } from "@/components/ui/collapsible";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

// Data for the sidebar
export const sidebarData = {
  user: {
    name: "Namra Mevada",
    email: "namra@example.com",
    avatar: "",
  },
  mainNav: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Gallery",
      url: "/admin/gallery",
      icon: Image,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Magazine",
      url: "/admin/magazine",
      icon: BookOpen,
    },
    {
      title: "Editorials",
      url: "/admin/editorials",
      icon: Edit,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpen, isMobile } = useSidebar();
  return (
    <Sidebar className="bg-background" {...props}>
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              onClick={() => isMobile && setOpen(false)}
            >
              <a href="#" className="">
                <div className="grid flex-1 text-center text-sm leading-tight">
                  <span className="truncate font-extrabold text-2xl">
                    LFA CLUB
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <MainNavigation />
      </SidebarContent>
      <SidebarFooter className="border-t">
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}

function MainNavigation() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {sidebarData.mainNav.map((item) => {
          const isActive = pathname === item.url;
          const activeClasses = isActive
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:bg-secondary hover:text-blue-700";
          return (
            <Collapsible key={item.title} asChild defaultOpen={isActive}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link
                    href={item.url}
                    className={`flex items-center gap-3 px-4 py-5 rounded-lg transition-colors duration-200 ${activeClasses}`}
                    style={{ marginBottom: "8px" }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-[16px] font-medium">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function UserProfile() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="hover:bg-gray-100 data-[state=open]:bg-blue-100"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage
              src={sidebarData.user.avatar}
              alt={sidebarData.user.name}
            />
            <AvatarFallback className="rounded-lg">
              {sidebarData.user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {sidebarData.user.name}
            </span>
            <span className="truncate text-xs">{sidebarData.user.email}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
