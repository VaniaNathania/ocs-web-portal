import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { KeenIcon } from "@/components";
import { keenIconItems } from "../mockData";

interface IconSelectorData {
  watch: any;
  register: any;
  setValue: any;
  disable?: boolean;
  size?: "default" | "lg" | "sm";
}

const IconSelector = ({
  watch,
  register,
  setValue,
  disable = false,
  size = "default",
}: IconSelectorData) => {
  const KeenIconItems = keenIconItems;

  const iconValue = watch("iconUrl"); // 👈 Watch selected icon
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="input bg-white">
          <KeenIcon icon={iconValue ?? ""} />
          <Input
            placeholder="Select Icon"
            autoComplete="off"
            readOnly
            size={size}
            className="cursor-pointer text-left border-none"
            {...register("iconUrl")}
            //   {...register("iconUrl", { required: "Icon URL is required" })}
            disabled={disable}
            value={iconValue ?? ""}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent className="z-[1000]" align="center">
        <Command>
          <CommandInput placeholder="Search icon..." />
          <CommandList>
            <CommandEmpty>No icon found.</CommandEmpty>
            <CommandGroup>
              {KeenIconItems.map((item) => (
                <CommandItem
                  key={item.icon}
                  value={item.icon}
                  onSelect={() => {
                    setValue("iconUrl", item.icon, {
                      shouldValidate: true,
                    });
                    setOpen(false); // close popover
                  }}
                >
                  <KeenIcon icon={item.icon} />
                  <span className="ml-2">{item.icon}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default IconSelector;
