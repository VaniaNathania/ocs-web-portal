import { ReactElement, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useAuthContext } from "@/auth/useAuthContext";
import { AppRoutingSetup } from ".";
import { useLoaders } from "@/providers/LoadersProvider";
import { toast } from "sonner";

const AppRouting = (): ReactElement => {
  const { verify, setLoading } = useAuthContext();
  const { setScreenLoader } = useLoaders();

  const [previousLocation, setPreviousLocation] = useState("");
  const [firstLoad, setFirstLoad] = useState(true);

  const location = useLocation();
  const path = location.pathname.trim();

  // 🔔 Offline / Online listener
  useEffect(() => {
    const handleOffline = () => {
      toast.error("You are offline. Please check your internet connection.", {
        id: "offline-toast",
        duration: Infinity,
      });
    };

    const handleOnline = () => {
      toast.dismiss("offline-toast");
      toast.success("Back online");
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    if (firstLoad) {
      verify().finally(() => {
        setLoading(false);
        setFirstLoad(false);
      });
    }
  }, [firstLoad]);

  useEffect(() => {
    if (!firstLoad && path !== previousLocation) {
      setScreenLoader(true);

      verify()
        .catch(() => {
          throw new Error("User verify request failed!");
        })
        .finally(() => {
          setScreenLoader(false);
          setPreviousLocation(path);
        });
    }
  }, [location]);

  useEffect(() => {
    if (!CSS.escape(window.location.hash)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [previousLocation]);

  return <AppRoutingSetup />;
};

export { AppRouting };
