import { Outlet } from "react-router";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar";
const Layout = () => {
    return (
        <SidebarProvider
        
      >
            <AppSidebar variant="inset"/>
            <SidebarInset>

                <div className="flex flex-1 flex-col">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default Layout;
