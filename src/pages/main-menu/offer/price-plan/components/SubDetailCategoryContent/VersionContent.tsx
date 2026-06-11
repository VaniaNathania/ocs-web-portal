import React, { useState, useMemo, useCallback, useEffect } from "react";
// import { Plus, Edit2, Trash2, Search } from "lucide-react";
import {
  DataGridColumnHeader,
  DataGridProvider,
  DefaultTooltip,
  KeenIcon,
  Alert,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
// import AddFeatureDialog from "../../blocks/AddFeatureDialog";
// import CopyFromFeatureDialog from "../../blocks/CopyFromFeatureDialog";
// import  Feature  from "../../blocks/AddFeatureDialog";
// import { useNavigate } from "react-router";
import EditDialogVersion from "../../blocks/EditDialogVersion";
import AddVersionDialog from "../../blocks/AddVersionDialog";
// import Swal from "sweetalert2";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useOfferLayout } from "@/layouts/main-menu/offer";

interface VersionContentProps {
  offername: string;
  offerid: number;
  applylevel: string | null;
  onOpenPortal?: (offerVerId: number, dataPricePlan: any) => void;
}

interface PricePlanVersion {
  pricePlanVerId: number;
  pricePlanId: number;
  effDate: string;
  expDate: string | null;
  seq: number;
  state: string;
  refOfferVerId: number | null;
}

const API_URL_OFFER = apiConfigOffer.offer;

const VersionContent: React.FC<VersionContentProps> = ({
  offername,
  offerid,
  applylevel,
  onOpenPortal,
}) => {
  const {menuPrivAccess} = useOfferLayout()
  // console.log(offername)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogEditOpen, setIsDialogEditOpen] = useState(false);
  const [isDialogAddOpen, setIsDialogAddOpen] = useState(false);
  const [versionList, setVersionList] = useState<PricePlanVersion[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [versioneffdate, setversioneffdate] = useState<string | undefined>("");
  const [versionexpdate, setversionexpdate] = useState<string | undefined>("");
  const [idDelete, setIdDelete] = useState<number | undefined>(undefined);
  const [loading, setIsLoading] = useState(false);
  const [sequence, setSequence] = useState("");
  const [refofferverid, setrefofferverid] = useState(0);
  const [state, setstate] = useState("");
  const { GetData, DeleteData } = useCallApi();
  const navigate = useNavigate();

  const handleDeleteClick = (
    versioneffdate: string | undefined,
    versionexpdate: string | undefined,
    id: number,
  ) => {
    setversioneffdate(versioneffdate);
    setversionexpdate(versionexpdate);
    setIdDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await DeleteData(
        `${API_URL_OFFER}/offer/price-plan/del-price-plan-ver/${idDelete}`,
        idDelete,
      );

      //  console.log("ini resp pp", response);

      // Perbaikan: Explicit undefined check
      if (response?.status === false) {
        toast.error(response?.message);
      } else toast.success("Version deleted successfully");
    } catch (error: any) {
      console.error("Error delete version:", error);
      toast.error(error?.message || "Failed to delete version data");
    } finally {
      setRefreshKey((prev) => prev + 1);
      setIsDeleteModalOpen(false);
      setIsLoading(false);
    }
  };

  const getVersionList = async (offerid: number) => {
    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/price-plan/qry-price-plan-ver-list-by-price-plan-id`,
        { pricePlanId: offerid },
      );
      if (response?.data) {
        // console.log(response.data);
        setVersionList(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching version list:", error);
      toast.error("Error fetching version data");
    }
  };

  useEffect(() => {
    if (offerid) {
      getVersionList(offerid);
    }
  }, [offerid, refreshKey]);

  const handleAddDialog = () => {
    setIsDialogAddOpen(true);
  };

  const handleCloseAddDialog = () => {
    setIsDialogAddOpen(false);
  };

  const handleAddFeature = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleDialogEdit = () => {
    setIsDialogEditOpen(true);
  };

  const handleCloseDialogEdit = () => {
    setIsDialogEditOpen(false);
  };

  const handleRefreshAfterAdd = useCallback(() => {
    setRefreshKey((prev) => prev + 1); // Increment refresh key untuk trigger re-fetch
  }, []);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "sequence",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Sequence" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: "w-2/12", cellClassName: "w-2/12" },
        cell: ({ row }) => <p>{row.original.sequence || "-"}</p>,
      },
      {
        id: "version",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Version" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: "w-2/12", cellClassName: "w-2/12" },
        // cell: ({ row }) => <p>{row.original.versioneffdate || "-"} - {row.original.versionexpdate || "-"}</p>,
        cell: (data: any) => {
          const rowdata = {
            pricePlanId: offerid,
            pricePlanName: offername,
            applyLevel: applylevel,
          };
          // console.log(rowdata);
          return (
            <div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();

                  const rowdata = {
                    pricePlanId: offerid,
                    pricePlanName: offername,
                    applyLevel: applylevel,
                  };

                  if (onOpenPortal) {
                    onOpenPortal(data.row.original.id, rowdata);
                  } else {
                    const offerPageState = {
                      offername,
                      offerid,
                      applylevel,
                    };

                    navigate("/main/price-plan/portal/usage-price", {
                      state: {
                        from: "offer",
                        dataPricePlan: rowdata,
                        offerPageState,
                      },
                    });
                  }
                }}
                className="text-blue-600 hover:underline"
              >
                {data.row.original.versioneffdate || "-"} -{" "}
                {data.row.original.versionexpdate || "-"}
              </a>
            </div>
          );
        },
      },
      {
        id: "remarks",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Remarks" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: "w-2/12", cellClassName: "w-2/12" },
        cell: ({ row }) => <p>{row.original.remarks || "-"}</p>,
      },
      {
        id: "operation",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Actions"
            className="text-center"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/12 text-center",
          cellClassName: "w-1/12 text-center",
        },
        cell: (data: any) => {
          const {
            versioneffdate,
            versionexpdate,
            id,
            sequence,
            refofferverid,
            state,
          } = data.row.original;
          return (
            <div className="flex gap-2 justify-center">
              <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  handleDialogEdit();
                  setIdDelete(id);
                  setversioneffdate(versioneffdate);
                  setversionexpdate(versionexpdate);
                  setSequence(sequence);
                  setrefofferverid(refofferverid);
                  setstate(state);
                }}
                title="View Details"
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus }>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                title="Delete"
                onClick={() =>
                  handleDeleteClick(versioneffdate, versionexpdate, id)
                }
              >
                <KeenIcon icon="trash" />
              </button>
              </AccessWrapper>
            </div>
          );
        },
      },
    ],
    [],
  );

  const VersionToolbar = () => (
    <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-between item-center p-4">
      <div className="flex gap-3">
        <AccessWrapper hasAccess={menuPrivAccess?.addStatus} enabledText="New">
          <Button variant="default" className="h-7.5" onClick={handleAddDialog}>
            + Add
          </Button>
        </AccessWrapper>
        

        {/* <DefaultTooltip title="Refresh" placement="top">
          <Button
            variant="outline"
            className="h-7.5"
            // onClick={() => reload()}
          >
            <KeenIcon icon="arrows-circle" />
          </Button>
        </DefaultTooltip> */}
      </div>
    </div>
  );

  return (
    <div className="items-center w-full container-fixed mt-5">
      <div className="space-y-6 mt-5">
        <AddVersionDialog
          isOpen={isDialogAddOpen}
          onClose={handleCloseAddDialog}
          offerid={offerid}
          onSuccess={handleRefreshAfterAdd}
        />
        <DataGridProvider
          key={versionList.length}
          columns={columns}
          pagination={{ size: 10 }}
          toolbar={<VersionToolbar />}
          layout={{ card: true }}
          sorting={[{ id: "created_date", desc: false }]}
          serverSide={false} // Ubah ke false
          data={versionList
            .sort(
              (a, b) =>
                new Date(b.effDate).getTime() - new Date(a.effDate).getTime(),
            )
            .map((item, index) => ({
              id: item.pricePlanVerId,
              sequence: item.seq,
              versioneffdate: item.effDate ? item.effDate : "-",
              versionexpdate: item.expDate ? item.expDate : "-",
              remarks: index === 0 ? "Current Version" : "-",
              state: item.state,
              refofferverid: item.refOfferVerId,
            }))}
        >
          {/* {children} */}
        </DataGridProvider>

        <EditDialogVersion
          isOpen={isDialogEditOpen}
          onClose={handleCloseDialogEdit}
          offerid={offerid}
          versioneffdate={versioneffdate ?? ""}
          versionexpdate={versionexpdate ?? ""}
          id={idDelete ?? 0}
          sequence={sequence ?? ""}
          refofferverid={refofferverid ?? 0}
          state={state ?? ""}
          onSuccess={handleRefreshAfterAdd}
        />

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
            <DialogHeader className="p-0 border-0 block">
              <Alert variant="warning">
                <h3 className="text-lg">Are you sure?</h3>
                <span className="text-sm">
                  You will delete the Version "{versioneffdate} -{" "}
                  {versionexpdate}"
                </span>
              </Alert>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VersionContent;
