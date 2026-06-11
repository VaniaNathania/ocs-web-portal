import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import { useOrderForm } from "../hooks/context";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DataGridProvider, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import {
  AccNbrExDto,
  ChooseNbrDto,
  NumberDialogForm,
} from "../models/interfaces";
import { apiConfigOrder } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useOrderShop } from "../../../hooks/shopContext";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";

const API_ORDER = apiConfigOrder.order;

const NumberDialog = () => {
  const { showNumber, setShowNumber, setForm } = useOrderForm();
  const { selectedUser } = useOrder();
  const { selectedTableItem } = useOrderShop();
  const [dForm, setDForm] = useState<ChooseNbrDto>();
  const { PostData } = useCallApi();
  const [selectedRow, setSelectedRow] = useState<AccNbrExDto>();

  const fetchInitialDataUseQuery = async (): Promise<AccNbrExDto[]> => {
    const payload: ChooseNbrDto = {
      ...dForm,
      nbrMaxQty: 30,
      servType: selectedTableItem?.servType,
      indepProdSpecId: selectedTableItem?.indepProdSpecId,
      custId: selectedUser?.custId, // error kalau pake
      bindFlag: "B",
    };

    const resp = await PostData(
      `${API_ORDER}/api/order-entry/acct/qry-acc-nbr`,
      payload,
    );

    if (!resp?.status) {
      toast.error(resp?.message);
      return [];
    }

    return resp.data;
  };

  const NumInfoUseQuery: UseQueryResult<AccNbrExDto[]> = useQuery({
    queryKey: ["number-data"],
    queryFn: fetchInitialDataUseQuery,
    staleTime: 1000 * 60 * 10, // 10 minutes (master data rarely changes)
  });

  const columns = useMemo<ColumnDef<AccNbrExDto>[]>(
    () => [
      {
        accessorFn: (row) => row.accNbr,
        accessorKey: "accNbr",
        header: "Service Number",
      },
      {
        accessorFn: (row) => row.accNbrClassName,
        accessorKey: "accNbrClassName",
        header: "Number Grade",
      },
      {
        accessorFn: (row) => row.accNbrPrice,
        accessorKey: "accNbrPrice",
        header: "Service Number Fee",
      },
    ],
    [NumInfoUseQuery],
  );

  const setUser = async () => {
    if (!selectedRow) return toast.error("Please select the user first");

    setForm((prev) => ({ ...prev, simCardId: selectedRow.simCardId }));
    setShowNumber(false);
  };

  return (
    <DialogWrapper
      isOpen={showNumber}
      handleDialog={setShowNumber}
      title="Select Number"
    >
      <div className="flex flex-col gap-5 pt-5 text-xs">
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">Number Grade</Label>
            <div className="input input-sm  flex-1">
              <Select>
                <SelectTrigger className="border-none bg-transparent p-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent></SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">Number Rule</Label>

            <div className="input input-sm flex-1 flex items-center justify-between relative">
              <Input className="border-none p-0 flex-1" value={dForm?.rules} />

              <div className="relative group">
                <KeenIcon icon="question-2" className="cursor-pointer" />

                {/* Tooltip */}
                <div className="absolute right-0 mt-2  p-3 text-sm text-primary bg-primary-clarity rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:w-80 group-hover:h-80 hidden group-hover:block transition-all z-50">
                  <p className="font-semibold mb-1">Rule Description:</p>
                  <p>
                    1. Accurate service number match
                    <br />
                    e.g. 239 will match service number which ends with 239.
                  </p>
                  <p className="mt-2">
                    2. Alphabet Expression match
                    <br />
                    e.g. ABC will match service number which ends with like 123,
                    234, 789 etc.
                    <br />
                    AACCAA will match service number which ends with like
                    113311, 335533 etc.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">Service Number From</Label>
            <div className="input input-sm flex-1">
              <Input
                className="border-none p-0"
                value={dForm?.accNbrStart}
                onChange={(e) =>
                  setDForm((prev) => ({ ...prev, accNbrStart: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">To</Label>
            <div className="input input-sm flex-1">
              <Input
                className="border-none p-0"
                value={dForm?.accNbrEnd}
                onChange={(e) =>
                  setDForm((prev) => ({ ...prev, accNbrEnd: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">Service Number Fee From</Label>
            <div className="input input-sm flex-1">
              <Input
                className="border-none p-0"
                type="number"
                min={0}
                value={dForm?.accNbrPriceStart}
                onChange={(e) =>
                  setDForm((prev) => ({
                    ...prev,
                    accNbrPriceStart: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">To</Label>
            <div className="input input-sm flex-1">
              <Input
                className="border-none p-0"
                type="number"
                min={0}
                value={dForm?.accNbrPriceEnd}
                onChange={(e) =>
                  setDForm((prev) => ({
                    ...prev,
                    accNbrPriceEnd: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">Reservation By</Label>
            <div className="flex-1 flex flex-row gap-2">
              <label className="flex items-center gap-2">
                <Input
                  type="checkbox"
                  // disabled={disable}
                  checked={dForm?.reserveType === "S"}
                  onChange={() => {
                    if (dForm?.reserveType !== "S")
                      setDForm((prev) => ({ reserveType: "S" }));
                    else setDForm((prev) => ({ reserveType: undefined }));
                  }}
                  className="w-[15px] h-[15px] accent-primary"
                />
                <span>Staff</span>
              </label>
              <label className="flex items-center gap-2">
                <Input
                  type="checkbox"
                  // disabled={disable}
                  checked={dForm?.reserveType === "CC"}
                  onChange={() => {
                    if (dForm?.reserveType !== "CC")
                      setDForm((prev) => ({ reserveType: "CC" }));
                    else setDForm((prev) => ({ reserveType: undefined }));
                  }}
                  className="w-[15px] h-[15px] accent-primary"
                />
                <span>Customer</span>
              </label>
              <label className="flex items-center gap-2">
                <Input
                  type="checkbox"
                  // disabled={disable}
                  checked={dForm?.reserveType === "P"}
                  onChange={() => {
                    if (dForm?.reserveType !== "P")
                      setDForm((prev) => ({ reserveType: "P" }));
                    else setDForm((prev) => ({ reserveType: undefined }));
                  }}
                  className="w-[15px] h-[15px] accent-primary"
                />
                <span>Password</span>
              </label>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">Termination</Label>
            <Input
              type="checkbox"
              // disabled={disable}
              checked={dForm?.terminationFlag === "Y"}
              onChange={() => {
                if (dForm?.terminationFlag)
                  setDForm((prev) => ({ terminationFlag: undefined }));
                else setDForm((prev) => ({ terminationFlag: "Y" }));
              }}
              className="w-[15px] h-[15px] accent-primary"
            />
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">Maximum Quantity</Label>
            <div className="input input-sm flex-1">
              <Input className="border-none p-0" disabled defaultValue={30} />
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-end">
          <div className="flex flex-row gap-2">
            <Button
              size={"sm"}
              onClick={() => {
                NumInfoUseQuery.refetch();
              }}
            >
              Query
            </Button>
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => {
                setDForm(undefined);
                NumInfoUseQuery.refetch();
              }}
            >
              Reset
            </Button>
          </div>
        </div>
        <div>
          <DataGridProvider
            key={`order-list-detail`}
            layout={{ card: true }}
            columns={columns}
            serverSide={false}
            rowSelection={true}
            data={NumInfoUseQuery.data}
            getRowProps={(row) => ({
              className:
                row.original.simCardId === selectedRow?.simCardId
                  ? selectedRowHighLight
                  : nonSelectedRowHighLight,
              onClick: () => setSelectedRow(row.original),
            })}
          />
        </div>
        <div className="flex flex-row justify-end gap-2">
          <Button onClick={setUser} size={"sm"}>
            Ok
          </Button>
          <Button
            onClick={() => setShowNumber(false)}
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

export default NumberDialog;
