import { Button } from "@/components/ui/button";
import { useSubscriberListContext } from "../../../hooks";
import { useRUR } from "../hooks/context";
import SubsListFormHeader from "../../header";
import { StepForm, stepItem } from "@/components/ui/stepForm";
import { toast } from "sonner";
import RURStep1 from "../components/RURStep1";
import RURStep2 from "../components/RURStep2";
import RURStep3 from "../components/RURStep3";

const Main = () => {
  const { selectedSubs, setSelectedOperation } = useSubscriberListContext();
  const { step, setStep, form, nextFlow2, nextFlow3 } = useRUR();

  const stepItems: stepItem[] = [
    {
      item: <RURStep1 />,
    },
    {
      item: <RURStep2 />,
    },
    {
      item: <RURStep3 />,
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-white gap-5">
      <SubsListFormHeader />
      <div className="flex-1 w-full  p-5">
        <StepForm items={stepItems} step={step} label={false} />
      </div>
      {step !== 2 ? (
        <div className="flex flex-row justify-between items-center w-full  p-5">
          <Button variant={"outline"} size={"sm"} onClick={() => setStep(step - 1)} disabled={step === 0}>
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
            <Button variant={"outline"} size={"sm"} onClick={() => setSelectedOperation(undefined)}>
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
