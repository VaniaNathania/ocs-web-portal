import { Navigate, Outlet, useLocation } from "react-router-dom";

import { ScreenLoader } from "@/components/loaders";

import { useAuthContext } from "./useAuthContext";
import { useEffect, useState } from "react";
import { addLogActivity } from "@/actions/GlobalActions";

const RequireAuth = () => {
  const { auth, loading, userData } = useAuthContext();
  const location = useLocation();
  const [user, setUser] = useState<any>();

  const fetchUser = () => {
    const tempUser = userData();
    setUser(tempUser);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      addLogActivity(
        "page log",
        "PAGE_LOG",
        `change page to url ${location.pathname}}`,
        location.pathname,
      );
    }
  }, [location]);

  if (loading) {
    return <ScreenLoader />;
  }

  return auth ? (
    <Outlet />
  ) : (
    <Navigate to="/auth/login" state={{ from: location }} replace />
  );
};

export { RequireAuth };
