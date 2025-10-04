import { Navigate } from "@/router";
import { useAuth } from "@/contexts/AuthContext";
import { LoaderIcon } from "lucide-react";

type Props = {
    children: React.ReactNode;
};

const ProtectedRoute = ({ children }: Props) => {
    const { user, accessToken, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <LoaderIcon className="animate-spin size-10" />
            </div>
        )
    }

    if (!user || !accessToken) {
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;