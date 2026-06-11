import { StepForm, stepItem } from "@/components/ui/stepForm";
import NavFooter from "./footer";
import { useModSubs } from "../hooks/context";
import Header from "./header";
import ModSubsStep1 from "../components/step1";
import { ModifySubscriberDetailAddDialog } from "../../../blocks/ModifySubscriberDetailAddDialog";
import SubsListFormHeader from "../../header";
import ModSubsStep2 from "../components/step2";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { useSubscriberListContext } from "../../../hooks";
import ModSubsStep3 from "../components/step3";
import ModSubsStep4 from "../components/step4";
import { useEffect } from "react";

const Main = () => {
  const { isLoading, setIsLoading, startOrderFlow, offerList } =
    useSubscriberListContext();
  const { step } = useModSubs();
  const stepItems: stepItem[] = [
    {
      label: "step1",
      item: <ModSubsStep1 />,
    },
    {
      item: <ModSubsStep2 />,
    },
    {
      item: <ModSubsStep3 />,
    },
    {
      item: <ModSubsStep4 />,
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
      <ModifySubscriberDetailAddDialog />

      <div className="flex-1">
        <StepForm items={stepItems} step={step} label={false} />
      </div>
      <NavFooter />
    </div>
  );
};

export default Main;
