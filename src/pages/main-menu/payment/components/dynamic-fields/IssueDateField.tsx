import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface issueDateProps {
  value?: string;
  onChange: (value: string) => void;
}

const IssueDateField = ({ value, onChange }: issueDateProps) => {
  return (
    <div className="flex flex-row items-center gap-2">
      <Label className="w-36">Issue Date</Label>
      <div className="input input-sm flex-1">
        <Input type="date" className="p-0 border-none" size="sm" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
};

export default IssueDateField;
