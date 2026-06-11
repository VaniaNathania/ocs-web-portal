import React, {
  createContext,
  useContext,
  useState,
  SetStateAction,
  Dispatch,
  useEffect,
} from "react";
import { useOrderLayout } from "@/layouts/main-menu/order";
import { useCallApi } from "@/hooks";
import { OfferDetail } from "../../mockModSubs";
import {
  AttrRecState,
  DpOfferAttrRec,
  UUIDRec,
} from "@/pages/main-menu/order/models/types";
import { AttrOrder } from "@/pages/main-menu/order/models/interfaces";
import { useSubscriberListContext } from "../../../hooks";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import {
  DPOfferAttrList,
  DPOfferOrderList,
  orderInfoForm,
  PaymentAmount,
  QryDefaultBAL,
  StartOrderFlow,
} from "../model/interfaces";
import { apiConfigOrder } from "@/config/api.config";
import { v4 } from "uuid";

interface ModSubsContextType {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  attrRec: AttrRecState;
  setAttrRec: Dispatch<SetStateAction<AttrRecState>>;
  dpOfferAttrRec: DpOfferAttrRec;
  setDpOfferAttrRec: Dispatch<SetStateAction<DpOfferAttrRec>>;
  uuidRec: UUIDRec;
  setUuidRec: Dispatch<SetStateAction<UUIDRec>>;
  offer: DPOfferOrderList[];
  setOffer: Dispatch<SetStateAction<DPOfferOrderList[]>>;
  ownedOffer: DPOfferOrderList[];
  setOwnedOffer: React.Dispatch<SetStateAction<DPOfferOrderList[]>>;
  form: any;
  setForm: React.Dispatch<SetStateAction<any>>;
  allData?: StartOrderFlow;
  setAllData: React.Dispatch<SetStateAction<StartOrderFlow | undefined>>;
  paymentMethod: string[];
  setPaymentMethod: React.Dispatch<SetStateAction<string[]>>;
  amount: PaymentAmount;
  setAmount: React.Dispatch<SetStateAction<PaymentAmount>>;
  dateError: string;
  setDateError: React.Dispatch<SetStateAction<string>>;
  defaultBal?: QryDefaultBAL;
  setDefaultBal: Dispatch<SetStateAction<QryDefaultBAL | undefined>>;
  orderInfoForm?: orderInfoForm;
  setOrderInfoForm: React.Dispatch<SetStateAction<orderInfoForm | undefined>>;
}

const API_URL = apiConfigOrder.order;

// Create the context with proper typing
export const ModSubsContext = createContext<ModSubsContextType | undefined>(
  undefined,
);

export const ModSubsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { offerList, startOrderFlow, selectedOperation, selectedSubs } =
    useSubscriberListContext();
  const { selectedUser } = useOrder();
  const { menuPrivAccess } = useOrderLayout();
  const { PostData } = useCallApi();
  const [step, setStep] = useState<number>(0);
  const [ownedOffer, setOwnedOffer] = useState<DPOfferOrderList[]>([]);
  const [offer, setOffer] = useState<DPOfferOrderList[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allData, setAllData] = useState<StartOrderFlow>();
  const [form, setForm] = useState<any>();
  const [orderInfoForm, setOrderInfoForm] = useState<orderInfoForm>();
  const [paymentMethod, setPaymentMethod] = useState<string[]>(["0"]);
  const [amount, setAmount] = useState<PaymentAmount>({
    balance: "",
    cash: "",
  });
  const [dateError, setDateError] = useState<string>("");
  const [defaultBal, setDefaultBal] = useState<QryDefaultBAL>();

  // const fetchOfferList = async (): Promise<ModSubsService[]> => {
  //   const result = await offerList.refetch();

  //   return result.data ?? [];
  // };

  const [attrRec, setAttrRec] = useState<{ [id: string]: AttrOrder[] }>({});
  const [dpOfferAttrRec, setDpOfferAttrRec] = useState<{
    [id: string]: DPOfferAttrList[];
  }>({});
  const [uuidRec, setUuidRec] = useState<UUIDRec>({});

  useEffect(() => {
    const allOffer = offerList.data;
    if (!startOrderFlow) return;
    // if (startOrderFlow.data?.subsId !== selectedSubs?.subsId) return;
    // if (!offerList) return;

    // console.log(
    //   "ini datanya",
    //   allOffer,
    //   startOrderFlow.data?.orderItemList[0].dpOfferOrderList,
    // );

    let nextOwnedOffer: DPOfferOrderList[] = [];
    let recAttr: Record<string, DPOfferAttrList[]> = {};
    let recUuid: Record<string, string[]> = {};
    let tempOfferData: Record<string, OfferDetail | undefined> = {};

    (allOffer ?? []).forEach((group) => {
      if (!group.children) return;

      group.children.forEach((child) => {
        if (!child.offerName) return;
        tempOfferData[child.offerId.toString()] = child.offer;

        // const exists =
        //   startOrderFlow.data?.orderItemList[0].dpOfferOrderList.find(
        //     (item) => item.offerId === child.offerId && !item.timerEventId,
        //   );

        // if (!exists) return;

        // if (!exists.offerSeq) {
        //   const tempUUID = v4();

        //   recAttr[`${String(exists.offerId)}#${tempUUID}`] =
        //     exists.dpOfferOrderAttrList;
        //   recUuid[String(exists.offerId)] = [
        //     ...(recUuid[String(exists.offerId)] ?? []),
        //     tempUUID,
        //   ];
        //   nextOwnedOffer.push({
        //     ...exists,
        //     offer: child.offer,
        //     offerSeq: tempUUID,
        //   });
        // } else {
        //   recAttr[`${String(exists.offerId)}#${exists.offerSeq}`] =
        //     exists.dpOfferOrderAttrList;
        //   recUuid[String(exists.offerId)] = [
        //     ...(recUuid[String(exists.offerId)] ?? []),
        //     exists.offerSeq,
        //   ];
        //   nextOwnedOffer.push({
        //     ...exists,
        //     offer: child.offer,
        //     offerSeq: exists.offerSeq,
        //   });
        // }
        // if (parentIndex === -1) {
        //   // add parent with first child
        // } else {
        //   // add child to existing parent
        //   nextOwnedOffer[parentIndex] = {
        //     ...nextOwnedOffer[parentIndex],
        //     children: [...(nextOwnedOffer[parentIndex].children ?? []), child],
        //   };
        // }
      });
    });

    startOrderFlow.data?.orderItemList[0]?.dpOfferOrderList?.forEach((dp) => {
      if (!dp.offerSeq) {
        // console.log("gk ada dpofferseq");

        const tempUUID = v4();

        recAttr[`${String(dp.offerId)}#${tempUUID}`] = dp.dpOfferOrderAttrList;
        recUuid[String(dp.offerId)] = [
          ...(recUuid[String(dp.offerId)] ?? []),
          tempUUID,
        ];
        nextOwnedOffer.push({
          ...dp,
          offer: tempOfferData[dp.offerId.toString()],
          offerSeq: tempUUID,
        });
      } else {
        // console.log("ini seq", dp.offerSeq);

        recAttr[`${String(dp.offerId)}#${dp.offerSeq}`] =
          dp.dpOfferOrderAttrList;
        recUuid[String(dp.offerId)] = [
          ...(recUuid[String(dp.offerId)] ?? []),
          dp.offerSeq,
        ];
        nextOwnedOffer.push({
          ...dp,
          offer: tempOfferData[dp.offerId.toString()],
          offerSeq: dp.offerSeq,
        });
      }
    });

    // console.log("ini new owned", nextOwnedOffer);

    // ✅ single state update
    // console.log("ini uuid masuk", recUuid);

    setOwnedOffer(nextOwnedOffer);
    setDpOfferAttrRec(recAttr);
    setUuidRec(recUuid);
    setAllData(startOrderFlow.data);
    setDateError("");
  }, [startOrderFlow.data, offerList.data]);

  useEffect(() => {
    if (!selectedOperation) {
      setOwnedOffer([]);
      setAttrRec({});
      setDpOfferAttrRec({});
    }
  }, [selectedOperation]);
  const value = {
    step,
    setStep,
    isLoading,
    setIsLoading,
    attrRec,
    setAttrRec,
    offer,
    setOffer,
    dpOfferAttrRec,
    setDpOfferAttrRec,
    uuidRec,
    setUuidRec,
    ownedOffer,
    setOwnedOffer,
    form,
    setForm,
    allData,
    setAllData,
    paymentMethod,
    setPaymentMethod,
    amount,
    setAmount,
    orderInfoForm,
    setOrderInfoForm,
    dateError,
    setDateError,
    defaultBal,
    setDefaultBal,
  };
  return (
    <ModSubsContext.Provider value={value}>{children}</ModSubsContext.Provider>
  );
};

// Custom hook to use the context
export const useModSubs = () => {
  const context = useContext(ModSubsContext);
  if (context === undefined) {
    throw new Error("useModSubs must be used within an ModSubsProvider");
  }
  return context;
};

export default ModSubsContext;
