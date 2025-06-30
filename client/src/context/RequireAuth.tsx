import { Navigate, useLocation } from "react-router-dom";
import type { JSX } from "react";
import { useAuth } from "./AuthContext";

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
    const {user, isLoading} = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};