import {
  menuAccess,
  useRoleCheck,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";
import React, { createContext, useContext } from "react";
import { toast } from "sonner";

interface AllFeatureContextType {
  menuPrivAccess: menuAccess;
}

// Create the context with proper typing
export const AllFeatureContext = createContext<
  AllFeatureContextType | undefined
>(undefined);

export const AllFeatureProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { checkMenusPriv } = useRoleCheck();
  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv(
      "/main-menu/data-reference/all-features/all-feature-content/AllFeaturesPage",
      "addStatus",
    ),
    editStatus: checkMenusPriv(
      "/main-menu/data-reference/all-features/all-feature-content/AllFeaturesPage",
      "editStatus",
    ),
    deleteStatus: checkMenusPriv(
      "/main-menu/data-reference/all-features/all-feature-content/AllFeaturesPage",
      "deleteStatus",
    ),
    readStatus: checkMenusPriv(
      "/main-menu/data-reference/all-features/all-feature-content/AllFeaturesPage",
      "readStatus",
    ),
  };

  const value = {
    menuPrivAccess,
  };
  return (
    <AllFeatureContext.Provider value={value}>
      {children}
    </AllFeatureContext.Provider>
  );
};

// Custom hook to use the context
export const useAllFeature = () => {
  const context = useContext(AllFeatureContext);
  if (context === undefined) {
    throw new Error("useAllFeature must be used within an AllFeatureProvider");
  }
  return context;
};

export default AllFeatureContext;
