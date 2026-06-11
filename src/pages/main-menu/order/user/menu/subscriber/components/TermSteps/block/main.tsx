import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubscriberListContext } from "../../../hooks";
import TermStep2 from "../components/TermSteps2";
import TermStep3 from "../components/TermSteps3";
import SubsListFormHeader from "../../header";
import { useTermination } from "../hooks/context";
import TermStep1 from "../components/TermSteps1";
import { StepForm, stepItem } from "@/components/ui/stepForm";
import {
  EventPaymentData,
  StartOrderFlow,
} from "../../modifysubscriber/model/interfaces";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";

const API_URL = apiConfigOrder.order;

const Main = () => {
  const { selectedSubs, setSelectedOperation } = useSubscriberListContext();
  const {
    step,
    setStep,
    allData,
    form,
    setAllData,
    defaultBal,
    amount,
    dateError,
    paymentMethod,
  } = useTermination();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { PostData } = useCallApi();

  const stepItems: stepItem[] = [
    {
      item: <TermStep1 />,
    },
    {
      item: <TermStep2 />,
    },
    {
      item: <TermStep3 />,
    },
  ];

  const nextFlow2 = async () => {
    try {
      setIsLoading(true);
      if (!allData) return;
      if (!form.termReason) return toast.error("Reason field must be filled");

      const payload: StartOrderFlow = {
        ...allData,
        // cashDeskFee: mockCashDeskFee,
        orderItemList: [
          {
            ...allData.orderItemList[0],

            bespAddress: form?.resrvTime,
            comments: form?.comments,
          },
        ],
        // subsId: selectedSubs?.subsId,
      };

      const resp = await PostData(
        `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_2`,
        payload,
      );
      const temp: StartOrderFlow = resp?.data;
      //  console.log("ini ke next 2", payload);
      if (!resp?.status) {
        return toast.error(resp?.message);
      }
      if (!temp.cashDeskFee) {
        const step3 = await PostData(
          `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_3`,
          temp,
        );
        if (step3?.status) setStep((prev) => prev + 2);
      }
      // else if (!temp.cashDeskFee[0].children[0].children) {
      //   const step3 = await PostData(
      //     `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_3`,
      //     temp,
      //   );
      //   if (step3?.status) setStep((prev) => prev + 2);
      // }
      else setStep((prev) => prev + 1);
      setAllData(resp.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const nextFlow3 = async () => {
    try {
      setIsLoading(true);
      //  console.log("ini dari step 2", allData);

      if (!allData) return toast.error("Main Data Missing");
      if (!defaultBal) return toast.error("Account Balance not found");
      if (!allData.cashDeskFee) return toast.error("Price Data not found");
      if (!amount && paymentMethod.length > 0)
        return toast.error("Please input amount");
      if (dateError) return toast.error(dateError);

      let tempPriceId = 0;

      if (allData.cashDeskFee[0].children) {
        if (allData.cashDeskFee[0].children[0].children)
          if (allData.cashDeskFee[0].children[0].children[0].children)
            tempPriceId =
              allData.cashDeskFee[0]?.children[0].children[0]?.children[0]
                ?.priceId ?? 0;
      }

      const mockeventPaymentData: EventPaymentData = {
        eventInstIdList: undefined, // ini gk dapet bentuk list
        fromCsr: true,
        createdDate: undefined,
        spId: 0,
        partyType: "A",
        eventPaymentId: undefined, // ini gk dapet
        eventPaymentSn: undefined, // ini gk dapet
        charge: allData.cashDeskFee[0].receivableCharge * -1,
        acctId: defaultBal.acctId,
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
                  preExpDate: undefined,
                  acctId: defaultBal?.acctId,
                  refAttr: defaultBal?.refAttr,
                  seconds: defaultBal?.seconds,
                  spId: 0,
                  preEffDate: undefined,
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
                priceId: tempPriceId,
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
    <div className="w-full h-full flex flex-col justify-center items-center bg-white gap-5">
      {isLoading && <Loading />}
      <SubsListFormHeader />
      <div className="flex-1 w-full  p-5">
        <StepForm items={stepItems} step={step} label={false} />
      </div>
      {step !== 2 ? (
        <div className="flex flex-row justify-between items-center w-full p-5">
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
          >
            Previous
          </Button>
          <div className="flex flex-row gap-2">
            <Button
              size={"sm"}
              onClick={() => {
                if (step === 0) nextFlow2();
                if (step === 1) nextFlow3();
              }}
            >
              Next
            </Button>
            <Button
              variant={"outline"}
              size={"sm"}
              onClick={() => setSelectedOperation(undefined)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-row justify-end items-center w-full p-5">
          <Button size={"sm"} onClick={() => setSelectedOperation(undefined)}>
            OK
          </Button>
        </div>
      )}
    </div>
  );
};

export default Main;
