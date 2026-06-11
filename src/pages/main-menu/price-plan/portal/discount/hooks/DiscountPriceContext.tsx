import React, {
  act,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { DefaultTooltip, KeenIcon, ScreenLoader } from "@/components";
import { Button } from "@/components/ui/button";
import { apiConfig } from "@/config/api.config";
import { Stepper, Step, StepLabel } from "@mui/material";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { useIntl } from "react-intl";
import {
  FaChevronDown,
  FaChevronUp,
  FaEllipsisV,
  FaPlus,
} from "react-icons/fa";
import DiscountList from "../blocks/DiscountList";
import DiscountAPI from "./DiscountAPI";

interface ContextProps {
  selectedDiscount: DiscountList | null;
  setSelectedDiscount: React.Dispatch<
    React.SetStateAction<DiscountList | null>
  >;
  acctItemType: IAcctItemType[];
  GetAccountItemType: () => Promise<void>;
  discountTypeList: DiscountType[];
  setDiscountTypeList: React.Dispatch<React.SetStateAction<DiscountType[]>>;
  distributeMethodList: DistributeMethod[];
  setDistributeMethodList: React.Dispatch<
    React.SetStateAction<DistributeMethod[]>
  >;
  discountMethodList: DiscountMethodList[];
  setDiscountMethodList: React.Dispatch<
    React.SetStateAction<DiscountMethodList[]>
  >;
}

const initialProps: ContextProps = {
  selectedDiscount: null,
  setSelectedDiscount: () => {},
  acctItemType: [],
  GetAccountItemType: async () => {},
  discountTypeList: [],
  setDiscountTypeList: () => {},
  distributeMethodList: [],
  setDistributeMethodList: () => {},
  discountMethodList: [],
  setDiscountMethodList: () => {},
};

const API_URL = apiConfig.service_price_plan;
const DiscountPriceContext = createContext<ContextProps>(initialProps);

const DiscountPriceContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { PostData, GetData, DeleteData } = useCallApi();
  const { GetAcctItemTypeList } = DiscountAPI();
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountList | null>(
    null
  );
  const [acctItemType, setAcctItemType] = useState<IAcctItemType[]>([]);
  const [discountTypeList, setDiscountTypeList] = useState<DiscountType[]>([]);
  const [distributeMethodList, setDistributeMethodList] = useState<
    DistributeMethod[]
  >([]);
  const [discountMethodList, setDiscountMethodList] = useState<
    DiscountMethodList[]
  >([]);

  const GetAccountItemType = async () => {
    try {
      const response = await GetAcctItemTypeList("");

      if (response.status) {
        setAcctItemType(response.data || []);
      } else {
        toast.error(response.message);
        console.error(
          "Error fetching on discount price context: ",
          response.message
        );
      }
    } catch (error) {
      console.error("Error fetching on discount price context: ", error);
    }
  };

  return (
    <DiscountPriceContext.Provider
      value={{
        selectedDiscount,
        setSelectedDiscount,
        acctItemType,
        GetAccountItemType,
        discountTypeList,
        setDiscountTypeList,
        distributeMethodList,
        setDistributeMethodList,
        discountMethodList,
        setDiscountMethodList,
      }}
    >
      <DiscountList />
    </DiscountPriceContext.Provider>
  );
};

export { DiscountPriceContext, DiscountPriceContextProvider };
