import { DefaultTooltip, KeenIcon } from "@/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { useEffect, useState, useRef } from "react";

interface Props {
  rowData: any;
  setRowData: React.Dispatch<React.SetStateAction<any[]>>;
}

export const FeatureValueField = ({ rowData, setRowData }: Props) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // We’ll track updates with a ref
  const isUpdating = useRef(false);

  const data = rowData;
  const attrId = data.index.replace(`${data.offerId?.toString()}-`, "");
  const childData = data.children?.find((item: any) => item.attrId == attrId);
  if (!childData) return null;

  // Initialize attrValueIds if missing
  if (childData?.attrValueDtoList && !childData.attrValueIds) {
    if (childData.valueIds) {
      childData.attrValueIds = childData.valueIds
        .split("|")
        .map((item: string) => parseInt(item));
    } else {
      childData.attrValueIds = childData.attrValueDtoList
        .filter((item: any) => childData.defaultValue === item.value)
        .map((item: any) => item.attrValueId ?? 0);
    }
  }

  // This effect runs when a re-render happens after setRowData
  useEffect(() => {
    if (isUpdating.current) {
      setIsLoading(false);
      isUpdating.current = false;
    }
  }, [rowData]); // ✅ triggered after data update completes and re-renders

  const handleChangeValueMark = (item: any) => {
    setIsLoading(true);
    isUpdating.current = true;

    setRowData((prev: any) =>
      prev.map((partysItem: any) => {
        if (partysItem.index !== data.index) return partysItem;

        const newChild = (partysItem.children ?? []).map((child: any) => {
          if (child.attrId === childData.attrId) {
            const currentIds = childData.attrValueIds ?? [];
            const isDefault = item.value === child.defaultValue;
            const attrValueId = item.attrValueId ?? 0;
            const includeAttrId = currentIds.includes(attrValueId);

            return {
              ...child,
              defaultValue: isDefault ? "" : child.defaultValue,
              defaultValueMark: isDefault ? "" : child.defaultValueMark,
              attrValueIds: includeAttrId
                ? currentIds.filter((id: any) => id !== attrValueId)
                : [...currentIds, attrValueId],
            };
          }
          return child;
        });

        return { ...partysItem, children: newChild };
      })
    );
  };

  const handleChangeDefaultValue = (item: any) => {
    setIsLoading(true);
    isUpdating.current = true;

    setRowData((prev) =>
      prev.map((partysItem) => {
        if (partysItem.index !== data.index) return partysItem;

        const newChild = (partysItem.children ?? []).map((child: any) => {
          if (child.attrId === childData.attrId) {
            const isDefault = item.value === child.defaultValue;
            return {
              ...child,
              defaultValue: isDefault ? "" : item.value,
              defaultValueMark: isDefault ? "" : item.valueMark,
            };
          }
          return child;
        });

        return { ...partysItem, children: newChild };
      })
    );
  };

  return (
    <div>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900">
            <div className="flex-1 flex flex-row items-center gap-1 overflow-hidden">
              {childData.attrValueDtoList
                .filter((item: any) =>
                  childData.attrValueIds?.includes(item.attrValueId ?? 0)
                )
                .map((item: any) => (
                  <DefaultTooltip
                    key={item.attrValueId}
                    title={`${item.valueMark}(${item.value})`}
                    placement="top"
                  >
                    <div
                      className={`flex-shrink min-w-0 px-2 py-1 rounded-md transition-all duration-300 ${
                        item.value === childData.defaultValue
                          ? "bg-blue-500 text-white"
                          : ""
                      }`}
                    >
                      <span className="truncate block max-w-[120px]">
                        {item.valueMark}({item.value})
                      </span>
                    </div>
                  </DefaultTooltip>
                ))}
            </div>
            <KeenIcon icon="down" className="ml-1 flex-shrink-0" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[400px] p-4 space-y-4">
          <div className="relative">
            <div className="flex flex-row font-medium border-b pb-2 mb-2">
              <div className="w-3/4">Value</div>
              <div className="w-1/4 text-center">Default</div>
            </div>

            {childData.attrValueDtoList?.map((item: any) => {
              const isChecked = childData.attrValueIds?.includes(
                item.attrValueId ?? 0
              );
              const isDefault = childData.defaultValue === item.value;
              return (
                <div
                  key={item.attrValueId}
                  className="flex flex-row items-center"
                >
                  <div className="w-3/4 flex flex-row gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isLoading}
                      onChange={() => handleChangeValueMark(item)}
                    />
                    {item.valueMark}
                  </div>

                  {isChecked && (
                    <div className="w-1/4 flex flex-row gap-2 items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isDefault}
                        disabled={isLoading}
                        onChange={() => handleChangeDefaultValue(item)}
                      />
                      {item.value}
                    </div>
                  )}
                </div>
              );
            })}
            {isLoading && <Loading />}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
