import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { effectiveDurationValue } from "../../interface";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { TimeUnit } from "@/pages/main-menu/data-reference/ratable-event-action/hooks/RatableEventActionContext";
import { KeenIcon } from "@/components";

interface EffectiveDurationProps {
  valueEffectiveDuration: string;
  valueTimeUnit: string;
  onSubmit: (value: effectiveDurationValue) => void;
  getTimeUnitName: (id: string) => string;
  timeUnitDatas: TimeUnit[];
  isSelected: boolean;
}

const EffectiveDuration: React.FC<EffectiveDurationProps> = ({
  onSubmit,
  valueEffectiveDuration,
  valueTimeUnit,
  getTimeUnitName,
  timeUnitDatas,
  isSelected,
}) => {
  const { GetData } = useCallApi();
  const [open, setOpen] = useState<boolean>(false);
  const [effectiveValue, setEffectiveValue] = useState<string>(
    valueEffectiveDuration ?? "",
  );
  const [timeUnitValue, setTimeUnitValue] = useState<string>(
    valueTimeUnit ?? "",
  );

  useEffect(() => {
    setEffectiveValue(valueEffectiveDuration);
    setTimeUnitValue(valueTimeUnit);
    getTimeUnitName(valueTimeUnit);
  }, [valueEffectiveDuration, valueTimeUnit]);

  const handleOk = () => {
    if (!timeUnitValue) return;
    onSubmit({
      duration: effectiveValue,
      timeUnit: timeUnitValue,
    });
    setOpen(false);
  };

  const handleReset = () => {
    //  console.log("reset");
    setEffectiveValue("");
    setTimeUnitValue("");
    onSubmit({
      duration: "",
      timeUnit: "",
    });
  };

  const icon = open ? "up-square" : "down-square";

  return (
    <DropdownMenu open={open && isSelected} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900">
          <Label className="cursor-pointer">
            {`${valueEffectiveDuration === "" && isSelected ? "Forever" : `${valueEffectiveDuration} ${getTimeUnitName(valueTimeUnit)}`} `}
            {valueEffectiveDuration === "" && isSelected && (
              <span className="p-1">{<KeenIcon icon={icon} />}</span>
            )}
          </Label>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] p-4 space-y-4">
        {/* Agreement Period */}
        <div className="grid grid-cols-3 items-center">
          <Label className="w-32 text-sm">
            <span className="text-red-500">*</span>Effective Duration
          </Label>
          <div className="col-span-2">
            <div className="flex flex-row">
              {/* input */}
              <Input
                className="w-[60px] mr-1 h-8"
                value={effectiveValue}
                disabled
              />
              {/* select */}
              <Select
                onValueChange={(val) => setTimeUnitValue(val)}
                value={timeUnitValue}
                disabled
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {timeUnitDatas.map((item, idx) => (
                    <SelectItem key={idx} value={item.id}>
                      {item.timeUnitName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <Button
            variant="default"
            size="sm"
            className="mr-2 text-white bg-blue-500 hover:bg-blue-700"
            onClick={handleOk}
            disabled
          >
            OK
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} disabled>
            Reset
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EffectiveDuration;
