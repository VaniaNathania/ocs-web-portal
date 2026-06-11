import { Button } from "@/components/ui/button";
import { useSubscriberListContext } from "../../../hooks";
import SubsListFormHeader from "../../header";
import { StepForm, stepItem } from "@/components/ui/stepForm";
import { useOneWayBlockOwe } from "../hooks/context";
import OWBOStep1 from "../components/Step1";
import OWBOStep2 from "../components/Step2";

const Main = () => {
  const { selectedSubs, setSelectedOperation, isLoading } = useSubscriberListContext();
  const { step, setStep, handleNext, isLoadingOWBO } = useOneWayBlockOwe();

  const stepItems: stepItem[] = [
    {
      item: <OWBOStep1 />,
    },
    {
      item: <OWBOStep2 />,
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-white gap-5">
      <SubsListFormHeader />
      <div className="flex-1 w-full  p-5">
        <StepForm items={stepItems} step={step} label={false} />
      </div>
      {step !== 1 ? (
        <div className="flex flex-row justify-between items-center w-full  p-5">
          <Button variant={"outline"} size={"sm"} onClick={() => setStep(step - 1)} disabled={step === 0}>
            Previous
          </Button>
          <div className="flex flex-row gap-2">
            <Button
              size={"sm"}
              onClick={() => {
                if (step === 0) handleNext();
              }}
              disabled={isLoadingOWBO || isLoading}
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
