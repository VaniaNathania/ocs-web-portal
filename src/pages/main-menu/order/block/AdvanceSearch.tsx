import React, {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DialogWrapper } from "../../role-management/generalUseComp";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { useNavigate } from "react-router";
import { useOrder } from "../hooks/orderContext";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { CustomerInfo } from "../models/interfaces";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loading } from "../../role-management/block/loadingBlock";

interface props {
  isOpen: boolean;
  handleDialog: (open: boolean) => void;
}

export interface Payload {
  custType?: string;
  custName?: string;
  accNbr?: string;
  certTypeId?: number;
  certNbr?: string;
  iccid?: string;
  acctNbr?: string;
  contactMan?: string;
  isEscape?: number;
  qryTermination?: number;
}

const API_ORDER = apiConfigOrder.order;

const defaultPayload: Payload = {
  isEscape: 0,
  qryTermination: 0,
};

const AdvanceSearchDialog = ({ isOpen, handleDialog }: props) => {
  const [selectedRow, setSelectedRow] = useState<CustomerInfo>();
  const { PostData } = useCallApi();
  const { searchResult, fetchSearch, setSelectedUser, orderUseQuery } =
    useOrder();
  const [form, setForm] = useState<Payload>(defaultPayload);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setUser = async () => {
    if (!selectedRow) return toast.error("Please select the user first");

    setSelectedUser(selectedRow);
  };

  const fetchInitialDataUseQuery = async (): Promise<CustomerInfo[]> => {
    setIsLoading(true);
    try {
      if (form === defaultPayload) return [];

      const payload: Payload = {
        ...form,
      };

      const resp = await PostData(
        `${API_ORDER}/api/order-entry/custommer/cust-query-cond`,
        payload,
      );

      if (!resp?.status) {
        toast.error(resp?.message);
        return [];
      }

      return resp.data;
    } catch (error) {
      toast.error(String(error));
      return [];
    }
  };

  const AdvInfoUseQuery: UseQueryResult<CustomerInfo[]> = useQuery({
    queryKey: ["advance-data"],
    queryFn: fetchInitialDataUseQuery,
    staleTime: 1000 * 60 * 10, // 10 minutes (master data rarely changes)
  });

  const column = useMemo<ColumnDef<CustomerInfo>[]>(
    () => [
      {
        accessorFn: (row) => row.custName,
        id: "custName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Customer Name" column={column} />
        ),

        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.certTypeName,
        id: "certTypeName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Doc Type" column={column} />
        ),

        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.certNbr,
        id: "certNbr",
        header: ({ column }) => (
          <DataGridColumnHeader title="Doc Number" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },
    ],
    [searchResult, selectedRow],
  );

  useEffect(() => {
    if (isOpen) fetchSearch();
  }, [isOpen]);

  return (
    <DialogWrapper
      isOpen={isOpen}
      //   onClose={() => handleDialog(false)}
      title="Search Customer"
      size={{ width: "4xl", height: "600px" }}
      handleDialog={handleDialog}
    >
      <div className="flex flex-col m-5 gap-2">
        {isLoading && <Loading />}
        <div className="grid grid-cols-2 gap-2">
          <div className=" flex flex-row items-center">
            <Label className="w-1/4">Customer Name</Label>
            <Input
              className="flex-1"
              size={"sm"}
              value={form?.custName ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, custName: e.target.value }))
              }
            />
          </div>
          <div className=" flex flex-row items-center gap-5">
            <Input
              type="checkbox"
              className="w-[15px]"
              size={"sm"}
              checked={form?.isEscape === 1}
              onChange={() =>
                setForm((prev) => ({
                  ...prev,
                  isEscape: prev?.isEscape === 0 ? 1 : 0,
                }))
              }
            />
            <Label>Use Wild Card Character</Label>
          </div>
          <div className=" flex flex-row items-center">
            <Label className="w-1/4">Service Number</Label>
            <Input
              className="flex-1"
              size={"sm"}
              value={form?.accNbr ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, accNbr: e.target.value }))
              }
            />
          </div>
          <div className=" flex flex-row items-center gap-5">
            <Input
              type="checkbox"
              className="w-[15px]"
              size={"sm"}
              checked={form?.qryTermination === 1}
              onChange={() =>
                setForm((prev) => ({
                  ...prev,
                  qryTermination: prev?.qryTermination === 0 ? 1 : 0,
                }))
              }
            />
            <Label>Query Termination User</Label>
          </div>
          <div className=" flex flex-row items-center">
            <Label className="w-1/4">Doc Type</Label>
            <Select
              onValueChange={(e) => {
                if (!setForm) return;

                setForm((prev) => ({ ...prev, certTypeId: parseInt(e) }));
              }}
              value={
                form?.certTypeId?.toString() !== "0"
                  ? form?.certTypeId?.toString()
                  : ""
              }
            >
              <div className="input input-sm flex-1">
                <SelectTrigger
                  className="flex-1 border-none bg-transparent p-0"
                  size="sm"
                >
                  <SelectValue placeholder="Select Document Type" />
                </SelectTrigger>
                {form?.certTypeId && (
                  <Button
                    size={"sm"}
                    variant={"ghost"}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, certTypeId: undefined }))
                    }
                  >
                    <KeenIcon icon="cross" />
                  </Button>
                )}
              </div>
              <SelectContent>
                {orderUseQuery.data?.certType.map((item) => (
                  <SelectItem
                    key={item.certTypeId?.toString()}
                    value={item.certTypeId?.toString()}
                  >
                    {item.certTypeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className=" flex flex-row items-center">
            <Label className="w-1/4">Doc Number</Label>
            <Input className="flex-1" size={"sm"} />
          </div>
          <div className=" flex flex-row items-center">
            <Label className="w-1/4">ICCID</Label>
            <Input
              className="flex-1"
              size={"sm"}
              value={form?.iccid ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, iccid: e.target.value }))
              }
            />
          </div>
          <div className=" flex flex-row items-center">
            <Label className="w-1/4">Account Number</Label>
            <Input
              className="flex-1"
              size={"sm"}
              value={form?.acctNbr ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, acctNbr: e.target.value }))
              }
            />
          </div>
          <div className=" flex flex-row items-center">
            <Label className="w-1/4">Contact Man Name</Label>
            <Input
              className="flex-1"
              size={"sm"}
              value={form?.contactMan ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, contactMan: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="w-full flex flex-row gap-2 justify-end">
          <Button size={"sm"} onClick={() => AdvInfoUseQuery.refetch()}>
            Query
          </Button>
          <Button
            size={"sm"}
            variant={"outline"}
            onClick={() => {
              setForm(defaultPayload);
              AdvInfoUseQuery.refetch();
            }}
          >
            Reset
          </Button>
        </div>
        <div className="">
          {/* {(isLoading || isExpanding) && <Loading />} */}
          <DataGridProvider
            // key={`available-features-grid-${search}`}
            columns={column}
            pagination={{ size: 5 }}
            layout={{ card: false }}
            sorting={[{ id: "custName", desc: false }]}
            serverSide={false}
            data={AdvInfoUseQuery.data}
            getRowProps={(row) => ({
              className:
                row.original.custId === selectedRow?.custId
                  ? selectedRowHighLight
                  : nonSelectedRowHighLight,
              onClick: () => setSelectedRow(row.original),
            })}
          >
            {/* <div className="h-[450px] overflow-y-auto w-full border-2">
                      <DataGridTable />
                    </div> */}
          </DataGridProvider>
        </div>
        <div className="flex flex-row justify-end gap-2">
          <Button onClick={setUser} size={"sm"}>
            Ok
          </Button>
          <Button
            onClick={() => handleDialog(false)}
            size={"sm"}
            variant={"outline"}
          >
            Cancel
          </Button>
        </div>
      </div>
    </DialogWrapper>
  );
};

export default AdvanceSearchDialog;
