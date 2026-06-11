import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IResultExpression } from "../../../utils/workflow.data";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ResultRow = ({
  value,
  onChange,
  onConfirm,
  onCancel,
}: {
  value: IResultExpression;
  onChange: (v: IResultExpression) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="flex items-center justify-between gap-2 border rounded-md p-2">
      <div className="flex items-center gap-5">
        <Input
          className="h-8 w-[160px]"
          placeholder="Source Attr"
          value={value.srcReAttr ?? ""}
          onChange={(e) =>
            onChange({ ...value, srcReAttr: Number(e.target.value) })
          }
        />

        <span>=</span>

        <Select
          value={value.function ?? undefined}
          onValueChange={(v) => onChange({ ...value, function: v })}
        >
          <SelectTrigger className="h-8 w-[140px]">
            <SelectValue placeholder="Function" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AddMonth">AddMonth</SelectItem>
          </SelectContent>
        </Select>

        <Input
          className="h-8 w-[120px]"
          placeholder="Param 1"
          value={value.param1 ?? ""}
          onChange={(e) => onChange({ ...value, param1: e.target.value })}
        />

        <Input
          className="h-8 w-[120px]"
          placeholder="Param 2"
          value={value.param2 ?? ""}
          onChange={(e) => onChange({ ...value, param2: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant={"outline"}
          className="text-green-500 hover:bg-green-500 hover:text-white"
          onClick={onConfirm}
        >
          <Check />
        </Button>
        <Button
          type="button"
          variant={"outline"}
          className="text-red-500 hover:bg-red-500 hover:text-white"
          onClick={onCancel}
        >
          <X />
        </Button>
      </div>
    </div>
  );
};

export default ResultRow;
