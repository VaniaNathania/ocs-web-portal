import { Button } from "@/components/ui/button";
import { useSubscriberListContext } from "../../../hooks";
import SubsListFormHeader from "../../header";
import { StepForm, stepItem } from "@/components/ui/stepForm";
import { useRegisterCustInfo } from "../hooks/context";
import RCIStep1 from "../components/Step1";
import RCIStep2 from "../components/Step2";
import { apiConfigOrder } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StartOrderFlow } from "../../modifysubscriber/model/interfaces";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";

const API_URL = apiConfigOrder.order;

const Main = () => {
  const { selectedSubs, setSelectedOperation, startOrderFlow } =
    useSubscriberListContext();
  const { PostData } = useCallApi();
  const { step, setStep, allData } = useRegisterCustInfo();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const stepItems: stepItem[] = [
    {
      item: <RCIStep1 />,
    },
    {
      item: <RCIStep2 />,
    },
  ];

  const nextFlow2 = async () => {
    try {
      setIsLoading(true);
      //  console.log(allData, "ini all data");

      if (!allData) return;

      const resp = await PostData(
        `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_2`,
        allData,
      );
      const temp: StartOrderFlow = resp?.data;
      //  console.log("ini ke next 2", allData);
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
      <SubsListFormHeader />
      {isLoading && <Loading />}
      <div className="flex-1 w-full  p-5">
        <StepForm items={stepItems} step={step} label={false} />
      </div>
      {step !== 1 ? (
        <div className="flex flex-row justify-between items-center w-full  p-5">
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
          >
            Previous
          </Button>
          <div className="flex flex-row gap-2">
            <Button size={"sm"} onClick={() => nextFlow2()}>
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
