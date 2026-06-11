import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { OfferApply } from "../../../interface";
import { useOfferApply } from "../hooks/context";
import { useLifeCycle } from "../../../hooks/context";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";

const API_URL = apiConfigRef.ref;

const Main = () => {
  const { setShowConfirm, setOnConfirm, setDesc, selectedLifeCycle } =
    useLifeCycle();
  const { setDialogOpen, ownedMain, setRefresh, isLoading } = useOfferApply();
  const [idToDelete, setIdToDelete] = useState<string>("");
  const { PostData } = useCallApi();
  const columns = useMemo<ColumnDef<OfferApply>[]>(
    () => [
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
        accessorFn: (row) => row.offerTypeName,
        id: "offerTypeName",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Offer Type" />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const data = row.original;
          return <div>{data.offerTypeName}</div>;
        },
      },
      {
        accessorFn: (row) => row.offerId,
        id: "offerId",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Operation" />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const data = row.original;

          return (
            <div className="flex flex-row gap-2 items-center justify-center">
              <Button
                className="w-[20px] h-[20px] p-1"
                variant={"ghost"}
                onClick={() => handleSave(data.offerId.toString())}
              >
                <KeenIcon icon="trash" />
              </Button>
            </div>
          );
        },
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center ",
        },
      },
    ],
    [],
  );
  const ownedMainRef = useRef(ownedMain);

  useEffect(() => {
    ownedMainRef.current = ownedMain;
  }, [ownedMain]);
  const handleSave = (offerId: string) => {
    //  console.log(offerId, "di handle");

    // setIdToDelete(offerId);
    setShowConfirm(true);
    setDesc(`apply selected over into lifecycle?`);
    setOnConfirm(() => () => onSave(offerId));
  };

  const onSave = useCallback(
    async (offerId: string) => {
      // console.log("owned", owned);
      // console.log("available", available);
      //  console.log(offerId, "di onsave", ownedMain);

      try {
        const payload = {
          lifecycleType: selectedLifeCycle?.lifeCycleType.toString(),
          spId: 0,
          lifecycleApplyList: ownedMainRef.current
            .filter((own) => own.offerId.toString() !== offerId)
            .map((own) => ({ offerId: own.offerId.toString() })),
        };
        //  console.log(payload);

        const resp = await PostData(
          `${API_URL}/api/lifecycle-type/AddLifecycleApplyBatch`,
          payload,
        );

        if (resp?.status) {
          toast.success(resp.message);
          return setDialogOpen(false);
        }
        toast.error(resp?.message);
      } catch (error) {
      } finally {
        setRefresh((prev) => prev + 1);
        setShowConfirm(false);
      }
    },
    [ownedMain],
  );
  return (
    <div className="p-2 flex flex-col gap-2 relative">
      <div className="flex flex-row gap-2">
        <Button size={"sm"} onClick={() => setDialogOpen(true)}>
          Add Offer
        </Button>
        <Button
          size={"sm"}
          variant={"outline"}
          onClick={() => setRefresh((prev) => prev + 1)}
        >
          <KeenIcon icon="arrows-circle" />
        </Button>
      </div>
      <DataGridProvider
        columns={columns}
        pagination={{ size: 10 }}
        data={ownedMain}
        layout={{ card: true }}
        sorting={[{ id: "offerId", desc: false }]}
        serverSide={false}
      />
      {isLoading && <Loading />}
    </div>
  );
};

export default Main;
