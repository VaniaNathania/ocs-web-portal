import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScratchCardProps {
  error?: boolean;
  value?: string;
  onChange: (value: string) => void;
}

const ScratchCardField = ({ error, value, onChange }: ScratchCardProps) => {
  return (
    // Scratch Card PIN
    <div className="flex flex-row items-center gap-2">
      <Label className="w-36">
        Scratch Card PIN <span className="text-red-500">*</span>
      </Label>
      <div className={`input input-sm flex-1 ${error ? "border-red-600" : ""}`}>
        <Input className="p-0 border-none" size="sm" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
};

export default ScratchCardField;
