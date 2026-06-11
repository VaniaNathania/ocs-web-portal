import { Input } from "@/components/ui/input";
import { useCallback, useRef } from "react";

function useDebounce(callback: any, delay: any) {
  const timer = useRef<NodeJS.Timeout | null>(null);

  const debouncedFunction = useCallback(
    (...args: any[]) => {
      if (timer.current) clearTimeout(timer.current);

      timer.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  return debouncedFunction;
}

export const SelectInput = ({
  childData,
  data,
  setPartys,
}: {
  childData: any;
  data: any;
  setPartys: any;
}) => {
  const debouncedUpdate = useDebounce((newValue: string) => {
    setPartys((prev: any) =>
      prev.map((partysItem: any) => {
        if (partysItem.index !== data.index) return partysItem;

        return {
          ...partysItem,
          children: (partysItem.children ?? []).map((child: any) =>
            child.attrId === childData.attrId
              ? {
                  ...child,
                  defaultValue: newValue,
                  defaultValueMark: newValue,
                }
              : child
          ),
        };
      })
    );
  }, 400); // delay 400ms

  return (
    <Input
      type="text"
      defaultValue={childData.defaultValue || ""}
      onChange={(e) => debouncedUpdate(e.target.value)}
    />
  );
};
