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

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
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
          url: "/adjustment",
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
      title: "Sales",
      url: "/sales",
      icon: Tag,
      items: [
        {
          title: "Sale Details",
          url: "/sales/details",
        },
      ],
    },
    {
      title: "Stocks",
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
      url: "/suppliers",
      icon: Factory,
    },
    {
      name: "Customer",
      url: "/customers",
      icon: Users,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Collapsible className="group/collapsible">
              <SidebarMenuButton className="hover:bg-white/50 data-[state=open]:hover:bg-white/50 active:bg-white/50">
                <div className="flex justify-start items-center flex-row">
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
