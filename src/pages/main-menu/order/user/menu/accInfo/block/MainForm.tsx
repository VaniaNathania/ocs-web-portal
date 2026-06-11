import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccountInfo } from "@/pages/main-menu/order/models/interfaces";
import React, { SetStateAction, useEffect, useMemo, useState } from "react";
import { MasterAccForm } from "../models/interfaces";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
interface AccMainForm {
  disable: boolean;
  formVal?: AccountInfo;
  isEdit?: boolean;
  setFormVal: React.Dispatch<SetStateAction<AccountInfo | undefined>>;
}

const API_ORDER = apiConfigOrder.order;

const AccountInfoMainForm = ({
  disable,
  formVal,
  setFormVal,
  isEdit = false,
}: AccMainForm) => {
  const { GetData } = useCallApi();
  const [searchAcctRes, setSearchAcctRes] = useState<string>("");
  const [openAcctRes, setOpenAcctRes] = useState<boolean>(false);

  const fetchInitialDataUseQuery = async (): Promise<MasterAccForm> => {
    const [
      billCycleTypeResp,
      deliverMethodResp,
      paymentMethodResp,
      acctResListResp,
      fileTypeResp,
    ] = await Promise.all([
      GetData(
        `${API_ORDER}/api/order-entry/common-service/billing-cycle-type`,
        {},
      ),
      GetData(
        `${API_ORDER}/api/order-entry/common-service/qry-deliver-method`,
        {},
      ),
      GetData(
        `${API_ORDER}/api/order-entry/common-service/qry-payment-method`,
        {},
      ),
      GetData(`${API_ORDER}/api/order-entry/acct/qry-acct-res-list`, {}),
      GetData(`${API_ORDER}/api/order-entry/common-service/find-file-type`, {}),
    ]);

    const hasError =
      !billCycleTypeResp.status ||
      !deliverMethodResp.status ||
      !paymentMethodResp.status ||
      !acctResListResp.status ||
      !fileTypeResp.status;

    if (hasError) {
      toast.error("Failed to fetch neccesary data for order");
      return {
        paymentMethod: [],
        billCurency: [],
        billCycleType: [],
        deliveryMethod: [],
        fileFormat: [],
      };
    }

    return {
      paymentMethod: paymentMethodResp.data,
      billCurency: acctResListResp.data,
      billCycleType: billCycleTypeResp.data,
      deliveryMethod: deliverMethodResp.data,
      fileFormat: fileTypeResp.data,
    };
  };

  const accInfoUseQuery: UseQueryResult<MasterAccForm> = useQuery({
    queryKey: ["acc-info-master-data"],
    queryFn: fetchInitialDataUseQuery,
    // refetchOnMount: false,
    // staleTime: 1, // 10 minutes (master data rarely changes)
  });

  const handleChange = (field: string, value: any) => {
    setFormVal?.({ ...formVal, [field]: value });
  };

  const BalTypeOptions = useMemo(
    () =>
      accInfoUseQuery.data?.billCurency.filter((item) =>
        item.acctResName.toLowerCase().includes(searchAcctRes.toLowerCase()),
      ),
    [accInfoUseQuery.data?.billCurency, searchAcctRes],
  );

  const SelectedBalType = useMemo(
    () =>
      BalTypeOptions?.find((e) => e.acctResId === formVal?.billCurrency)
        ?.acctResName || "Please Select",
    [formVal?.billCurrency, accInfoUseQuery.data?.billCurency],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 text-sm gap-2">
        <div className="flex flex-row items-center gap-2 col-span-2">
          <div className="h-4 border-r-4 border-primary" />
          <div className="text-lg">Basic Information</div>
        </div>
        <div className="flex flex-row items-center">
          <Label className="w-1/4">Paid Flag</Label>
          <div className="w-3/4 flex flex-row gap-5">
            <div className="flex flex-row items-center gap-2">
              <Input
                type="radio"
                className="w-[15px]"
                disabled={disable || isEdit}
                checked={formVal?.postpaid === "N"}
                onChange={() => {
                  setFormVal((prev) => ({
                    ...prev,
                    billingCycleTypeId: undefined,
                    postpaid: "N",
                  }));
                  // handleChange("postpaid", "N");
                }}
                value={"N"}
              />
              Pre-Paid
            </div>
            <div className="flex flex-row items-center gap-2">
              <Input
                type="radio"
                className="w-[15px]"
                disabled={disable || isEdit}
                checked={formVal?.postpaid === "Y"}
                onChange={() => {
                  setFormVal((prev) => ({
                    ...prev,
                    billingCycleTypeId: undefined,
                    postpaid: "Y",
                  }));
                  // handleChange("postpaid", "Y");
                }}
                value={"Y"}
              />
              Post-Paid
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center">
          <Label className="w-1/4">
            Billing Cycle Type<span className="text-red-500">*</span>
          </Label>
          {/* <Input
            className="w-3/4"
            size={"sm"}
            disabled={disable}
            value={formVal?.billingCycleTypeName}
            onChange={(e) =>
              setFormVal((prev) => ({
                ...prev,
                billingCycleTypeName: e.target.value,
              }))
            }
          /> */}
          <Select
            value={
              formVal?.billingCycleTypeId
                ? formVal?.billingCycleTypeId?.toString()
                : ""
            }
            onValueChange={(e) =>
              setFormVal((prev) => ({
                ...prev,
                billingCycleTypeId: Number(e),
              }))
            }
            disabled={disable || isEdit}
          >
            <SelectTrigger className="w-3/4" size="sm">
              <SelectValue placeholder="Select Payment Method" />
            </SelectTrigger>
            <SelectContent>
              {accInfoUseQuery.data?.billCycleType.map((item) => {
                if (item.postpaid != formVal?.postpaid) return;
                return (
                  <SelectItem
                    key={item.billingCycleTypeId}
                    value={item.billingCycleTypeId.toString()}
                  >
                    {item.billingCycleTypeName}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row items-center">
          <Label className="w-1/4">Default Account</Label>
          <div className="w-3/4 flex flex-row gap-5">
            <div className="flex flex-row items-center gap-2">
              <Input
                type="radio"
                className="w-[15px]"
                disabled={disable}
                checked={formVal?.defaultFlag === "Y"}
                onChange={() => handleChange("defaultFlag", "Y")}
              />
              Yes
            </div>
            <div className="flex flex-row items-center gap-2">
              <Input
                type="radio"
                className="w-[15px]"
                disabled={disable}
                checked={formVal?.defaultFlag === "N"}
                onChange={() => handleChange("defaultFlag", "N")}
              />
              No
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center">
          <Label className="w-1/4">Payment Type</Label>
          <div className="w-3/4 flex flex-row gap-5">
            <div className="flex flex-row items-center gap-2">
              <Input
                type="radio"
                className="w-[15px]"
                disabled={disable}
                checked={formVal?.paymentType === "A"}
                onChange={() => {
                  setFormVal(
                    (val) =>
                      (val = {
                        ...val,
                        paymentType: "A",
                        paymentTypeName: "Automatic Payment",
                      }),
                  );
                }}
              />
              Automatic Payment
            </div>
            <div className="flex flex-row items-center gap-2">
              <Input
                type="radio"
                className="w-[15px]"
                disabled={disable}
                checked={formVal?.paymentType === "B"}
                onChange={() => {
                  setFormVal(
                    (val) =>
                      (val = {
                        ...val,
                        paymentType: "B",
                        paymentTypeName: "Manual Payment",
                      }),
                  );
                }}
              />
              Manual Payment
            </div>
          </div>
        </div>
        {formVal?.paymentType === "A" && (
          <div className="flex flex-row items-center">
            <Label className="w-1/4">
              Payment Method<span className="text-red-500">*</span>
            </Label>
            <Select
              value={formVal?.paymentMethodId?.toString() || ""}
              onValueChange={(value) =>
                handleChange("paymentMethodId", Number(value))
              }
              disabled={disable}
            >
              <SelectTrigger className="w-3/4" size="sm">
                <SelectValue placeholder="Select Payment Method" />
              </SelectTrigger>
              <SelectContent>
                {accInfoUseQuery.data?.paymentMethod.map((item) => (
                  <SelectItem
                    key={item.paymentMethodId}
                    value={item.paymentMethodId.toString()}
                  >
                    {item.paymentMethodName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex flex-row items-center">
          <Label className="w-1/4">Bill Curency</Label>
          {/* <Select
            value={formVal?.billCurrency?.toString() || ""}
            onValueChange={(value) =>
              handleChange("billCurrency", Number(value))
            }
            disabled={disable}
          >
            <SelectTrigger className="w-3/4" size="sm">
              <SelectValue placeholder="Select Bill Curency" />
            </SelectTrigger>
            <SelectContent>
              {accInfoUseQuery.data?.billCurency.map((item) => (
                <SelectItem
                  key={item.acctResId}
                  value={item.acctResId.toString()}
                >
                  {item.acctResName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}
          <div className="flex flex-1 min-w-0 relative" title={SelectedBalType}>
            <Popover open={openAcctRes} onOpenChange={setOpenAcctRes}>
              <PopoverTrigger
                asChild
                className="flex-1 flex"
                disabled={disable}
              >
                <Button
                  className="justify-start flex-1 truncate"
                  variant="outline"
                  size={"sm"}
                >
                  <div className="flex flex-row w-full items-center justify-between">
                    {SelectedBalType}
                    <KeenIcon icon="down" />
                  </div>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                <Command>
                  <CommandInput
                    placeholder="Search..."
                    value={searchAcctRes}
                    onValueChange={setSearchAcctRes}
                  />

                  <CommandEmpty>No results</CommandEmpty>

                  <CommandGroup
                    className="overflow-y-auto max-h-[400px] w-full"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    {BalTypeOptions?.map((item) => (
                      <CommandItem
                        key={item.acctResId}
                        onSelect={() => {
                          handleChange("billCurrency", item.acctResId);

                          setOpenAcctRes(false); // close popover
                        }}
                      >
                        {item.acctResName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex flex-row items-center gap-2 col-span-2">
          <div className="h-4 border-r-4 border-primary" />
          <div className="text-lg">Bill Delivery Information</div>
        </div>
        <div className="flex flex-row items-center">
          <Label className="w-1/4">Delivery Method</Label>
          <Select
            value={formVal?.deliverMethod || ""}
            onValueChange={(value) => {
              //  console.log(value, formVal?.deliverMethod);

              handleChange("deliverMethod", value);
            }}
            disabled={disable}
          >
            <SelectTrigger className="w-3/4" size="sm">
              <SelectValue placeholder="Select Delivery Method" />
            </SelectTrigger>
            <SelectContent>
              {accInfoUseQuery.data?.deliveryMethod.map((item) => (
                <SelectItem key={item.deliverMethod} value={item.deliverMethod}>
                  {item.deliverMethodName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row items-center">
          <Label className="w-1/4">File Format</Label>
          <Select
            value={formVal?.custBillDelivery?.fileType || ""}
            onValueChange={(value) =>
              setFormVal(
                (prev) =>
                  (prev = {
                    ...prev,
                    custBillDelivery: {
                      ...prev?.custBillDelivery,
                      fileType: value,
                    },
                  }),
              )
            }
            disabled={disable}
          >
            <SelectTrigger className="w-3/4" size="sm">
              <SelectValue placeholder="Select File Format" />
            </SelectTrigger>
            <SelectContent>
              {accInfoUseQuery.data?.fileFormat.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.lookupName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row items-center">
          <Label className="w-1/4">Bill Format</Label>
          <Select
            // value={formVal?.custBillDelivery?.custBillDeliveryInfoId || ""}
            // onValueChange={(value) =>
            //   setFormVal(
            //     (prev) =>
            //       (prev = {
            //         ...prev,
            //         custBillDelivery: {
            //           ...prev?.custBillDelivery,
            //           custBillDeliveryInfoId: value,
            //         },
            //       }),
            //   )
            // }
            disabled={disable}
          >
            <SelectTrigger className="w-3/4" size="sm">
              <SelectValue placeholder="Select Bill Format" />
            </SelectTrigger>
            <SelectContent>
              {/* {accInfoUseQuery.data?.fileFormat.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.lookupName}
                </SelectItem>
              ))} */}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row items-center">
          <Label className="w-1/4">Bill Flag</Label>
          <Select
            value={formVal?.billFlag || ""}
            onValueChange={(value) => handleChange("billFlag", value)}
            disabled={disable}
          >
            <SelectTrigger className="w-3/4" size="sm">
              <SelectValue placeholder="Select Delivery Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key={"Y"} value={"Y"}>
                Yes
              </SelectItem>
              <SelectItem key={"N"} value={"N"}>
                No
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row items-center">
          <Label className="w-1/4">Email</Label>
          <Input
            className="w-3/4"
            size={"sm"}
            disabled={disable}
            value={formVal?.custBillDelivery?.email || ""}
            onChange={(value) =>
              setFormVal(
                (prev) =>
                  (prev = {
                    ...prev,
                    custBillDelivery: {
                      ...prev?.custBillDelivery,
                      email: value.target.value,
                    },
                  }),
              )
            }
          />
        </div>
        <div className="flex flex-row items-center">
          <Label className="w-1/4">Cc-email</Label>
          <Input
            className="w-3/4"
            size={"sm"}
            disabled={disable}
            value={formVal?.custBillDelivery?.ccEmail || ""}
            onChange={(value) =>
              setFormVal(
                (prev) =>
                  (prev = {
                    ...prev,
                    custBillDelivery: {
                      ...prev?.custBillDelivery,
                      ccEmail: value.target.value,
                    },
                  }),
              )
            }
          />
        </div>
        <div className="flex flex-row items-center">
          <Label className="w-1/4">SMS Number</Label>
          <Input
            className="w-3/4"
            size={"sm"}
            disabled={disable}
            value={formVal?.custBillDelivery?.smsNbr || ""}
            onChange={(value) =>
              setFormVal(
                (prev) =>
                  (prev = {
                    ...prev,
                    custBillDelivery: {
                      ...prev?.custBillDelivery,
                      smsNbr: value.target.value,
                    },
                  }),
              )
            }
          />
        </div>
        <div className="flex flex-row items-center">
          <Label className="w-1/4">Fax Number</Label>
          <Input
            className="w-3/4"
            size={"sm"}
            disabled={disable}
            value={formVal?.custBillDelivery?.faxNbr || ""}
            onChange={(value) =>
              setFormVal(
                (prev) =>
                  (prev = {
                    ...prev,
                    custBillDelivery: {
                      ...prev?.custBillDelivery,
                      faxNbr: value.target.value,
                    },
                  }),
              )
            }
          />
        </div>
        <div className="flex flex-row items-center">
          <Label className="w-1/4">Postal Code</Label>
          <Input
            className="w-3/4"
            size={"sm"}
            disabled={disable}
            value={formVal?.custBillDelivery?.zipcode || ""}
            onChange={(value) =>
              setFormVal(
                (prev) =>
                  (prev = {
                    ...prev,
                    custBillDelivery: {
                      ...prev?.custBillDelivery,
                      zipcode: value.target.value,
                    },
                  }),
              )
            }
          />
        </div>
        <div className="flex flex-row items-center">
          <Label className="w-1/4">Address Detail</Label>
          <Input
            className="w-3/4"
            size={"sm"}
            disabled={disable}
            value={formVal?.custBillDelivery?.detailInfo || ""}
            onChange={(value) =>
              setFormVal(
                (prev) =>
                  (prev = {
                    ...prev,
                    custBillDelivery: {
                      ...prev?.custBillDelivery,
                      detailInfo: value.target.value,
                    },
                  }),
              )
            }
          />
        </div>
        {/* <div className="flex flex-row items-center gap-2">
          <div className="h-4 border-r-4 border-primary" />
          <div className="text-lg">Additional Information</div>
        </div>
        <div></div>
        {false && (
          <div className="flex flex-row items-center">
            <Label className="w-1/4">Credit Limit Amount</Label>
            <Input className="w-3/4" size={"sm"} disabled={disable} />
          </div>
        )} */}
        {/* <div className="flex flex-row items-center">
          <Label className="w-1/4">ACCOUNT MANAGER</Label>
          <Input className="w-3/4" size={"sm"} disabled={disable} />
        </div> */}
      </div>
    </div>
  );
};

export default AccountInfoMainForm;
