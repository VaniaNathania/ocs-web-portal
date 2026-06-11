import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

type BalanceItem = {
  balType: number;
  balTypeName: string;
  acctResId: number;
  acctResName: string;
};

type Props = {
  data: BalanceItem[];
  value: string;
  onChange: (selection: { type: "parent" | "child"; value: number }) => void;
};

const BalanceSelect = ({ data, value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");

  const grouped = data.reduce(
    (acc, item) => {
      if (!acc[item.balType]) {
        acc[item.balType] = {
          balTypeName: item.balTypeName,
          children: [],
        };
      }
      acc[item.balType].children.push(item);
      return acc;
    },
    {} as Record<number, { balTypeName: string; children: BalanceItem[] }>
  );

  const selectedLabel = (() => {
    if (selectedValue.startsWith("parent-")) {
      const balType = parseInt(selectedValue.replace("parent-", ""));
      return grouped[balType]?.balTypeName || "Select Balance";
    } else if (selectedValue.startsWith("child-")) {
      const acctResId = parseInt(selectedValue.replace("child-", ""));
      for (const group of Object.values(grouped)) {
        const found = group.children.find((c) => c.acctResId === acctResId);
        if (found) return found.acctResName;
      }
    }
    return "Select Balance";
  })();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selectedLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] max-h-[400px] overflow-auto p-0">
        <Accordion type="multiple" className="w-full">
          {Object.entries(grouped).map(
            ([balType, { balTypeName, children }]) => (
              <AccordionItem key={balType} value={balType}>
                {/* Header hanya untuk toggle */}
                <AccordionTrigger className="text-sm font-medium px-3 py-2 hover:bg-muted">
                  {balTypeName}
                </AccordionTrigger>

                {/* Content ada tombol untuk select parent dan daftar anak */}
                <AccordionContent>
                  <div
                    className="cursor-pointer text-blue-600 hover:underline px-5 py-1 text-sm"
                    onClick={() => {
                      onChange({ type: "parent", value: parseInt(balType) });
                      setSelectedValue(`parent-${balType}`);
                      setOpen(false);
                    }}
                  >
                    ➤ Select {balTypeName} (Parent)
                  </div>
                  {children.map((child) => (
                    <div
                      key={child.acctResId}
                      className="cursor-pointer px-5 py-1 text-sm hover:bg-muted"
                      onClick={() => {
                        onChange({ type: "child", value: child.acctResId });
                        setSelectedValue(`child-${child.acctResId}`);
                        setOpen(false);
                      }}
                    >
                      {child.acctResName}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            )
          )}
        </Accordion>
      </PopoverContent>
    </Popover>
  );
};

export default BalanceSelect;
