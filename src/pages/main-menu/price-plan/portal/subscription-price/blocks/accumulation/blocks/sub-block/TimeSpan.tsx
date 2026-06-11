import { Button } from "@/components/ui/button";

type TimespanProps = {
  formField: CreateVersionAccumulation;
};

const TimeSpan = ({ formField }: TimespanProps) => {
  return (
    <>
      <button className="px-5 py-2 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
        Add Data
      </button>
    </>
  );
};

export default TimeSpan;
