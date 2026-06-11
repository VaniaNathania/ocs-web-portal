import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo } from "react";
import { useModSubs } from "../hooks/context";
import { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import { DPOfferOrderList } from "../model/interfaces";
import { TimeUnitMapSubsPlan } from "@/pages/main-menu/offer/bundleNew-offer/types/BundleTypes";
import { Button } from "@/components/ui/button";

const ModSubsStep2 = () => {
  // const { ownedOffer } = useSubscriberListContext();

  const {
    step,
    attrRec,
    setOffer,
    offer,
    ownedOffer,
    dpOfferAttrRec,
    allData,
    orderInfoForm,
  } = useModSubs();

  useEffect(() => {
    //  console.log("ini di step2");

    if (step != 1) return;
    //  console.log("ini owned offer", ownedOffer, dpOfferAttrRec);
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
            <Button
              size={"sm"}
              variant={"ghost"}
              // onClick={() =>
              // //  console.log(
              //     "ini row",
              //     data,
              //     dpOfferAttrRec[data.offerId + "#" + data.offerSeq],
              //   )
              // }
            >
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
            </Button>
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
        accessorFn: (row) => row.offerId,
        id: "offerId",
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
              {dpOfferAttrRec[data.offerId + "#" + data.offerSeq]?.map(
                (attr, index) => (
                  <div className="grid grid-cols-3" key={index}>
                    <div className=" truncate">
                      {attr.attrName ?? attr.attrId}
                    </div>
                    <div className=" truncate">
                      {attr.valueMark ?? attr.attrValue ?? attr.value}
                    </div>
                    <div className=" truncate">
                      {attr.oldValueMark ?? attr.oldValue}
                    </div>
                  </div>
                ),
              )}
            </div>
          );
        },
      },
    ],
    [offer, dpOfferAttrRec],
  );

  return (
    <div className="flex flex-col gap-5 p-5 ">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ">
        <div className="flex flex-row items-center gap-2 col-span-1 sm:col-span-2 lg:col-span-3">
          <div className="h-5 w-2 rounded-sm bg-primary" />
          <div>Offer Information</div>
        </div>
        <BuildFormRow label="Subscription Plan">
          <Input
            size={"sm"}
            className="input input-sm"
            disabled
            defaultValue={allData?.orderItemList[0].subsPlanName}
          />
        </BuildFormRow>
        <BuildFormRow label="Order Number">
          <Input
            size={"sm"}
            className="input input-sm"
            disabled
            defaultValue={allData?.orderItemList[0].orderId}
          />
        </BuildFormRow>
        <BuildFormRow label="Service Number">
          <Input
            size={"sm"}
            className="input input-sm"
            disabled
            defaultValue={allData?.orderItemList[0].accNbr}
          />
        </BuildFormRow>
        <BuildFormRow label="Payment Account">
          <Input
            size={"sm"}
            className="input input-sm"
            disabled
            defaultValue={allData?.orderItemList[0].acctId}
          />
        </BuildFormRow>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-5 col-span-1 sm:col-span-2 lg:col-span-3">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ">
        <div className="flex flex-row items-center gap-2 col-span-1 sm:col-span-2 lg:col-span-3">
          <div className="h-5 w-2 rounded-sm bg-primary" />
          <div>Offer Information</div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Label className="w-32">Reservation Time</Label>
          <input
            className="input input-sm flex-1 disabled:cursor-not-allowed"
            type="date"
            disabled
            defaultValue={orderInfoForm?.bespAddress}
          />
        </div>
        <div className="flex flex-row items-center gap-2">
          <Label className="w-32">Remarks</Label>
          <div className="input input-sm flex-1">
            <Input
              className="border-none"
              disabled
              defaultValue={orderInfoForm?.comments}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModSubsStep2;
