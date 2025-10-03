import * as React from "react";
import {
  Package,
  ReceiptText,
  Tag,
  Boxes,
  Factory,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const navigate = useNavigate();

  const data = {
    user: {
      name: user?.name || "Shadcn",
      email: user?.email || "my-email@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      // {
      //   title: "Dashboard",
      //   url: "/dashboard",
      //   icon: SquareTerminal,
      //   isActive: true,
      //   items: [
      //     {
      //       title: "History",
      //       url: "#",
      //     },
      //   ],
      // },
      {
        title: "Products",
        url: "/product",
        icon: Package,
        items: [
          {
            title: "Adjustments",
            url: "/adjustments",
          },
          // {
          //   title: "Explorer",
          //   url: "/",
          // },
          // {
          //   title: "Quantum",
          //   url: "/",
          // },
        ],
      },
      {
        title: "Orders",
        url: "/orders",
        icon: ReceiptText,
        items: [
          {
            title: "Order Details",
            url: "/orders/details",
          },
        ],
      },
      {
        title: "Sale",
        url: "#",
        icon: Tag,
        items: [
          {
            title: "Sale Details",
            url: "/sale/details",
          },
        ],
      },
      {
        title: "Stock",
        url: "/Stock",
        icon: Boxes,
      },
      // {
      //   title: "Settings",
      //   url: "#",
      //   icon: Settings2,
      //   items: [
      //     {
      //       title: "General",
      //       url: "#",
      //     },
      //     {
      //       title: "Team",
      //       url: "#",
      //     },
      //   ],
      // },
    ],
    users: [
      {
        name: "Supplier",
        url: "/supplier",
        icon: Factory,
      },
      {
        name: "Customer",
        url: "/customer",
        icon: Users,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Collapsible className="group/collapsible">
          <SidebarMenuButton className="hover:bg-white/50 data-[state=open]:hover:bg-white/50 active:bg-white/50">
            <div onClick={() => navigate("/dashboard")} className="flex justify-start items-center flex-row">
              <img
                src="/favicon.png"
                alt="BENG Logo"
                className="-ml-2 h-8 w-8 drop-shadow-2xl"
              />
              <h1 className="text-xl font-bold text-[#209ebb] group-data-[state=collapsed]/sidebar:hidden">
                BENG
              </h1>
            </div>
          </SidebarMenuButton>
          <CollapsibleContent></CollapsibleContent>
        </Collapsible>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.users} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
