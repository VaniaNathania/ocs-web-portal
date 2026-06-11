import { StepForm, stepItem } from "@/components/ui/stepForm";
import NavFooter from "./navigationFooter";
import Status from "./status";
import { usePreNew } from "../hooks/context";
import PncStep1 from "../components/step1";
import PncStep2 from "../components/step2";
import PncStep3 from "../components/step3";
import PncStep4 from "../components/step4";

const Main = () => {
  const { step } = usePreNew();
  const stepItems: stepItem[] = [
    {
      label: "step1",
      item: <PncStep1 />,
    },
    {
      label: "step2",
      item: <PncStep2 />,
    },
    {
      label: "step3",
      item: <PncStep3 />,
    },
    {
      label: "step4",
      item: <PncStep4 />,
    },
  ];
  return (
    <div className="flex flex-col w-full h-full p-5 px-60 gap-2">
      <Status />
      <div className="flex-1">
        <StepForm items={stepItems} step={step} label={false} />
      </div>
      <NavFooter />
    </div>
  );
};

export default Main;
