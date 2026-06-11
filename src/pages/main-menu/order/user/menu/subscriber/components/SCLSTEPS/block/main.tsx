import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubscriberListContext } from "../../../hooks";
import SubsListFormHeader from "../../header";
import SCLStep1 from "../components/SCLostStep1";
import SCLStep2 from "../components/SCLostStep2";
import SCLStep3 from "../components/SCLostStep3";
import { StepForm, stepItem } from "@/components/ui/stepForm";
import { useSCL } from "../hooks/context";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { apiConfigOrder } from "@/config/api.config";
import { StartOrderFlow } from "../../modifysubscriber/model/interfaces";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";

const API_URL = apiConfigOrder.order;

const Main = () => {
  const { selectedSubs, setShowDialog, setSelectedOperation, startOrderFlow } =
    useSubscriberListContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { PostData } = useCallApi();

  const { step, setStep, allData, form } = useSCL();

  const stepItems: stepItem[] = [
    {
      item: <SCLStep1 />,
    },
    {
      item: <SCLStep2 />,
    },
    {
      item: <SCLStep3 />,
    },
  ];

  const nextFlow2 = async () => {
    try {
      setIsLoading(true);
      if (!allData) return;

      const payload: StartOrderFlow = {
        ...allData,
        // cashDeskFee: mockCashDeskFee,
        orderItemList: [
          {
            ...allData.orderItemList[0],
            orderReason: form.otherReason,
            subsEventId: form.lostType === "0" ? 177 : 68,
          },
        ],
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
      const step3 = await PostData(
        `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_3`,
        temp,
      );

      if (!step3?.status) {
        return toast.error(step3?.message);
      }
      return setStep((prev) => prev + 1);
      // if (!temp.cashDeskFee) {
      //   if (step3?.status) setStep((prev) => prev + 2);
      // } else if (!temp.cashDeskFee[0].children[0].children) {
      //   const step3 = await PostData(
      //     `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_3`,
      //     temp,
      //   );
      //   if (step3?.status) setStep((prev) => prev + 2);
      // } else setStep((prev) => prev + 1);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (startOrderFlow.isFetching) return setIsLoading(true);
    setIsLoading(false);
  }, [startOrderFlow]);
  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-white gap-5">
      {isLoading && <Loading />}
      <SubsListFormHeader />
      <div className="flex-1 w-full p-5">
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
                if (step < 1) setStep(step + 1);
                else nextFlow2();
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
