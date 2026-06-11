import { Label } from "@/components/ui/label";
import { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { RatableEventActionContentForm } from "../../../schema/ratableEventAction.schema";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";

interface AbsoluteFieldsProps {
  register: UseFormRegister<RatableEventActionContentForm>;
  mode: "view" | "edit" | "new";
  errors: FieldErrors<RatableEventActionContentForm>;
  control: Control<RatableEventActionContentForm>;
  setValue: UseFormSetValue<RatableEventActionContentForm>;
  watch: UseFormWatch<RatableEventActionContentForm>;
}

export const AbsoluteFields: React.FC<AbsoluteFieldsProps> = ({ register, mode, errors, watch, setValue }) => {
  const absEffDate = watch("absEffDate");
  const absExpDate = watch("absExpDate");
  return (
    <>
      <div className="flex flex-row justify-end">
        <Label className="text-sm p-1 w-1/4 truncate" title="Offset of Effective Date">
          <span className="text-red-500">*</span>Absolute Effective Date
        </Label>
        <div className="flex-1">
          <input className={`w-full h-[30px] border rounded border-gray-300 bg-white p-1 ${mode === "view" ? "text-gray-400 cursor-not-allowed" : ""}`} {...register("absEffDate")} disabled={mode === "view"} type="date" />
          {errors.absEffDate && <p className="text-sm text-red-500">{errors.absEffDate.message}</p>}
        </div>
        {mode !== "view" && absEffDate !== null && (
          <Button variant="ghost" size="sm" onClick={() => setValue("absEffDate", null, { shouldValidate: true })}>
            <KeenIcon icon="cross" />
          </Button>
        )}
      </div>
      <div className="flex flex-row justify-end">
        <Label className="text-sm p-1 w-1/4 truncate" title="Offset of Effective Date">
          <span className="text-red-500">*</span>Absolute Expiry Date
        </Label>
        <div className="flex-1">
          <input className={`w-full h-[30px] border rounded border-gray-300 bg-white p-1 ${mode === "view" ? "text-gray-400 cursor-not-allowed" : ""}`} {...register("absExpDate")} disabled={mode === "view"} type="date" />
          {errors.absExpDate && <p className="text-sm text-red-500">{errors.absExpDate.message}</p>}
        </div>
        {mode !== "view" && absExpDate !== null && (
          <Button variant="ghost" size="sm" onClick={() => setValue("absExpDate", null, { shouldValidate: true })}>
            <KeenIcon icon="cross" />
          </Button>
        )}
      </div>
    </>
  );
};
