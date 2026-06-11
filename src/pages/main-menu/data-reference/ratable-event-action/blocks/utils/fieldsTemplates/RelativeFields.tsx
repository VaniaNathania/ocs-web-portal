import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors, Controller, Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { RatableEventActionContentForm } from "../../../schema/ratableEventAction.schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRatableEventActionContext } from "../../../hooks/useRatableEventActionContext";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";

interface RelativeFieldsProps {
  register: UseFormRegister<RatableEventActionContentForm>;
  mode: "view" | "edit" | "new";
  errors: FieldErrors<RatableEventActionContentForm>;
  control: Control<RatableEventActionContentForm>;
  setValue: UseFormSetValue<RatableEventActionContentForm>;
  watch: UseFormWatch<RatableEventActionContentForm>;
}

export const RelativeFields: React.FC<RelativeFieldsProps> = ({ register, mode, errors, control, setValue, watch }) => {
  const { timeUnit } = useRatableEventActionContext();
  const selectedExpTimeUnit = watch("relExpUnit");
  const selectedEffTimeUnit = watch("relEffUnit");
  const selectedPeriodRelUnit = watch("periodRelUnit");
  const relEffTime = watch("relEffTime");
  const relExpTime = watch("relExpTime");

  return (
    <>
      <div className="flex flex-row justify-end">
        <Label className="text-sm p-1 w-1/4 truncate" title="Offset of Effective Date">
          <span className="text-red-500">*</span>Offset of Effective Date
        </Label>
        <div className="flex-1">
          <input
            className={`w-full h-[30px] border rounded border-gray-300 bg-white p-1 ${mode === "view" ? "text-gray-400 cursor-not-allowed" : ""}`}
            {...register("relEffOffset", {
              setValueAs: (value) => {
                if (!value) return null;
                return Number(value);
              },
            })}
            disabled={mode === "view"}
            type="number"
            min={1}
          />
          {errors.relEffOffset && <p className="text-sm text-red-500">{errors.relEffOffset.message}</p>}
        </div>
      </div>
      <div className="flex flex-row justify-end">
        <Label className="text-sm p-1 w-1/4">
          <span className="text-red-500">*</span>Time Unit
        </Label>
        <div className="flex-1">
          <Controller
            name="relEffUnit"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(val) => {
                  field.onChange(val || null);
                }}
                value={field.value ?? ""}
                disabled={mode === "view"}
              >
                <SelectTrigger className="h-[30px]">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {timeUnit.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.timeUnitName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.relEffUnit && <p className="text-sm text-red-500">{errors.relEffUnit.message}</p>}
        </div>
        {mode !== "view" && selectedEffTimeUnit !== null && (
          <Button variant="ghost" size="sm" onClick={() => setValue("relEffUnit", null, { shouldValidate: true })}>
            <KeenIcon icon="cross" />
          </Button>
        )}
      </div>
      <div className="flex flex-row justify-end">
        <Label className="text-sm p-1 w-1/4 truncate" title="Duration of Availability">
          Duration of Availability
        </Label>
        <div className="flex-1">
          <input
            className={`w-full h-[30px] border rounded border-gray-300 bg-white p-1 ${mode === "view" ? "text-gray-400 cursor-not-allowed" : ""}`}
            {...register("relExpOffset", {
              setValueAs: (value) => {
                if (!value) return null;
                return Number(value);
              },
            })}
            disabled={mode === "view"}
            type="number"
            min={1}
          />
        </div>
      </div>
      <div className="flex flex-row justify-end">
        <Label className="text-sm p-1 w-1/4">Time Unit</Label>
        <div className="flex-1">
          <Controller
            name="relExpUnit"
            control={control}
            render={({ field }) => (
              <Select onValueChange={(val) => field.onChange(val === "" || val === undefined ? null : val)} value={field.value ?? ""} disabled={mode === "view"}>
                <SelectTrigger className="h-[30px]">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {timeUnit.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.timeUnitName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        {mode !== "view" && selectedExpTimeUnit !== null && (
          <Button variant="ghost" size="sm" onClick={() => setValue("relExpUnit", null, { shouldValidate: true })}>
            <KeenIcon icon="cross" />
          </Button>
        )}
      </div>
      <div className="flex flex-row justify-end">
        <Label className="text-sm p-1 w-1/4 truncate" title="Relative Effective Time">
          Relative Effective Time
        </Label>
        <div className="flex-1">
          <input className={`w-full h-[30px] border rounded border-gray-300 bg-white p-1 ${mode === "view" ? "text-gray-400 cursor-not-allowed" : ""}`} {...register("relEffTime")} disabled={mode === "view"} type="time" step={1} />
          {errors.relEffTime && <p className="text-sm text-red-500">{errors.relEffTime.message}</p>}
        </div>
        {mode !== "view" && relEffTime !== null && (
          <Button variant="ghost" size="sm" onClick={() => setValue("relEffTime", null, { shouldValidate: true })}>
            <KeenIcon icon="cross" />
          </Button>
        )}
      </div>
      <div className="flex flex-row justify-end">
        <Label className="text-sm p-1 w-1/4 truncate" title="Relative Expiry Time">
          Relative Expiry Time
        </Label>
        <div className="flex-1">
          <input className={`w-full h-[30px] border rounded border-gray-300 bg-white p-1 ${mode === "view" ? "text-gray-400 cursor-not-allowed" : ""}`} {...register("relExpTime")} disabled={mode === "view"} type="time" step={1} />
          {errors.relExpTime && <p className="text-sm text-red-500">{errors.relExpTime.message}</p>}
        </div>
        {mode !== "view" && relExpTime !== null && (
          <Button variant="ghost" size="sm" onClick={() => setValue("relExpTime", null, { shouldValidate: true })}>
            <KeenIcon icon="cross" />
          </Button>
        )}
      </div>
      <div className="flex flex-row justify-end">
        <Label className="text-sm p-1 w-1/4 truncate" title="Relative Period Unit">
          Relative Period Unit
        </Label>
        <div className="flex-1">
          <Controller
            name="periodRelUnit"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(val) => {
                  field.onChange(val || null);
                }}
                value={field.value ?? ""}
                disabled={mode === "view"}
              >
                <SelectTrigger className="h-[30px]">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="M">Month</SelectItem>
                  <SelectItem value="D">Day</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        {mode !== "view" && selectedPeriodRelUnit !== null && (
          <Button variant="ghost" size="sm" onClick={() => setValue("periodRelUnit", null, { shouldValidate: true })}>
            <KeenIcon icon="cross" />
          </Button>
        )}
      </div>
    </>
  );
};
