import { StepForm, stepItem } from "@/components/ui/stepForm";
import NavFooter from "./footer";
import { useBrandShift } from "../hooks/context";
import BrandShiftStep1 from "../components/step1";
import SubsListFormHeader from "../../header";
import BrandShiftStep2 from "../components/step2";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { useSubscriberListContext } from "../../../hooks";
import BrandShiftStep3 from "../components/step3";
import BrandShiftStep4 from "../components/step4";
import { useEffect } from "react";
import { BrandShiftAddDialog } from "./addServiceDialog";

const Main = () => {
  const { isLoading, setIsLoading, startOrderFlow } =
    useSubscriberListContext();
  const { step, offerList } = useBrandShift();
  const stepItems: stepItem[] = [
    {
      label: "step1",
      item: <BrandShiftStep1 />,
    },
    {
      item: <BrandShiftStep2 />,
    },
    {
      item: <BrandShiftStep3 />,
    },
    {
      item: <BrandShiftStep4 />,
    },
  ];

  useEffect(() => {
    // console.log("ini ke call", offerList.status, startOrderFlow.status);
    if (offerList.isFetching) return setIsLoading(true);
    if (startOrderFlow.isFetching) return setIsLoading(true);
    else if (step === 0) return setIsLoading(false);
  }, [startOrderFlow, offerList]);
  return (
    <div className="flex flex-col w-full h-full relative bg-white">
      {isLoading && <Loading />}
      <SubsListFormHeader />
      <BrandShiftAddDialog />

      <div className="flex-1">
        <StepForm items={stepItems} step={step} label={false} />
      </div>
      <NavFooter />
    </div>
  );
};

export default Main;
