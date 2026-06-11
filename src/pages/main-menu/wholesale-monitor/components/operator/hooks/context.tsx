import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { apiConfigRef } from "@/config/api.config";
import { OrgData } from "@/pages/main-menu/upload-simcard/blocks/Organization";
import { StaffList } from "../../../models/interfaces";

interface OperatorContextType {
  selectedOrg?: OrgData;
  setSelectedOrg: Dispatch<SetStateAction<OrgData | undefined>>;
  selectedStaff?: StaffList;
  setSelectedStaff: Dispatch<SetStateAction<StaffList | undefined>>;
}

// Create the context with proper typing
export const OperatorContext = createContext<OperatorContextType | undefined>(
  undefined,
);

const API_URL = apiConfigRef.ref;

export const OperatorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedOrg, setSelectedOrg] = useState<OrgData>();
  const [selectedStaff, setSelectedStaff] = useState<StaffList>();

  const value: OperatorContextType = {
    selectedOrg,
    setSelectedOrg,
    selectedStaff,
    setSelectedStaff,
  };

  return (
    <OperatorContext.Provider value={value}>
      {children}
    </OperatorContext.Provider>
  );
};

// Custom hook to use the context
export const useOperator = () => {
  const context = useContext(OperatorContext);
  if (context === undefined) {
    throw new Error("useOperator must be used within an OperatorProvider");
  }
  return context;
};

export default OperatorContext;
