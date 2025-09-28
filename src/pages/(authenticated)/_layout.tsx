import ProtectedRoute from "@/components/protected-route";
import { Outlet } from "react-router";

const Layout = () => {
    return (
        <div>
            <ProtectedRoute>
                <Outlet />
            </ProtectedRoute>
        </div>
    )
}

export default Layout;
