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
  SubsBaseOrderDto,
} from "../../modifysubscriber/model/interfaces";
import { apiConfigOrder } from "@/config/api.config";
import { v4 } from "uuid";
import { ModSubsService, OfferDetail } from "../../mockModSubs";
import { SubsPlanByCatgList } from "../model/interface";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

interface BrandShiftContextType {
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
  orderInfoForm?: orderInfoForm;
  setOrderInfoForm: React.Dispatch<SetStateAction<orderInfoForm | undefined>>;
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
  subsSelect: boolean;
  setSubsSelect: Dispatch<SetStateAction<boolean>>;
  selectedNewSubs?: SubsPlanByCatgList;
  setSelectedNewSubs: Dispatch<SetStateAction<SubsPlanByCatgList | undefined>>;
  selectedNewCatg?: SubsPlanByCatgList;
  setSelectedNewCatg: Dispatch<SetStateAction<SubsPlanByCatgList | undefined>>;
  subsBase?: SubsBaseOrderDto;
  setSubsBase: Dispatch<SetStateAction<SubsBaseOrderDto | undefined>>;
  offerList: UseQueryResult<ModSubsService[], undefined>;
}

const API_URL = apiConfigOrder.order;

// Create the context with proper typing
export const BrandShiftContext = createContext<
  BrandShiftContextType | undefined
>(undefined);

export const BrandShiftProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { startOrderFlow, selectedOperation, selectedSubs, setAvailableOffer } =
    useSubscriberListContext();
  const { selectedUser } = useOrder();
  const { menuPrivAccess } = useOrderLayout();
  const { GetData } = useCallApi();
  const [step, setStep] = useState<number>(0);
  const [ownedOffer, setOwnedOffer] = useState<DPOfferOrderList[]>([]);
  const [offer, setOffer] = useState<DPOfferOrderList[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allData, setAllData] = useState<StartOrderFlow>();
  const [form, setForm] = useState<any>();
  const [orderInfoForm, setOrderInfoForm] = useState<orderInfoForm>();
  const [paymentMethod, setPaymentMethod] = useState<string[]>(["0"]);
  const [amount, setAmount] = useState<PaymentAmount>({
    cash: "",
    balance: "",
  });
  const [dateError, setDateError] = useState<string>("");
  const [defaultBal, setDefaultBal] = useState<QryDefaultBAL>();
  const [subsSelect, setSubsSelect] = useState<boolean>(false);
  const [selectedNewSubs, setSelectedNewSubs] = useState<SubsPlanByCatgList>();
  const [selectedNewCatg, setSelectedNewCatg] = useState<SubsPlanByCatgList>();
  const [attrRec, setAttrRec] = useState<{ [id: string]: AttrOrder[] }>({});
  const [dpOfferAttrRec, setDpOfferAttrRec] = useState<{
    [id: string]: DPOfferAttrList[];
  }>({});
  const [uuidRec, setUuidRec] = useState<UUIDRec>({});
  const [subsBase, setSubsBase] = useState<SubsBaseOrderDto>();

  const fetchOfferData = async () => {
    try {
      //  console.log(selectedNewSubs, "ini new subs");

      const resp = await GetData(
        `${API_URL}/api/order-entry/common-service/qry-vas-pn-fiji`,
        {
          subsPlanId: selectedNewSubs?.offerId ?? selectedSubs?.subsPlanId,
          offerType: "3,4,5,6",
        },
      );

      if (resp.status) {
        setAvailableOffer(resp.data);
        return resp.data;
      }
      setAvailableOffer([]);
      return toast.error(resp.message);
    } catch (error) {
      return toast.error("Failed to Fetch data");
    } finally {
      // setIsLoading(false);
    }
  };

  const offerList: UseQueryResult<ModSubsService[], undefined> = useQuery({
    queryKey: [
      "Offer-List-bs",
      selectedSubs,
      selectedOperation,
      selectedNewSubs,
    ],
    queryFn: () => fetchOfferData(),
    // enabled: !!selectedSubs,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const allOffer = offerList.data;
    let nextOwnedOffer: DPOfferOrderList[] = [];
    let recAttr: Record<string, DPOfferAttrList[]> = {};
    let recUuid: Record<string, string[]> = {};
    let tempOfferData: Record<string, OfferDetail | undefined> = {};
    //  console.log("ini selected new subs", selectedNewSubs);

    if (!selectedNewSubs) {
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
          const tempUUID = v4();

          recAttr[`${String(dp.offerId)}#${tempUUID}`] =
            dp.dpOfferOrderAttrList;
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
    } else {
      offerList.data?.forEach((item) => {
        if (!item.children) return;

        item.children.forEach((child) => {
          if (child.defaultFlag === "Y") {
            const parentName = item.offerGroupId;
            const childName = child.offerName;

            if (!parentName || !childName) return;
            const tempOwned = ownedOffer.filter(
              (ofr) => ofr.offerId === child.offerId,
            );
            if (tempOwned.length > 0) {
              tempOwned.forEach((own) => {
                recAttr[`${String(child.offerId)}#${own.offerSeq}`] = [];
                recUuid[String(child.offerId)] = [
                  ...(recUuid[String(child.offerId)] ?? []),
                  own.offerSeq ?? "",
                ];
                nextOwnedOffer.push({
                  ...child,
                  operationType: "A",
                  dpOfferOrderAttrList: [],
                  reserveDpOffer: true,
                  offer: child.offer,
                  offerSeq: own.offerSeq,
                });
              });
            } else {
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
          }
          // else {
          //   const tempOwnedtoDel = ownedOffer.filter(
          //     (ofr) => ofr.offerId === child.offerId,
          //   );
          //   if (tempOwnedtoDel.length > 0) {
          //     tempOwnedtoDel.forEach((own) => {
          //       recAttr[`${String(child.offerId)}#${own.offerSeq}`] = [];
          //       recUuid[String(child.offerId)] = [
          //         ...(recUuid[String(child.offerId)] ?? []),
          //         own.offerSeq ?? "",
          //       ];
          //       nextOwnedOffer.push({
          //         ...child,
          //         operationType: "D",
          //         dpOfferOrderAttrList: [],
          //         reserveDpOffer: true,
          //         offer: child.offer,
          //         offerSeq: own.offerSeq,
          //       });
          //     });
          //   }
          // }
        });
      });
      const diff = ownedOffer.filter(
        (a) => !nextOwnedOffer.some((b) => b.offerSeq === a.offerSeq),
      );
      //  console.log("ini diff", diff);

      diff.forEach((df) => {
        recAttr[`${String(df.offerId)}#${df.offerSeq}`] = [];
        recUuid[String(df.offerId)] = [
          ...(recUuid[String(df.offerId)] ?? []),
          df.offerSeq ?? "",
        ];
        nextOwnedOffer.push({
          ...df,
          operationType: "D",
          dpOfferOrderAttrList: [],
          reserveDpOffer: true,
          offer: df.offer,
          offerSeq: df.offerSeq,
        });
      });
    }

    setSubsBase({
      ...startOrderFlow.data?.orderItemList[0].subsBaseOrder,
      oldSubsPlanId:
        startOrderFlow.data?.orderItemList[0].subsBaseOrder?.subsPlanId,
    });
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
    subsSelect,
    setSubsSelect,
    selectedNewSubs,
    setSelectedNewSubs,
    selectedNewCatg,
    setSelectedNewCatg,
    offerList,
    subsBase,
    setSubsBase,
  };
  return (
    <BrandShiftContext.Provider value={value}>
      {children}
    </BrandShiftContext.Provider>
  );
};

// Custom hook to use the context
export const useBrandShift = () => {
  const context = useContext(BrandShiftContext);
  if (context === undefined) {
    throw new Error("useBrandShift must be used within an BrandShiftProvider");
  }
  return context;
};

export default BrandShiftContext;
