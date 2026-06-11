import { createContext, useEffect, useState } from "react";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import {
  menuAccess,
  useRoleCheck,
} from "../../role-management/hook/useRoleCheck";

interface ContextProps {
  logOpen: boolean;
  setLogOpen: (show: boolean) => void;
  primaryNe: PrimaryNeProps[];
  simType: SimTypeProps[];
  menuPrivAccess: menuAccess;
}

export interface PrimaryNeProps {
  hlrId: number;
  areaId: number;
  beginAccNbr: number;
  endAccNbr: number;
  hlrType: string;
  hlrEdition: number;
  hlrName: string;
  isOnline: string;
}

export interface SimTypeProps {
  simTypeId: number;
  simTypeName: string;
  comments: string;
  spId: number;
  simTypeCode: string;
}

const API_URL_REF = apiConfigRef.ref;

const UploadSimCardContext = createContext<ContextProps | undefined>(undefined);

const UploadSimCardContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { GetData } = useCallApi();
  const [primaryNe, setPrimaryNe] = useState<PrimaryNeProps[]>([]);
  const [simType, setSimType] = useState<SimTypeProps[]>([]);
  const [logOpen, setLogOpen] = useState<boolean>(false);
  const { checkMenusPriv } = useRoleCheck();
  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv(
      "/main-menu/upload-simcard/UploadSimCardPage",
      "addStatus",
    ),
    editStatus: checkMenusPriv(
      "/main-menu/upload-simcard/UploadSimCardPage",
      "editStatus",
    ),
    readStatus: checkMenusPriv(
      "/main-menu/upload-simcard/UploadSimCardPage",
      "readStatus",
    ),
    deleteStatus: checkMenusPriv(
      "/main-menu/upload-simcard/UploadSimCardPage",
      "deleteStatus",
    ),
  };

  const fetchPrimaryNe = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/upload-sim-file/qry-hlr-area-id`,
        {},
      );

      if (response.status) {
        setPrimaryNe(response.data);

        return response.data;
      }
    } catch (err) {
      //  console.log(err);
    }
  };

  const fetchSimType = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/upload-sim-file/qry-sim-type`,
        {},
      );

      if (response.status) {
        setSimType(response.data);

        return response.data;
      }
    } catch (err) {
      //  console.log(err);
    }
  };

  useEffect(() => {
    fetchPrimaryNe();
    fetchSimType();
  }, []);

  return (
    <UploadSimCardContext.Provider
      value={{ logOpen, setLogOpen, primaryNe, simType, menuPrivAccess }}
    >
      {children}
    </UploadSimCardContext.Provider>
  );
};

export { UploadSimCardContext, UploadSimCardContextProvider };
