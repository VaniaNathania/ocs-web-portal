import { BuildFormRow } from "@/components/common/BuildFormRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWholesaleMonitor } from "../hooks/context";
import { KeenIcon } from "@/components";
import { useState } from "react";
import { WholesaleQuery } from "../models/interfaces";

const Query = () => {
  const {
    masterData,
    setShowOperator,
    setShowCustSearch,
    query,
    setQuery,
    tempQuery,
    setTempQuery,
  } = useWholesaleMonitor();

  return (
    <div className="grid grid-cols-3 gap-2 p-5 bg-white shadow-sm border-2 rounded-md">
      <BuildFormRow label="Batch No.">
        <div className="input input-sm">
          <Input
            size={"sm"}
            className="border-none"
            type="number"
            value={tempQuery?.wholesaleCode ?? ""}
            onChange={(e) =>
              setTempQuery((prev) => ({
                ...prev,
                wholesaleCode: e.target.value,
              }))
            }
          />
        </div>
      </BuildFormRow>
      <BuildFormRow label="Subscription Event">
        <div className="input input-sm">
          <Select
            value={tempQuery?.subsEventId?.toString() ?? ""}
            onValueChange={(e) =>
              setTempQuery((prev) => ({
                ...prev,
                subsEventId: Number(e),
              }))
            }
          >
            <SelectTrigger className="border-none bg-transparent p-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {masterData.data?.subsEvent.map((item) => (
                <SelectItem
                  value={item.subsEventId.toString() ?? ""}
                  key={item.subsEventId}
                >
                  {item.eventName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </BuildFormRow>

      <BuildFormRow label="State">
        <div className="input input-sm">
          <Select
            value={tempQuery?.state ?? ""}
            onValueChange={(e) => {
              //  console.log(e);

              setTempQuery((prev) => ({
                ...prev,
                state: e,
              }));
            }}
          >
            <SelectTrigger className="border-none bg-transparent p-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {masterData.data?.queryState.map((item) => (
                <SelectItem
                  value={item.value}
                  key={item.value}
                  onClick={() => console.log(item)}
                >
                  {item.lookupName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </BuildFormRow>
      {/* <BuildFormRow label="Operator">
        <div className="input input-sm">
          <Input size={"sm"} className="border-none" readOnly />
          <Button
            size={"sm"}
            variant={"ghost"}
            className="p-0 h-fit"
            onClick={() => {
              setShowOperator(true);
            }}
          >
            <KeenIcon icon="notepad-edit" />
          </Button>
        </div>
      </BuildFormRow> */}
      <BuildFormRow label="Created Time">
        <div className="flex flex-row gap-2 items-center w-full">
          <div className="input input-sm flex-1 overflow-x-auto scroll-ilang">
            <input
              // size={"sm"}
              type="datetime-local"
              className="border-none"
              value={tempQuery?.createDateFrom ?? ""}
              onClick={(e) => {
                e.currentTarget.showPicker?.(); // 👈 force open
              }}
              onChange={(e) =>
                setTempQuery((prev) => ({
                  ...prev,
                  createDateFrom: e.target.value,
                }))
              }
            />
          </div>
          <div className="">To</div>
          <div className="input input-sm flex-1 overflow-x-auto scroll-ilang">
            <input
              // size={"sm"}
              type="datetime-local"
              className="border-none"
              value={tempQuery?.createDateTo ?? ""}
              onClick={(e) => {
                e.currentTarget.showPicker?.(); // 👈 force open
              }}
              onChange={(e) =>
                setTempQuery((prev) => ({
                  ...prev,
                  createDateTo: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </BuildFormRow>
      <BuildFormRow label="Service Number">
        <div className="flex flex-row gap-2 items-center w-full">
          <div className="input input-sm">
            <Input
              size={"sm"}
              // type="datetime-local"
              className="border-none"
              value={tempQuery?.accNbrBegin ?? ""}
              onChange={(e) =>
                setTempQuery((prev) => ({
                  ...prev,
                  accNbrBegin: e.target.value,
                }))
              }
              onBlur={(e) =>
                setTempQuery((prev) => ({
                  ...prev,
                  accNbrEnd: e.currentTarget.value,
                }))
              }
            />
          </div>
          <div>To</div>
          <div className="input input-sm">
            <Input
              size={"sm"}
              // type="datetime-local"
              className="border-none"
              value={tempQuery?.accNbrEnd ?? ""}
              onChange={(e) =>
                setTempQuery((prev) => ({
                  ...prev,
                  accNbrEnd: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </BuildFormRow>
      <BuildFormRow label="Run Time">
        <div className="flex flex-row gap-2 items-center w-full">
          <div className="input input-sm flex-1 overflow-x-auto scroll-ilang">
            <input
              // size={"sm"}
              type="datetime-local"
              className="border-none"
              value={tempQuery?.executionDateFrom ?? ""}
              onClick={(e) => {
                e.currentTarget.showPicker?.(); // 👈 force open
              }}
              onChange={(e) =>
                setTempQuery((prev) => ({
                  ...prev,
                  executionDateFrom: e.target.value,
                }))
              }
            />
          </div>
          <div>To</div>
          <div className="input input-sm flex-1 overflow-x-auto scroll-ilang">
            <input
              // size={"sm"}
              type="datetime-local"
              className="border-none"
              onClick={(e) => {
                e.currentTarget.showPicker?.(); // 👈 force open
              }}
              value={tempQuery?.executionDateTo ?? ""}
              onChange={(e) =>
                setTempQuery((prev) => ({
                  ...prev,
                  executionDateTo: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </BuildFormRow>
      <BuildFormRow label="ICCID">
        <div className="flex flex-row gap-2 items-center w-full">
          <div className="input input-sm">
            <Input
              size={"sm"}
              // type="datetime-local"
              className="border-none"
              value={tempQuery?.iccidBegin ?? ""}
              onChange={(e) =>
                setTempQuery((prev) => ({
                  ...prev,
                  iccidBegin: e.target.value,
                }))
              }
            />
          </div>
          <div>To</div>
          <div className="input input-sm">
            <Input
              size={"sm"}
              // type="datetime-local"
              className="border-none"
              value={tempQuery?.iccidEnd ?? ""}
              onChange={(e) =>
                setTempQuery((prev) => ({
                  ...prev,
                  iccidEnd: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </BuildFormRow>
      <BuildFormRow label="Customer Name">
        <div className="input input-sm">
          <Input
            size={"sm"}
            className="border-none"
            readOnly
            value={tempQuery?.custName ?? ""}
          />
          <Button
            size={"sm"}
            variant={"ghost"}
            className="p-0 h-fit"
            onClick={() => {
              setShowCustSearch(true);
            }}
          >
            <KeenIcon icon="notepad-edit" />
          </Button>
        </div>
      </BuildFormRow>
      <div className="col-span-3 flex justify-end gap-2">
        <Button
          size={"sm"}
          onClick={() => {
            //  console.log("ini temp", tempQuery);

            setQuery(tempQuery);
          }}
        >
          Query
        </Button>
        <Button
          size={"sm"}
          onClick={() => {
            setTempQuery(undefined);
            setQuery(undefined);
          }}
          variant={"outline"}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default Query;
