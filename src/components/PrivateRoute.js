import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PrivateRoute = ({ children, roleRequired }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" />;
    if (roleRequired && user.role !== roleRequired) return <Navigate to="/admin" />;

    return children;
};

export default PrivateRoute;
