import { Button } from "@/components/ui/button";
import { useModSubs } from "../hooks/context";
import { useSubscriberListContext } from "../../../hooks";
import {
  DPOfferOrderList,
  EventPaymentData,
  StartOrderFlow,
} from "../model/interfaces";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";

const API_URL = apiConfigOrder.order;

const NavFooter = () => {
  const {
    setStep,
    step,
    allData,
    setAllData,
    dpOfferAttrRec,
    ownedOffer,
    paymentMethod,
    amount,
    orderInfoForm,
    dateError,
    defaultBal,
  } = useModSubs();
  const { setSelectedOperation, setIsLoading } = useSubscriberListContext();
  const { GetData, PostData } = useCallApi();

  const nextFlow2 = async () => {
    try {
      setIsLoading(true);
      if (!allData) return;

      //  console.log(dpOfferAttrRec);

      const dpOfferTemp: DPOfferOrderList[] = ownedOffer.map((item) => ({
        ...item,
        subsId: allData.orderItemList[0].subsId,
        dpOfferOrderAttrList: dpOfferAttrRec[
          `${item.offerId}#${item.offerSeq}`
        ].map((attr) => ({ ...attr, attrValue: attr.value })),
      }));

      //  console.log("ini dp offer order", dpOfferTemp);

      const payload: StartOrderFlow = {
        ...allData,
        // cashDeskFee: mockCashDeskFee,
        orderItemList: [
          {
            ...allData.orderItemList[0],
            dpOfferOrderList: dpOfferTemp.map((item) => ({
              ...item,
            })),
            bespAddress: orderInfoForm?.bespAddress,
            comments: orderInfoForm?.comments,
          },
        ],
      };

      const resp = await PostData(
        `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_2`,
        payload,
      );

      if (!resp?.status) {
        return toast.error(resp?.message);
      }
      const temp: StartOrderFlow = resp?.data;

      if (!temp.cashDeskFee) return toast.error("Failed to get payment data");
      const mockeventPaymentData: EventPaymentData = {
        eventInstIdList: undefined, // ini gk dapet bentuk list
        fromCsr: true,
        createdDate: undefined,
        spId: 0,
        partyType: "A",
        eventPaymentId: undefined, // ini gk dapet
        eventPaymentSn: undefined, // ini gk dapet
        charge: temp.cashDeskFee[0].receivableCharge * -1,
        acctId: temp.orderItemList[0].subs.acctId,
        oriCharge: temp.cashDeskFee[0].receivableCharge * -1,
        instantPaymentList: [],
        balDeductDataList: [],
        contactChannelId: 1,
        discountCharge: 0,
        partyCode: "1",
      };

      const payloadStep3: StartOrderFlow = {
        ...temp,
        custContact: {
          ...allData.custContact,
          partId: new Date().getMonth(),
        },
        orderItemList: [
          {
            ...temp.orderItemList[0],
            dpOfferOrderList: temp.orderItemList[0].dpOfferOrderList.map(
              (item) => ({
                ...item,
                subsId: temp.orderItemList[0].subsId,
              }),
            ),
          },
        ],
        eventPaymentData: mockeventPaymentData,
      };

      if (!resp?.status) {
        return toast.error(resp?.message);
      }
      if (!payloadStep3.cashDeskFee) {
        const step3 = await PostData(
          `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_3`,
          payloadStep3,
        );
        if (step3?.status) setStep((prev) => prev + 2);
        else toast.error(step3?.message);
      } else if (!payloadStep3.cashDeskFee[0].children[0].children) {
        const step3 = await PostData(
          `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_3`,
          payloadStep3,
        );
        if (step3?.status) setStep((prev) => prev + 2);
        else toast.error(step3?.message);
      } else setStep((prev) => prev + 1);
      setAllData(resp.data);
    } catch (error) {
      //  console.log(error);
      // return toast.error(response.m);
    } finally {
      setIsLoading(false);
    }
  };

  const nextFlow3 = async () => {
    try {
      setIsLoading(true);
      //  console.log("ini dari step 2", allData);

      if (!allData) return;
      if (!defaultBal) return;
      if (!allData.cashDeskFee) return;
      if (!amount && paymentMethod.length > 0)
        return toast.error("Please input amount");
      if (dateError) return toast.error(dateError);

      const mockeventPaymentData: EventPaymentData = {
        eventInstIdList: undefined, // ini gk dapet bentuk list
        fromCsr: true,
        createdDate: undefined,
        spId: 0,
        partyType: "A",
        eventPaymentId: undefined, // ini gk dapet
        eventPaymentSn: undefined, // ini gk dapet
        charge: allData.cashDeskFee[0].receivableCharge * -1,
        acctId: allData.orderItemList[0].subs.acctId,
        oriCharge: allData.cashDeskFee[0].receivableCharge * -1,

        instantPaymentList: paymentMethod.includes("0")
          ? [
              {
                createdDate: undefined,
                spId: 0,
                returnAmount:
                  Number(amount.cash) * 100000 -
                  allData.cashDeskFee[0].receivableCharge,
                partyType: "F",
                eventPaymentId: undefined, //ini gk dapet
                paymentId: undefined, // ini gk dapet
                charge: allData.cashDeskFee[0].receivableCharge * -1,
                paymentMethodId: 1,
                submitAmount: Number(amount.cash) * -100000,
                partyCode: "1",
              },
            ]
          : undefined,

        balDeductDataList: paymentMethod.includes("1")
          ? [
              {
                deductAcctBook: {
                  acctResId: defaultBal?.acctResId,
                  preSuttleBal: defaultBal?.preSuttleBal,
                  createdDate: undefined,
                  preExpDate: defaultBal.preExpDate,
                  preEffDate: defaultBal.preEffDate,
                  acctId: defaultBal?.acctId,
                  refAttr: defaultBal?.refAttr,
                  seconds: defaultBal?.seconds,
                  spId: 0,
                  eventInstId: undefined, // ini gk dapet
                  effSeconds: defaultBal?.effSeconds,
                  preBalance: defaultBal?.preBalance,
                  billId: undefined, // ini gk dapet
                  partyType: "A",
                  acctBookType: "Q",
                  contactChannelId: 1,
                  eventPaymentId: undefined, // ini gk dapet
                  balId: defaultBal?.balId, // ini gk dapet
                  acctBookId: undefined, // ini gk dapet
                  charge:
                    (Number(amount.balance) + Number(amount.cash)) * 100000,
                  partyCode: "1",
                },

                balDeductCharge: Number(amount.balance) * 100000,
                acctId: defaultBal?.acctId,
                balDeductAcctResId: 1,
                eventInstId: undefined, // ini gk dapet
                priceId:
                  allData.cashDeskFee[0]?.children[0].children[0]?.children[0]
                    ?.priceId ?? 0,
                effSeconds: defaultBal?.effSeconds,
                deductSeq: 1,
                effDate: undefined,
                acctBookId: undefined, // ini gk dapet
                seq: 0,
              },
            ]
          : [],

        contactChannelId: 1,
        discountCharge: 0,
        partyCode: "1",
      };
      const payload: StartOrderFlow = {
        ...allData,
        custContact: {
          ...allData.custContact,
          partId: new Date().getMonth(),
        },
        orderItemList: [
          {
            ...allData.orderItemList[0],
            dpOfferOrderList: allData.orderItemList[0].dpOfferOrderList.map(
              (item) => ({ ...item, subsId: allData.orderItemList[0].subsId }),
            ),
          },
        ],
        eventPaymentData: mockeventPaymentData,
      };
      // console.log("ini ke next 3", payload);
      const resp = await PostData(
        `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_3`,
        payload,
      );
      // console.log("ini ke next 3", payload);
      if (!resp?.status) {
        return toast.error(resp?.message);
      }
      const temp: StartOrderFlow = resp?.data;
      setStep((prev) => prev + 1);
      setAllData(temp);
    } catch (error) {
      //  console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" bg-white border-t px-6 py-4">
      <div className="flex justify-between items-center mx-auto">
        {step < 3 && (
          <Button
            variant="outline"
            onClick={() => setStep((prev) => prev - 1)}
            disabled={step == 0}
          >
            Previous
          </Button>
        )}
        {step < 3 ? (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setSelectedOperation(undefined)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => {
                // console.log(dateError);

                if (step == 0 && dateError != "") {
                  return toast.error("Error Processing");
                }
                if (step == 0 && dateError == "") {
                  setStep((prev) => prev + 1);
                }
                if (step == 1) nextFlow2();
                if (step == 2) nextFlow3();
              }}
            >
              {step < 3 ? "Next" : "Done"}
            </Button>
          </div>
        ) : (
          <Button
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => {
              if (dateError == "") setSelectedOperation(undefined);
            }}
          >
            {"Done"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default NavFooter;
