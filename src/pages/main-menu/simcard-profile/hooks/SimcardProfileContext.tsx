import { createContext, useContext, useEffect, useRef, useState, useCallback, Dispatch, SetStateAction } from "react";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { PrimaryNeProps, SimTypeProps } from "../../upload-simcard/hooks/UploadSimCardContext";
import { toast } from "sonner";
import { menuAccess, useRoleCheck } from "../../role-management/hook/useRoleCheck";
import { ContextProps, DatasProps, mode } from "../interface/interface";
import { datas } from "../mockDatas/mockDatas";
import { AreaDetailProps } from "../../change-number-profile/hooks/ChangeNumberProfileContext";

const SimcardProfileContext = createContext<ContextProps | undefined>(undefined);

const API_URL_REF = apiConfigRef.ref;

const SimcardProfileContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { GetData } = useCallApi();
  const { checkMenusPriv } = useRoleCheck();
  const [selectedRow, setSelectedRow] = useState<DatasProps | undefined>();
  const [areaDetail, setAreaDetail] = useState<AreaDetailProps[]>([]);
  const [primaryNe, setPrimaryNe] = useState<PrimaryNeProps[]>([]);
  const [simType, setSimType] = useState<SimTypeProps[]>([]);
  const [mode, setMode] = useState<mode>("view");

  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv("/main-menu/simcard-profile/SimcardProfilePage", "addStatus"),
    deleteStatus: checkMenusPriv("/main-menu/simcard-profile/SimcardProfilePage", "deleteStatus"),
    editStatus: checkMenusPriv("/main-menu/simcard-profile/SimcardProfilePage", "editStatus"),
    readStatus: checkMenusPriv("/main-menu/simcard-profile/SimcardProfilePage", "readStatus"),
  };

  useEffect(() => {
    const fetchAreaDetail = async () => {
      try {
        const response = await GetData(`${API_URL_REF}/change-number-profile/qry-area-detail`, {
          areaId: 1,
          spId: 0,
        });

        if (response.status) {
          setAreaDetail(response.data);

          return response.data;
        }
      } catch (err) {
        // console.error(err);
      }
    };

    const fetchPrimaryNe = async () => {
      try {
        const response = await GetData(`${API_URL_REF}/api/upload-sim-file/qry-hlr-area-id`, {
          areaId: 1,
          isLogicFlag: "N",
        });

        if (response.status) {
          setPrimaryNe(response.data);

          return response.data;
        }
      } catch (err) {
        // console.log(err);
      }
    };

    const fetchSimType = async () => {
      try {
        const response = await GetData(`${API_URL_REF}/api/upload-sim-file/qry-sim-type`, {});

        if (response.status) {
          setSimType(response.data);

          return response.data;
        }
      } catch (err) {
        //  console.log(err);
      }
    };

    fetchAreaDetail();
    fetchPrimaryNe();
    fetchSimType();
  }, []);

  const value = {
    menuPrivAccess,
    selectedRow,
    setSelectedRow,
    mode,
    setMode,
    primaryNe,
    areaDetail,
    simType,
  };

  return <SimcardProfileContext.Provider value={value}>{children}</SimcardProfileContext.Provider>;
};

export const useSimcardProfileContext = () => {
  const context = useContext(SimcardProfileContext);
  if (context === undefined) {
    throw new Error("useSimcardProfileContext must be used within an SimcardProfileContextProvider");
  }
  return context;
};

export { SimcardProfileContext, SimcardProfileContextProvider };
