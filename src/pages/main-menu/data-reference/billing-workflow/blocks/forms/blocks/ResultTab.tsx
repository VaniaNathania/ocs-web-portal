import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Pencil } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { IResultExpression } from "../../../utils/workflow.data";
import { useBillingWorkflowStore } from "../../../stores/billingWorkflow.store";
import { useFieldArray, useFormContext } from "react-hook-form";
import { CreateStepNodePayload } from "../../../hooks/stepForm";
import ResultRow from "./ResultRow";

const ResultTab = () => {
  const { selectedStepNode } = useBillingWorkflowStore();
  const [results, setResults] = useState<IResultExpression[]>([]);

  const { control } = useFormContext<CreateStepNodePayload>();

  const {
    fields: resultsFields,
    append: appendResult,
    remove: removeResult,
  } = useFieldArray({
    control,
    name: "bwfActionList",
  });

  const StepNodeData = selectedStepNode.data;

  const handleAddResult = () => {
    setResults((prev) => [
      ...prev,
      {
        stepId: StepNodeData?.stepId || 0,
        seq: prev.length + resultsFields.length + 1,
        srcReAttr: null,
        objReAttr: null,
        function: null,
        param1: null,
        param2: null,
        functionScript: null,
        spId: 0,
      },
    ]);
  };

  const handleConfirm = (index: number) => {
    const result = results[index];

    // if (!result.srcReAttr || !result.function) return;

    appendResult(result);

    setResults((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = (index: number) => {
    setResults((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        When the result of the expression is <b>Yes</b>, Then:
      </p>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Output Node</label>
          <Select>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select output node" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="disuse">G Disuse Event</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">System Action</label>
          <Select>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="getB2B">GetB2BCallType</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">System Action Script</label>
          <div className="relative">
            <Input className="h-9 pr-10" />
            <Pencil className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer" />
          </div>
        </div>
      </div>
      {/* Remarks */}
      <div className="space-y-2 p-1">
        <label className="text-sm font-medium">System Action Remarks</label>
        <Textarea
          className="focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500"
          placeholder="Type your system remarks here"
          rows={2}
        />
      </div>
      <hr />
      {/* <Separator className="w-full" orientation="horizontal" /> */}

      {/* Add */}
      <Button
        type="button"
        variant="ghost"
        className="gap-2 text-blue-600"
        onClick={handleAddResult}
      >
        <Plus className="h-4 w-4" />
        New Result
      </Button>
      {/* TEMP RESULT ROWS */}
      <div className="space-y-2">
        {results.map((result, index) => (
          <ResultRow
            key={index}
            value={result}
            onChange={(v) =>
              setResults((prev) => prev.map((r, i) => (i === index ? v : r)))
            }
            onConfirm={() => handleConfirm(index)}
            onCancel={() => handleCancel(index)}
          />
        ))}
      </div>
      <div className="space-y-2">
        {resultsFields.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
          >
            <span>
              {item.function} ({item.param1}, {item.param2})
            </span>
            <Trash2
              className="h-4 w-4 cursor-pointer hover:text-red-500"
              onClick={() => removeResult(index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultTab;
