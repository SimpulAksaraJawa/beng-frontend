import * as React from "react";
import {
  Package,
  ReceiptText,
  Tag,
  Boxes,
  Factory,
  Users,
  LucideIcon,
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
import { useAuth, User } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type MainLink = {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: {
    title: string;
    url: string;
  }[];
};

type UserLink = {
  name: string;
  url: string;
  icon?: LucideIcon;
}

type innerPath = {
  [key: string]: MainLink;
}

type Path = {
  navMain: MainLink[];
  users: any;
}


const path: innerPath = {
  products: {
    title: "Products",
    url: "/product",
    icon: Package,
    items: [
      {
        title: "Adjustments",
        url: "/adjustments",
      },
    ]
  },
  orders: {
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
  sales: {
    title: "Sale",
    url: "/sales",
    icon: Tag,
    items: [
      {
        title: "Sale Details",
        url: "/sale/details",
      },
    ],
  },
  stock: {
    title: "Stock",
    url: "/Stock",
    icon: Boxes,
  },
  permission: {
    title: "Permission Updates",
    url: "/permission",
    icon: ReceiptText,
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const navigate = useNavigate();

  const userAccess = (currUser: User): Path => {
    if (currUser.role === "ADMIN") {
      return {
        navMain: [
          path.products,
          path.orders,
          path.sales,
          path.stock,
          path.permission
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
        ]
      }
    }

    const features = ["products", "orders", "sales", "stock"]
    const allowed = {
      navMain: [] as MainLink[],
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
      ] as UserLink[]
    }

    features.forEach((f: string) => {
      if (currUser.permissions[f]?.includes("read")) {
        allowed.navMain.push(path[f]);
      }
    })

    return allowed;
  }

  const currUser = {
    name: user?.name || "Shadcn",
    email: user?.email || "my-email@example.com",
    avatar: "/otter.png",
    role: user?.role || "USER",
  }

  const data: Path = user ? userAccess(user) : {
    navMain: [],
    users: []
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
        <NavUser user={currUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
