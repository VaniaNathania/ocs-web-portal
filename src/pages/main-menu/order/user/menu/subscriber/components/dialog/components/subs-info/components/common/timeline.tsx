import { KeenIcon } from "@/components";
import { Item } from "@radix-ui/react-select";

export interface TimelineItem {
  label: string;
  date?: string;
  isCurrent?: boolean;
  code: string;
}

interface Props {
  items: TimelineItem[];
  size?: "sm" | "md" | "lg" | "xl";
  date?: boolean;
}

const Timeline = ({ items, size = "md", date = true }: Props) => {
  const sizes = {
    sm: "w-20",
    md: "w-28",
    lg: "w-40",
    xl: "w-60",
  };

  const currentStepIndex = items.findIndex((item) => item.isCurrent);

  const getStepStatus = (index: number) => {
    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "upcoming";
  };

  const timeLine = items.map((step, i) => {
    const status = getStepStatus(i);
    const isComplete = status === "completed";
    const isCurrent = status === "current";
    return (
      <div key={i} className={`flex flex-col items-center ${sizes[size]} text-center z-10 relative ${date ? "h-28 justify-center " : "h-16"} `}>
        {/* date */}
        <div className="text-sm text-gray-600 w-28 absolute top-0">{step?.date}</div>

        {/* circle */}
        <div className="flex items-center">
          <div
            className={`w-6 h-6 rounded-full z-10 flex items-center justify-center text-xs font-semibold relative
    ${isComplete ? "bg-primary text-white" : isCurrent ? "border-2 border-primary text-primary bg-white" : "border-2 border-gray-400 text-gray-400 bg-white"}
  `}
          >
            {isComplete ? <KeenIcon icon="check" style="solid" className="absolute inset-0 flex items-center justify-center text-white text-sm" /> : <span className="relative z-10">{i + 1}</span>}
          </div>

          {i !== 0 && <div className={`border-t-2 absolute left-0 w-1/2 ${isComplete ? "border-primary" : isCurrent ? "border-primary" : "border-gray-400"}`}></div>}
          {i !== items.length - 1 && <div className={`border-t-2 absolute right-0 w-1/2 ${isComplete ? "border-primary" : isCurrent ? "border-gray-400" : "border-gray-400"}`}></div>}
        </div>

        {/* label */}
        <div className={` text-sm absolute flex flex-col bottom-0 w-full ${step.isCurrent ? "text-primary font-semibold" : "text-gray-400"}`}>
          {step.isCurrent && <div className="text-xs text-primary">Current</div>}
          <div className="truncate">{step.label}</div>
        </div>

        {/* "Current" text */}
      </div>
    );
  });

  return (
    <div className="flex items-center relative">
      {/* connecting line */}
      {/* <div className="absolute  left-0 right-0 border-dotted border-t-4 z-0 w-full"></div> */}

      {timeLine}
    </div>
    // <div className="w-full flex flex-col items-center">
    // </div>
  );
};

export default Timeline;
