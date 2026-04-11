import { Navigate } from "react-router-dom";

const OrgProtectedRoute = ({ children }) => {
  const orgToken = localStorage.getItem("orgToken");
  const organization = localStorage.getItem("organization");

  if (!orgToken || !organization) {
    return <Navigate to="/organization/login" replace />;
  }

  return children;
};

export default OrgProtectedRoute;
