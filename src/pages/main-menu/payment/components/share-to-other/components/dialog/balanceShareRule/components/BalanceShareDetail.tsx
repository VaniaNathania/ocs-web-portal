import { useMemo, useRef, useState } from "react";
import { BalanceShareDetailTable } from "../models/interfaces";
import { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { useShareToOther } from "../../../../hooks/context";
import { useBalShareRule } from "../hooks/context";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatAmount } from "@/pages/main-menu/order/user/menu/subscriber/components/general";
import { toast } from "sonner";

const ListToolBar = () => {
  const { form, setForm, error, subsSimple, AccBalList } = useBalShareRule();

  const AddDetail = () => {
    setForm((prev) => ({
      ...prev,
      balShare: {
        ...prev?.balShare,
        children: [
          {
            detailEffDate: "",
            detailExpDate: "",
            acctResName: "",
            balDesc: "",
            priority: "",
            operType: "A",
            balId: undefined,
            acctResId: undefined,
            subsId: subsSimple?.subsId,
          },
        ],
      },
    }));
  };

  return (
    <div className="flex flex-row gap-5 items-center p-5">
      <div>Balance Share Detail</div>
      <Button
        size={"sm"}
        disabled={
          !!error["balShare"] || (form?.balShare.children ?? []).length > 0
        }
        onClick={() => AddDetail()}
      >
        <KeenIcon icon="plus" />
        Add
      </Button>
    </div>
  );
};

const BalanceShareDetail = () => {
  const { selectedBal, setSelectedBal } = useShareToOther();
  const { form, setForm, error, AccResList, AccBalList, setError } =
    useBalShareRule();
  const [isEdit, setIsEdit] = useState(false);
  const [edit, setEdit] = useState<BalanceShareDetailTable>();
  const editRef = useRef<BalanceShareDetailTable | null>(null);

  const saveDetail = (row: BalanceShareDetailTable) => {
    const tempError: Record<string, string> = {};
    if (!row?.detailEffDate) tempError["detailEffDate"] = "required";
    if (row?.detailExpDate) {
      const eff = new Date(row.detailEffDate ?? "");
      const exp = new Date(row.detailExpDate);
      if (eff > exp) tempError["detailExpDate"] = "false";
    }
    if (Object.values(tempError).length > 0) {
      toast.error("Please fill the form correctly");
      return setError(tempError);
    }
    setForm((prev) => ({
      ...prev,
      balShare: {
        ...prev?.balShare,
        children: [{ ...row, priority: row?.priority?.toString() }],
      },
    }));
    setIsEdit(false);
  };

  const cancelDetail = () => {
    setEdit(undefined);
    setIsEdit(false);
  };

  const column = useMemo<ColumnDef<BalanceShareDetailTable>[]>(
    () => [
      {
        accessorFn: (row) => row.detailEffDate,
        id: "detailEffDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Effective Date"
            column={column}
          />
        ),
        cell: ({ row }) => {
          // if (isEdit) {
          return (
            <input
              className={`input input-sm disabled:cursor-not-allowed ${error["detailEffDate"] && "border-red-400"}`}
              defaultValue={row.original.detailEffDate ?? ""}
              onChange={(e) =>
                // setEdit((prev) => ({
                //   ...prev,
                //   detailEffDate: e.target.value,
                // }))
                (row.original.detailEffDate = e.target.value)
              }
              disabled={!isEdit}
              type="datetime-local"
            />
          );
          // }
          // return <div>{row.original.detailEffDate}</div>;
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.detailExpDate,
        id: "detailExpDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Expiry Date"
            column={column}
          />
        ),
        cell: ({ row }) => {
          // if (isEdit) {
          return (
            <input
              className={`input input-sm disabled:cursor-not-allowed ${error["detailExpDate"] && "border-red-400"}`}
              defaultValue={row.original.detailExpDate ?? ""}
              onChange={(e) =>
                // setEdit((prev) => ({
                //   ...prev,
                //   detailExpDate: e.target.value,
                // }))
                (row.original.detailExpDate = e.target.value)
              }
              disabled={!isEdit}
              type="datetime-local"
            />
          );
          // }
          // return <div>{row.original.detailExpDate}</div>;
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.acctResId,
        id: "acctResId",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Balance Type"
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className={`input input-sm`}>
              <Select
                defaultValue={row.original.acctResId?.toString() ?? ""}
                onValueChange={(e) => (row.original.acctResId = Number(e))}
                disabled={!isEdit}
              >
                <SelectTrigger className="border-none bg-transparent p-0">
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  {AccResList.data?.map((item) => (
                    <SelectItem
                      value={item.acctResId.toString()}
                      key={item.acctResId.toString()}
                    >
                      {item.acctResName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        // accessorFn: (row) => row.balId,
        id: "balDesc",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Balance Info"
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className={`input input-sm`}>
              <Select
                defaultValue={row.original.balId?.toString() ?? ""}
                onValueChange={(e) =>
                  // setEdit((prev) => ({
                  //   ...prev,
                  //   balId: Number(e),
                  // }))
                  (row.original.balId = Number(e))
                }
                disabled={!isEdit}
              >
                <SelectTrigger className="border-none bg-transparent p-0">
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  {AccBalList.data
                    ?.filter(
                      (item) =>
                        item.acctResId ===
                        (isEdit ? edit?.acctResId : row.original.acctResId),
                    )
                    .map((item) => (
                      <SelectItem
                        value={item.balId.toString()}
                        key={item.balId.toString()}
                      >
                        {item.acctResName}
                        {formatAmount(item.grossBal * -1)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.priority,
        id: "priority",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Priority" column={column} />
        ),
        cell: ({ row }) => {
          if (isEdit) {
            return (
              <div className="input input-sm">
                <Input
                  className="border-none p-0"
                  type="number"
                  min={0}
                  defaultValue={row.original.priority ?? ""}
                  onChange={(e) =>
                    // setEdit((prev) => ({
                    //   ...prev,
                    //   priority: Number(e.target.value),
                    // }))
                    (row.original.priority = Number(e.target.value))
                  }
                  size={"sm"}
                />
              </div>
            );
          }
          return <div>{row.original.priority}</div>;
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        // accessorFn: (row) => row.priority,
        id: "Action",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Action" column={column} />
        ),
        cell: ({ row }) => {
          if (isEdit) {
            return (
              <div>
                <Button
                  size={"sm"}
                  variant={"ghost"}
                  onClick={() => saveDetail(row.original)}
                >
                  <KeenIcon icon="check" />
                </Button>
                <Button
                  size={"sm"}
                  variant={"ghost"}
                  onClick={() => {
                    if (edit) {
                      row.original.detailEffDate = edit.detailEffDate;
                      row.original.detailExpDate = edit.detailExpDate;
                      row.original.acctResId = edit.acctResId;
                      row.original.balId = edit.balId;
                      row.original.priority = edit.priority;
                    }
                    cancelDetail();
                  }}
                >
                  <KeenIcon icon="cross" />
                </Button>
              </div>
            );
          }
          return (
            <div className="">
              <Button
                size={"sm"}
                variant={"ghost"}
                onClick={() => {
                  const temp = row.original;
                  setEdit({ ...temp });

                  setIsEdit(true);
                }}
              >
                <KeenIcon icon="notepad-edit" />
              </Button>
              <Button
                size={"sm"}
                variant={"ghost"}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    balShare: { ...prev?.balShare, children: [] },
                  }))
                }
              >
                <KeenIcon icon="trash" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [isEdit, edit, AccBalList, AccResList],
  );

  return (
    <DataGridProvider
      key={`resource-grid`}
      data={form?.balShare.children}
      toolbar={<ListToolBar />}
      columns={column}
      serverSide={false}
      layout={{ card: true }}
    />
  );
};

export default BalanceShareDetail;
