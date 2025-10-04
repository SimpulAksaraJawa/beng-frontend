import ProtectedRoute from "@/components/protected-route";
import { Outlet } from "react-router";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar";
const Layout = () => {
    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <div className="flex flex-1 flex-col">
                        <Outlet />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    )
}

export default Layout;
