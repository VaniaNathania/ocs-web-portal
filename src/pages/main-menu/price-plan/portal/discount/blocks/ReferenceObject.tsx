import { Controller, UseFormReturn } from "react-hook-form";
// import { DiscountPayload } from "./DiscountList";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import DiscountAPI from "../hooks/DiscountAPI";
import { useDiscountPriceContext } from "../hooks";
import MultiSelect from "../components/MultiSelect";
import { Button } from "@/components/ui/button";
import { DiscountPayload } from "../types/form";
import AcctMultiSelect from "@/components/common/AcctMultiSelect";

interface TabularFormProps {
  forms: UseFormReturn<DiscountPayload>;
  baseName: "referenceObject" | "calculationObject" | "applyingObject";
}
const API_URL = apiConfig.service_price_plan;
const ReferenceObjectForm = ({ forms, baseName }: TabularFormProps) => {
  const { PostData } = useCallApi();
  const { GetObjectTypeList, GetMemberAliasList } = DiscountAPI();
  const { acctItemType } = useDiscountPriceContext();

  const {
    register,
    watch,
    setValue,
    control,
    formState: { errors },
  } = forms;

  const [selectedItems, setSelectedItems] = useState<IAcctItemType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [objectTypeList, setObjectTypeList] = useState<
    {
      disctObjType: string;
      disctObjTypeName: string;
    }[]
  >([]);
  const [memberAlias, setMemberAlias] = useState<
    {
      memberAliasId: string;
      memberAliasName: string;
    }[]
  >([]);

  useEffect(() => {
    let mounted = true;

    const fetchList = async () => {
      try {
        const [objectTypeRes, memberAliasRes] = await Promise.all([
          GetObjectTypeList(),
          GetMemberAliasList(),
        ]);

        if (mounted) {
          if (objectTypeRes?.status) {
            setObjectTypeList(objectTypeRes.data ?? []);
          }
          if (memberAliasRes?.status) {
            setMemberAlias(memberAliasRes.data ?? []);
          }
        }
      } catch (e) {
        console.error("Failed fetching data:", e);
      }
    };

    fetchList();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 mb-5">
      {/* Object Name */}
      <div>
        <label className="text-sm font-medium">
          <span className="text-red-500">*</span>Object Name
        </label>
        <Input
          type="text"
          placeholder="Object Name"
          className={`w-full px-2 py-1 mt-1 text-sm border rounded ${errors?.[baseName]?.objectName ? "border-red-500" : ""}`}
          {...register(`${baseName}.objectName`)}
        />
        {errors?.[baseName]?.objectName && (
          <p className="text-xs text-red-500">
            {
              (errors as any)[baseName]?.objectName?.message // pakai any supaya fleksibel
            }
          </p>
        )}
      </div>

      {/* Object Type */}
      <div>
        <label className="text-sm font-medium">
          <span className="text-red-500">*</span>Object Type
        </label>
        <Controller
          name={`${baseName}.objectType`}
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={(val) => field.onChange(val)}
            >
              <SelectTrigger className={`w-full ${errors?.[baseName]?.objectType ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select Object Type" />
              </SelectTrigger>
              <SelectContent>
                {objectTypeList.length > 0 ? (
                  objectTypeList.map((item) => (
                    <SelectItem
                      key={item.disctObjType}
                      value={item.disctObjType}
                    >
                      {item.disctObjTypeName}
                    </SelectItem>
                  ))
                ) : (
                  <p className="p-2 text-sm text-center text-gray-500">
                    Object Type Not Found
                  </p>
                )}
              </SelectContent>
            </Select>
          )}
        />
        {errors?.[baseName]?.objectType && (
          <p className="text-xs text-red-500">
            {errors?.[baseName]?.objectType?.message}
          </p>
        )}
      </div>

      {/* Mapping Account Item */}
      <div>
        <label className="text-sm font-medium">Mapping Account Item</label>
        <Controller
          name={`${baseName}.mappingAccountItemTypes`}
          control={control}
          render={({ field }) => (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(true)}
                className="flex items-center justify-between w-full px-4 py-2 text-left bg-white border rounded-md hover:bg-gray-50"
              >
                {field.value?.length > 0 ? (
                  <span className="overflow-hidden text-gray-700">
                    {field.value
                      .map((item: any) => {
                        const opt = acctItemType.find(
                          (o) => Number(o.id) === item.acctItemTypeId
                        );
                        return opt ? opt.acctItemTypeName : "";
                      })
                      .join(", ")}
                  </span>
                ) : (
                  <span className="text-gray-400">Select account item</span>
                )}
              </Button>

              {/* Multi Select Component */}
              <MultiSelect
                showDialog={showDialog}
                setShowDialog={setShowDialog}
                options={acctItemType}
                placeholder="Select account item"
                searchPlaceholder="Search account item"
                // convert form value -> Option[]
                value={
                  field.value
                    ?.map((v: any) => {
                      const opt = acctItemType.find(
                        (o) => o.id === v.acctItemTypeId
                      );
                      return opt
                        ? { id: opt.id, acctItemTypeName: opt.acctItemTypeName }
                        : null;
                    })
                    .filter(
                      (x): x is { id: number; acctItemTypeName: string } =>
                        x !== null
                    ) || []
                }
                // convert Option[] -> schema value
                onChange={(items) => {
                  const mapped = items.map((item, idx) => ({
                    acctItemTypeId: Number(item.id),
                    priority: idx + 1,
                  }));
                  field.onChange(mapped);
                }}
              />
            </>
          )}
        />
      </div>

      {/* Member Alias */}
      <div>
        <label className="text-sm font-medium">Member Alias</label>
        <Controller
          name={`${baseName}.memberAlias`}
          control={control}
          render={({ field }) => (
            <Select
              value={
                field.value !== null && field.value !== undefined
                  ? String(field.value)
                  : ""
              }
              onValueChange={(val) =>
                field.onChange(val === "" ? null : Number(val))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Member" />
              </SelectTrigger>
              <SelectContent>
                {/* opsi kosong */}

                {memberAlias.length > 0 ? (
                  memberAlias.map((item) => (
                    <>
                      <SelectItem value="null">None</SelectItem>
                      <SelectItem
                        key={item.memberAliasId}
                        value={String(item.memberAliasId)}
                      >
                        {item.memberAliasName}
                      </SelectItem>
                    </>
                  ))
                ) : (
                  <p className="p-2 text-sm text-center text-gray-500">
                    Member Not Found
                  </p>
                )}
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </div>
  );
};

export default ReferenceObjectForm;
