import {
  DataGridColumnHeader,
  DataGridProvider,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo } from "react";
import { apiConfigOrder } from "@/config/api.config";
import { useOrderForm } from "../hooks/context";
import { useOrderShop } from "../../../hooks/shopContext";
import { ColumnDef } from "@tanstack/react-table";
import { ModSubsServiceChild } from "../../../../subscriber/components/mockModSubs";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { useOrderUser } from "@/pages/main-menu/order/user/hooks/context";
import { DPOfferOrderList } from "../../../../subscriber/components/modifysubscriber/model/interfaces";
import { TimeUnitMapSubsPlan } from "@/pages/main-menu/offer/bundleNew-offer/types/BundleTypes";

const API_URL = apiConfigOrder.order;

const Steps2 = () => {
  const {
    ownedOffer,
    attrRec,
    setOffer,
    offer,
    dpOfferAttrRec,
    form,
    orderNbr,
  } = useOrderForm();
  const { orderUseQuery } = useOrder();
  const { acctList } = useOrderUser();
  const { step, selectedTableItem } = useOrderShop();

  useEffect(() => {
    //  console.log("ini di step2");

    if (step != 1) return;
    //  console.log("ini owned offer", ownedOffer);
    const child: DPOfferOrderList[] = [];
    const temp = ownedOffer.map((ofr) => {
      child.push(ofr);
    });
    //  console.log("ini chil temp", child);
    setOffer(child);
  }, [step]);

  const columns = useMemo<ColumnDef<DPOfferOrderList>[]>(
    () => [
      {
        accessorFn: (row) => row.operationType,
        id: "operationType",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Operation" />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const data = row.original;
          return (
            <KeenIcon
              className="text-xl"
              icon={
                data.operationType === "X"
                  ? "files"
                  : data.operationType === "D"
                    ? "trash"
                    : "plus"
              }
            />
          );
        },
      },
      {
        accessorFn: (row) => row.offerName,
        id: "offerName",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Offer Name" />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const data = row.original;
          return <div>{data.offerName}</div>;
        },
      },
      {
        accessorFn: (row) => row.effType,
        id: "effType",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Effective Type/Date" />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const data = row.original;
          return (
            <div>
              {data.absEffDate?.toString().replace("T", " ") ?? "instant"}
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.absEffDate,
        id: "absEffDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            title="Effective Duration/Date"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const data = row.original;
          return (
            <div>
              {data.absExpDate
                ? data.absExpDate?.toString().replace("T", " ")
                : data.relExpUnit
                  ? `${TimeUnitMapSubsPlan[data.relExpUnit]}(${data.relExpOffset})`
                  : "Forever"}
            </div>
          );
        },
      },
      {
        // accessorFn: (row) => row.,
        id: "featureInfo",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Feature Information" />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const data = row.original;
          if (dpOfferAttrRec[data.offerId + "#" + data.offerSeq]?.length === 0)
            return;
          return (
            <div className="grid grid-cols-1">
              <div className="grid grid-cols-3">
                <div className=" truncate">Parameter Name</div>
                <div className=" truncate">New Value</div>
                <div className=" truncate">Old Value</div>
              </div>
              {dpOfferAttrRec[`${data.offerId}#${data.offerSeq}`]?.map(
                (attr, index) => (
                  <div className="grid grid-cols-3" key={index}>
                    <div className=" truncate">{attr.attrName}</div>
                    <div className=" truncate">{attr.valueMark}</div>
                    <div className=" truncate">{attr.oldValueMark}</div>
                  </div>
                ),
              )}
            </div>
          );
        },
      },
    ],
    [offer],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <div className="h-5 w-2 rounded-sm bg-primary" />
          <div>Offer Information</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">Subscription Plan</Label>
            <div className="input input-sm">
              <Input
                className="border-none p-0"
                value={selectedTableItem?.offerName ?? ""}
                disabled
              />
              {/* <Button
                size={"sm"}
                variant={"ghost"}
                className="w-[20px] h-[20px] p-0"
              >
                <KeenIcon icon="notepad-edit" />
              </Button> */}
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">Order Number</Label>
            <div className="input input-sm">
              <Input className="border-none p-0" disabled value={orderNbr} />
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">Language</Label>
            <div
              className="input input-sm aria-disabled:bg-white"
              aria-disabled
            >
              <Select value={form?.defLangId?.toString()} disabled>
                <SelectTrigger className="border-none bg-transparent p-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderUseQuery.data?.defLang.map((item) => (
                    <SelectItem
                      value={item.defLangId.toString()}
                      key={item.defLangId}
                    >
                      {item.defLangName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">Account</Label>
            <div className="input input-sm">
              <Select value={form?.acct?.acctId?.toString() ?? ""} disabled>
                <SelectTrigger className="border-none bg-transparent p-0 text-left">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {acctList?.data?.map((item) => (
                    <SelectItem
                      value={item.acctId?.toString() ?? ""}
                      key={item.acctId}
                    >
                      {item.custName + `[${item.acctNbr}]`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">User Type</Label>
            <div className="input input-sm">
              <Input
                className="border-none p-0"
                readOnly
                value={form?.acct?.billingCycleTypeName ?? ""}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <div className="h-5 w-2 rounded-sm bg-primary" />
          <div>Service List</div>
        </div>
        <DataGridProvider
          columns={columns}
          pagination={{ size: 10 }}
          data={offer}
          layout={{ card: true }}
          sorting={[{ id: "offerId", desc: false }]}
          serverSide={false}
        />
      </div>
    </div>
  );
};

export default Steps2;
