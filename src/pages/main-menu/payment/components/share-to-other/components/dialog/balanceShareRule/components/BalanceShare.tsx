import { BuildFormRow } from "@/components/common/BuildFormRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShareToOther } from "../../../../hooks/context";
import { useBalShareRule } from "../hooks/context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { OperationType } from "../models/type";
import { usePayment } from "@/pages/main-menu/payment/hooks/PaymentContext";

const API_URL = apiConfig.service_payment;

const BalanceShare = () => {
  const { selectedBal, setSelectedBal } = useShareToOther();
  const {
    form,
    setForm,
    setDefault,
    error,
    setError,
    setSubsSimple,
    checkNumber,
  } = useBalShareRule();
  const { webRechargeUseQuery } = usePayment();
  const [disable, setDisable] = useState<boolean>(true);
  const { GetData } = useCallApi();

  const shareType = [
    {
      value: "A",
      valueName: "All Time Rules",
    },
    {
      value: "B",
      valueName: "Working Time Rules",
    },
    {
      value: "C",
      valueName: "Fixed Time Periods Rules",
    },
  ];

  const checkNumberSubmit = async () => {
    try {
      const check = await checkNumber();
      if (!check.status) {
        return;
      }
      setDisable(true);
    } catch (error) {}
  };
  return (
    <div className="grid grid-cols-3 gap-5">
      <div className="col-span-3">Balance Share</div>
      <BuildFormRow label="Prefix" isRequired>
        <div className="flex flex-col flex-1">
          <div
            className={`input input-sm ${error["prefix"] && "border-red-400"}`}
          >
            <Input
              disabled={disable}
              className={`border-none p-0 `}
              type="number"
              min={0}
              value={form?.balShare.prefix ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  balShare: { ...prev?.balShare, prefix: e.target.value },
                }))
              }
              size={"sm"}
            />
          </div>
          {/* {error["prefix"] && (
            <div className="text-xs text-red-500">{error["prefix"]}</div>
          )} */}
        </div>
      </BuildFormRow>
      <BuildFormRow label="Number" isRequired>
        <div
          className={`input input-sm ${error["accNbr"] && "border-red-400"}`}
        >
          <Input
            disabled={disable}
            className="border-none p-0"
            value={form?.balShare.accNbr ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                balShare: { ...prev?.balShare, accNbr: e.target.value },
              }))
            }
            size={"sm"}
          />
        </div>
      </BuildFormRow>
      <BuildFormRow label="Cycle Upper Limit">
        <div className="input input-sm">
          <Input
            disabled={disable}
            className="border-none p-0"
            type="number"
            min={0}
            value={
              form?.balShare.ceilLimit
                ? form?.balShare.ceilLimit > 0
                  ? form?.balShare.ceilLimit
                  : ""
                : ""
            }
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                balShare: {
                  ...prev?.balShare,
                  ceilLimit: Number(e.target.value),
                },
              }))
            }
            size={"sm"}
          />
        </div>
      </BuildFormRow>
      <BuildFormRow label="Daily Upper Limit">
        <div className="input input-sm">
          <Input
            disabled={disable}
            className="border-none p-0"
            type="number"
            min={0}
            value={
              form?.balShare.dailyCeilLimit
                ? form?.balShare.dailyCeilLimit > 0
                  ? form?.balShare.dailyCeilLimit
                  : ""
                : ""
            }
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                balShare: {
                  ...prev?.balShare,
                  dailyCeilLimit: Number(e.target.value),
                },
              }))
            }
            size={"sm"}
          />
        </div>
      </BuildFormRow>
      <BuildFormRow label="Effective Date" isRequired>
        <input
          disabled={disable}
          className={`input input-sm disabled:cursor-not-allowed ${error["effDate"] && "border-red-400"}`}
          value={form?.balShare.effDate ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              balShare: {
                ...prev?.balShare,
                effDate: e.target.value,
              },
            }))
          }
          type="datetime-local"
        />
      </BuildFormRow>
      <BuildFormRow label="Expiry Date">
        <input
          disabled={disable}
          className={`input input-sm disabled:cursor-not-allowed ${error["expDate"] && "border-red-400"}`}
          value={form?.balShare.expDate ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              balShare: {
                ...prev?.balShare,
                expDate: e.target.value,
              },
            }))
          }
          type="datetime-local"
        />
      </BuildFormRow>
      <BuildFormRow label="Payment Force" isRequired>
        <div
          className={`input input-sm ${error["paymentForce"] && "border-red-400"}`}
        >
          <Select
            value={form?.balShare?.paymentForce ?? ""}
            onValueChange={(e) =>
              setForm((prev) => ({
                ...prev,
                balShare: { ...prev?.balShare, paymentForce: e },
              }))
            }
            disabled={disable}
          >
            <SelectTrigger className="border-none bg-transparent p-0">
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"Y"} key={"Y"}>
                Yes
              </SelectItem>
              <SelectItem value={"N"} key={"N"}>
                No
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </BuildFormRow>
      <BuildFormRow label="Share Type">
        <div className="input input-sm flex-1">
          <Select
            value={form?.balShare?.shareType ?? ""}
            onValueChange={(e) =>
              setForm((prev) => ({
                ...prev,
                balShare: { ...prev?.balShare, shareType: e },
              }))
            }
            disabled={disable}
          >
            <SelectTrigger className="border-none bg-transparent p-0">
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>
            <SelectContent>
              {shareType.map((item) => (
                <SelectItem value={item.value} key={item.value}>
                  {item.valueName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </BuildFormRow>
      <BuildFormRow label="Owner DN">
        <div className="input input-sm flex-1">
          <Select
            disabled={disable}
            value={form?.balShare?.ownerSubsId?.toString() ?? ""}
            onValueChange={(e) =>
              setForm((prev) => ({
                ...prev,
                balShare: { ...prev?.balShare, ownerSubsId: Number(e) },
              }))
            }
          >
            <SelectTrigger className="border-none bg-transparent p-0">
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>
            <SelectContent>
              {webRechargeUseQuery?.data?.subsList.map((item) => (
                <SelectItem value={item.subsId.toString()} key={item.subsId}>
                  {item.accNbr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </BuildFormRow>
      {disable ? (
        <div className="col-span-3 flex justify-end gap-2">
          {!form?.balShare.balShareId && (
            <Button
              size={"sm"}
              onClick={() => {
                setDisable(false);
                setDefault(
                  (form?.balShare.processType as OperationType) ?? "ADD",
                );
              }}
            >
              New
            </Button>
          )}
          <Button
            size={"sm"}
            variant={"outline"}
            onClick={() => setDisable(false)}
          >
            Edit
          </Button>
        </div>
      ) : (
        <div className="col-span-3 flex justify-end gap-2">
          <Button
            size={"sm"}
            onClick={() => {
              checkNumberSubmit();
            }}
          >
            Submit
          </Button>
          <Button
            size={"sm"}
            variant={"outline"}
            onClick={() => {
              setDefault(
                (form?.balShare.processType as OperationType) ?? "ADD",
              );
              setDisable(true);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default BalanceShare;
