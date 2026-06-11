import React, { useEffect, useState } from "react";
import { KeenIcon } from "@/components";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubsPlanAttrFiji } from "../../interface";

interface DetailProps {
  value: SubsPlanAttrFiji;
  onSubmit: (value: SubsPlanAttrFiji) => void;
  hasFeature: boolean;
  attrsVal: SubsPlanAttrFiji | undefined;
}

const Detail: React.FC<DetailProps> = ({ onSubmit, value, hasFeature, attrsVal }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [localValue, setLocalValue] = useState<SubsPlanAttrFiji>(value ?? "");

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const icon = open ? "up-square" : "down-square";

  const isDirty = localValue !== value;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        if (open && !nextOpen && isDirty) {
          if (localValue) {
            onSubmit(localValue);
          }
        }
        setOpen(nextOpen);
      }}
    >
      <DropdownMenuTrigger asChild>
        <div className="flex items-center cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900">
          <Label className="cursor-pointer">
            Detail
            <span className="p-1">{<KeenIcon icon={icon} />}</span>
          </Label>
        </div>
      </DropdownMenuTrigger>
      {hasFeature && (
        <DropdownMenuContent className="w-[300px] p-4 space-y-4">
          {/* Agreement Period */}
          <div className="grid grid-cols-3 gap-x-5 items-center">
            <Label className="w-32 text-sm">{attrsVal?.attrName}</Label>
            <Input
              className="h-8 col-span-2"
              value={localValue?.attrValues ?? undefined}
              onChange={(e) => {
                setLocalValue((prev) => ({
                  ...prev,
                  attrValues: e.target.value,
                }));
              }}
            />
          </div>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default Detail;
