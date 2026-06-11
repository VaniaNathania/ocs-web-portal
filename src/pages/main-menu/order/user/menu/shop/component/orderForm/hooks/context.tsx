import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiConfigOrder, apiConfigRef } from "@/config/api.config";
import { ModSubsService } from "../../../../subscriber/components/mockModSubs";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useOrderShop } from "../../../hooks/shopContext";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  AttrRecState,
  DpOfferAttrRec,
  UUIDRec,
} from "@/pages/main-menu/order/models/types";
import {
  AccountInfo,
  AttrOrder,
  CustomerInfo,
  ShopTableItem,
  SIMCardDetail,
} from "@/pages/main-menu/order/models/interfaces";
import {
  DPOfferAttrList,
  DPOfferOrderList,
  StartOrderFlow,
} from "../../../../subscriber/components/modifysubscriber/model/interfaces";
import { v4 } from "uuid";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { ShopForm } from "../models/interfaces";
import { formatDate } from "@/hooks/generalHooks";

const API_REF = apiConfigRef.ref;

interface OrderFormContextType {
  availableOffer: ModSubsService[];
  setAvailableOffer: Dispatch<SetStateAction<ModSubsService[]>>;
  offer: DPOfferOrderList[];
  setOffer: Dispatch<SetStateAction<DPOfferOrderList[]>>;
  ownedOffer: DPOfferOrderList[];
  setOwnedOffer: Dispatch<SetStateAction<DPOfferOrderList[]>>;
  showAdd: boolean;
  setShowAdd: Dispatch<SetStateAction<boolean>>;
  showNumber: boolean;
  setShowNumber: Dispatch<SetStateAction<boolean>>;
  attrRec: AttrRecState;
  setAttrRec: Dispatch<SetStateAction<AttrRecState>>;
  offerList: UseQueryResult<ModSubsService[], Error>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  fetchOfferData: () => void;
  dpOfferAttrRec: DpOfferAttrRec;
  setDpOfferAttrRec: Dispatch<SetStateAction<DpOfferAttrRec>>;
  uuidRec: UUIDRec;
  setUuidRec: Dispatch<SetStateAction<UUIDRec>>;
  form?: ShopForm;
  setForm: Dispatch<SetStateAction<ShopForm | undefined>>;
  orderNbr: string;
  startOrderFlow: UseQueryResult<StartOrderFlow | undefined, Error>;
}

// Create the context with proper typing
export const OrderFormContext = createContext<OrderFormContextType | undefined>(
  undefined,
);

const API_URL = apiConfigOrder.order;

export const OrderFormProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [ownedOffer, setOwnedOffer] = useState<DPOfferOrderList[]>([]);
  const [offer, setOffer] = useState<DPOfferOrderList[]>([]);
  const [availableOffer, setAvailableOffer] = useState<ModSubsService[]>([]);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [showNumber, setShowNumber] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dpOfferAttrRec, setDpOfferAttrRec] = useState<{
    [id: string]: DPOfferAttrList[];
  }>({});
  const [uuidRec, setUuidRec] = useState<UUIDRec>({});
  const [attrRec, setAttrRec] = useState<{ [id: string]: AttrOrder[] }>({});
  const { selectedTableItem } = useOrderShop();
  const { selectedUser, selectedAcc } = useOrder();
  const [form, setForm] = useState<ShopForm>();
  const [orderNbr, setOrderNbr] = useState<string>("");
  const { GetData, PostData } = useCallApi();

  const fetchOfferData = async () => {
    try {
      setIsLoading(true);
      if (availableOffer.length > 0) return;
      const resp = await GetData(
        `${API_URL}/api/order-entry/common-service/qry-vas-pn-fiji`,
        {
          subsPlanId: selectedTableItem?.offerId,
          offerType: "3,4,6,5",
        },
      );

      const temp: ModSubsService[] = resp.data ?? [];

      let nextOwnedOffer: DPOfferOrderList[] = [];
      let recAttr: Record<string, DPOfferAttrList[]> = {};
      let recUuid: Record<string, string[]> = {};

      temp.forEach((item) => {
        if (!item.children) return;

        item.children.forEach((child) => {
          if (child.defaultFlag === "Y") {
            const parentName = item.offerGroupId;
            const childName = child.offerName;

            if (!parentName || !childName) return;
            const tempUUID = v4();

            recAttr[`${String(child.offerId)}#${tempUUID}`] = [];
            recUuid[String(child.offerId)] = [
              ...(recUuid[String(child.offerId)] ?? []),
              tempUUID,
            ];
            nextOwnedOffer.push({
              ...child,
              operationType: "A",
              dpOfferOrderAttrList: [],
              reserveDpOffer: true,
              offer: child.offer,
              offerSeq: tempUUID,
            });
          }
        });
      });
      setOwnedOffer(nextOwnedOffer);
      setDpOfferAttrRec(recAttr);
      setUuidRec(recUuid);
      if (resp.status) {
        return resp.data;
      }
      toast.error(resp.message);
      return [];
    } catch (error) {
      toast.error("Failed to Fetch data");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const offerList: UseQueryResult<ModSubsService[], Error> = useQuery({
    queryKey: ["Offer-List", selectedTableItem],
    queryFn: () => fetchOfferData(),
    // enabled: !!selectedSubs,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    //  console.log(selectedTableItem);
    offerList.refetch();
    setOrderNbr(formatDate());

    setAvailableOffer([]);
    setOwnedOffer([]);
  }, [selectedTableItem]);

  const mapToOrderPayload = (
    subs: ShopTableItem | undefined,
    cust: CustomerInfo | undefined,
    acc: AccountInfo | undefined,
  ) => {
    // const user =
    //   localStorage.getItem("ocs-portal-web-telkomcel-auth-v1=9.1.1") ?? "";
    // const userData = JSON.parse(user);
    return {
      custId: cust?.custId,
      custName: cust?.custName,
      acctId: acc?.acctId,

      subsEventId: 1,
      contactChannelId: 1,

      subsId: null,
      offerId: subs?.offerId,
      servType: subs?.servType,
      // quantity: 1,

      subsPlanId: subs?.id,
      subsPlanName: subs?.name,
      acctNbr: acc?.acctNbr,

      routingId: cust?.routingId,
      areaId: cust?.areaId,
      orgId: null, //ini gw gk ada
      quantity: 1, //ini gw gk ada
      offerVerId: subs?.offerVerId,
      indepProdSpecId: null, //ini gw gk ada
      postpaid: null, //ini gw gk ada
      ebgOrder: null, //ini gw gk ada
      opportunityId: cust?.occupationId,
      custQuotationId: null, //ini gw gk ada
      seq: null, //ini gw gk ada
      staffJobId: 1, //ini gw gk ada
      staffId: 1, //ini gw gk ada
      prodState: null,
      custModifyType: "", //ini gw gk ada
      bindOrderItemId: null, //ini gw gk ada
      bindType: "", //ini gw gk ada
      parentSubsId: null,
      operationType: cust?.operationType,
      bundleMemberAlias: null,
      srcOrderItemId: null, //ini gw gk ada
      batchResNum: null, //ini gw gk ada
    };
  };

  const fetchStartOrderFlow = async (): Promise<StartOrderFlow | undefined> => {
    try {
      setIsLoading(true);

      console.log(selectedTableItem);

      if (!selectedTableItem) return undefined;

      const startOrder = mapToOrderPayload(
        selectedTableItem,
        selectedUser,
        selectedAcc,
      );

      const resp = await PostData(
        `${API_URL}/api/order-entry/order-entry-order-initialize-V2/START_ORDER_FLOW`,
        [startOrder],
      );

      const temp: StartOrderFlow = resp?.data;

      return temp;
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startOrderFlow: UseQueryResult<StartOrderFlow | undefined, Error> =
    useQuery({
      queryKey: ["start-order-flow-shop", selectedTableItem],
      queryFn: () => fetchStartOrderFlow(),
      enabled: !!selectedTableItem,
      // staleTime: 1000 * 1, // 10 minutes (master data rarely changes)
      refetchOnWindowFocus: false,
    });

  const value: OrderFormContextType = {
    ownedOffer,
    setOwnedOffer,
    offer,
    setOffer,
    availableOffer,
    setAvailableOffer,
    showAdd,
    setShowAdd,
    showNumber,
    setShowNumber,
    attrRec,
    setAttrRec,
    offerList,
    isLoading,
    setIsLoading,
    fetchOfferData,
    dpOfferAttrRec,
    setDpOfferAttrRec,
    uuidRec,
    setUuidRec,
    form,
    setForm,
    orderNbr,
    startOrderFlow,
  };

  return (
    <OrderFormContext.Provider value={value}>
      {children}
    </OrderFormContext.Provider>
  );
};

// Custom hook to use the context
export const useOrderForm = () => {
  const context = useContext(OrderFormContext);
  if (context === undefined) {
    throw new Error("useOrderForm must be used within an OrderFormProvider");
  }
  return context;
};

export default OrderFormContext;
