import { Input } from "@/components/ui/input";
import {
  AttrCustDto,
  AttrOrder,
} from "@/pages/main-menu/order/models/interfaces";
import { AttrRec } from "@/pages/main-menu/order/models/types";
import { useState, Dispatch, SetStateAction } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  attrId: number;
  rowData: AttrCustDto;
  rec: AttrRec;
  setRec: Dispatch<SetStateAction<AttrRec>>;
  disable: boolean;
}

export const AttrCust = ({ attrId, rowData, rec, setRec, disable }: Props) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  if (!rec) {
    //  console.log("ini rec", rec);

    return;
  }
  const attr = rowData;

  const dpOfferOrderAttr: AttrCustDto | undefined = rec[attrId.toString()];

  // if (offerAttr && rec) {
  //   setRec((prev) => ({
  //     ...prev,
  //     [offerId.toString()]: offerAttr.flatMap((item): DPOfferAttrList => {
  //       if (item.attrId != attrId) return { ...item, operationType: "A" };
  //       return {
  //         ...attr,
  //         offerId: offerId,
  //         attrId: attrId,
  //         operationType: "A",
  //         value: attr?.defaultValue ?? "",
  //         valueMark: attr?.defaultValue ?? "",
  //       };
  //     }),
  //   }));
  // }
  // if (attr?.inputType == "4") {
  return (
    <Input
      size={"sm"}
      value={
        dpOfferOrderAttr?.attrValue ?? dpOfferOrderAttr?.oldAttrValue ?? ""
      }
      disabled={disable}
      className="flex-1"
      onChange={(e) => {
        if (!dpOfferOrderAttr) {
          setRec((prev) => ({
            ...prev,
            [`${attrId}`]: {
              ...attr,
              attrId,
              attrValue: e.target.value,
              oldAttrValue: prev[`${attrId}`].attrValue,
            },
          }));
        }
        setRec((prev) => ({
          ...prev,
          [`${attrId}`]: {
            ...attr,
            attrId,
            attrValue: e.target.value,
            oldAttrValue: prev[`${attrId}`].attrValue,
          },
        }));
      }}
    />
  );
  // }

  // return (
  //   <Select
  //     value={
  //       dpOfferOrderAttr?.attrValue
  //         ? `${dpOfferOrderAttr.attrValue}`
  //         : dpOfferOrderAttr?.oldAttrValue
  //           ? `${dpOfferOrderAttr?.oldAttrValue}#${dpOfferOrderAttr?.oldAttrValue}`
  //           : ""
  //     }
  //     onValueChange={(e) => {
  //       const [value, valueMark] = e.split("#");
  //     //  console.log(
  //         `${attrId}`,
  //         value,
  //         valueMark,
  //         e,
  //         dpOfferOrderAttr,
  //         attr,
  //         rec,
  //       );

  //       if (!dpOfferOrderAttr) {
  //         setRec((prev) => ({
  //           ...prev,
  //           [`${attrId}`]: {
  //             ...attr,
  //             attrId,
  //             attrValue: e,
  //             oldAttrValue: prev[`${attrId}`].attrValue,
  //             spId: 0,
  //           },
  //         }));
  //       } else {
  //         setRec((prev) => ({
  //           ...prev,
  //           [`${attrId}`]: {
  //             attrId,
  //             attrValue: e,
  //             oldAttrValue: prev[`${attrId}`].attrValue,
  //             spId: 0,
  //           },
  //         }));
  //       }
  //     }}
  //   >
  //     <SelectTrigger
  //       size="sm"
  //       className="border-0 focus:ring-0 focus:outline-none text-sm input-sm input"
  //     >
  //       <SelectValue placeholder="Feature Value" />
  //     </SelectTrigger>

  //     <SelectContent>
  //       {attr?.attrValueList.map((item, index) => (
  //         <SelectItem key={index} value={`${item.value}#${item.valueMark}`}>
  //           {item.valueMark}
  //         </SelectItem>
  //       ))}
  //     </SelectContent>
  //   </Select>
  // );

  // const handleChangeValueMark = (item: any) => {
  //   setIsLoading(true);

  //   setRowData((prev) => {
  //     const key = String(offerId); // id as string
  //     const list = prev[key] ?? []; // AttrOrder[]

  //     const updatedList = list.map((child) => {
  //       if (child.attrId !== attr?.attrId) return child;

  //       const currentIds = child.attrValueIds ?? [];
  //       const attrValueId = item.attrValueId ?? 0;
  //       const isDefault = item.value === child.defaultValue;
  //       const exists = currentIds.includes(attrValueId);

  //       return {
  //         ...child,
  //         defaultValue: isDefault ? "" : child.defaultValue,
  //         defaultValueMark: isDefault ? "" : child.defaultValueMark,
  //         attrValueIds: exists
  //           ? currentIds.filter((id) => id !== attrValueId)
  //           : [...currentIds, attrValueId],
  //       };
  //     });

  //     return {
  //       ...prev,
  //       [key]: updatedList,
  //     };
  //   });

  //   setIsLoading(false);
  // };

  // const handleChangeDefaultValue = (item: any) => {
  //   setIsLoading(true);

  //   setRowData((prev) => {
  //     const list = offerAttr;

  //     const updated = list.map((child) => {
  //       if (child.attrId !== attr?.attrId) return child;

  //       const isDefault = item.value === child.defaultValue;

  //       return {
  //         ...child,
  //         defaultValue: isDefault ? "" : item.value,
  //         defaultValueMark: isDefault ? "" : item.valueMark,
  //       };
  //     });

  //     return {
  //       ...prev,
  //       [String(offerId)]: updated,
  //     };
  //   });

  //   setIsLoading(false);
  // };

  // return (
  //   <div>
  //     <DropdownMenu open={open} onOpenChange={setOpen}>
  //       <DropdownMenuTrigger asChild>
  //         <div className="flex items-center cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900 input input-sm bg-white">
  //           <div className="flex-1 flex flex-row items-center gap-1 overflow-hidden">
  //             {attr?.attrValueList
  //               .filter((item: any) =>
  //                 attr.attrValueIds?.includes(item.attrValueId ?? 0),
  //               )
  //               .map((item: any) => (
  //                 <DefaultTooltip
  //                   key={item.attrValueId}
  //                   title={`${item.valueMark}(${item.value})`}
  //                   placement="top"
  //                 >
  //                   <div
  //                     className={`flex-shrink min-w-0 px-2 py-1 rounded-md transition-all duration-300 ${
  //                       item.value === attr.defaultValue
  //                         ? " text-blue-500 font-bold"
  //                         : ""
  //                     }`}
  //                   >
  //                     <span className="truncate block max-w-[120px]">
  //                       {item.valueMark}({item.value})
  //                     </span>
  //                   </div>
  //                 </DefaultTooltip>
  //               ))}
  //           </div>
  //           <KeenIcon icon="down" className="ml-1 flex-shrink-0" />
  //         </div>
  //       </DropdownMenuTrigger>

  //       <DropdownMenuContent className="w-[400px] p-4 space-y-4">
  //         <div className="relative">
  //           <div className="flex flex-row font-medium border-b pb-2 mb-2">
  //             <div className="w-3/4">Value</div>
  //             <div className="w-1/4 text-center">Default</div>
  //           </div>

  //           {attr?.attrValueList?.map((item: any) => {
  //             const isChecked = attr.attrValueIds?.includes(
  //               item.attrValueId ?? 0,
  //             );
  //             const isDefault = attr.defaultValue === item.value;
  //             return (
  //               <div
  //                 key={item.attrValueId}
  //                 className="flex flex-row items-center"
  //               >
  //                 <div className="w-3/4 flex flex-row gap-2 items-center">
  //                   <input
  //                     type="checkbox"
  //                     checked={isChecked}
  //                     disabled={isLoading}
  //                     onChange={() => handleChangeValueMark(item)}
  //                   />
  //                   {item.valueMark}
  //                 </div>

  //                 {isChecked && (
  //                   <div className="w-1/4 flex flex-row gap-2 items-center justify-center">
  //                     <input
  //                       type="checkbox"
  //                       checked={isDefault}
  //                       disabled={isLoading}
  //                       onChange={() => handleChangeDefaultValue(item)}
  //                     />
  //                     {item.value}
  //                   </div>
  //                 )}
  //               </div>
  //             );
  //           })}
  //           {isLoading && <Loading />}
  //         </div>
  //       </DropdownMenuContent>
  //     </DropdownMenu>
  //   </div>
  // );
};
