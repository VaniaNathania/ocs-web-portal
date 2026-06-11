import React, { useEffect, useState } from "react";
import { KeenIcon } from "@/components";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ProductAliasProps {
  value: string;
  onSubmit: (value: string) => void;
}

const ProductAlias: React.FC<ProductAliasProps> = ({ onSubmit, value }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [localValue, setLocalValue] = useState<string>(value ?? "");

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleOk = () => {
    if (!localValue) return;
    onSubmit(localValue);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900" title="Product Alias">
          <KeenIcon icon="message-edit" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] p-4 space-y-4">
        {/* Agreement Period */}
        <div className="grid grid-cols-3 gap-x-5 items-center">
          <Label className="w-32 text-sm">Product Alias</Label>
          <Input
            className="h-8 col-span-2"
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value);
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <Button variant="default" size="sm" className="text-white bg-blue-500 hover:bg-blue-700" onClick={handleOk}>
            OK
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProductAlias;
