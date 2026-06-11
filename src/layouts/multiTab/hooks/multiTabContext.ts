import { PortalData } from "@/pages/main-menu/role-management/outlet/portal/hook/PortalProvider";
import { createContext, Dispatch, SetStateAction } from "react";
import { tabItem } from "../models/interfaces";
import { UseQueryResult } from "@tanstack/react-query";
import { Party } from "@/pages/main-menu/directory-menu-management/hook/CompProvider";

interface MultiTabContextType {
  tabs: tabItem[];
  allTab: tabItem[];
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;

  openTab: ({ id, title, component }: tabItem) => void;
  openByPath: (party: Party) => void;
  openHome: () => void;
  openProfile: () => void;

  closeTab: (tabItem: tabItem) => void;
  userPortalQuery: UseQueryResult<PortalData[]>;
  activePortal?: PortalData;
  setActivePortal: Dispatch<SetStateAction<PortalData | undefined>>;
  popUpProfile: boolean;
  setPopUpProfile: Dispatch<SetStateAction<boolean>>;
}

// Create the context with proper typing
export const MultiTabContext = createContext<MultiTabContextType | undefined>(undefined);