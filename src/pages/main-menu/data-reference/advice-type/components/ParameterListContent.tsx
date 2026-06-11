import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdviceTypeContext } from "../hooks/useAdviceTypeContext";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { Input } from "@/components/ui/input";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { Loading } from "@/components/common/Loading";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import BlocksParameterListContent from "../blocks/BlocksParameterListContent";
import DeleteConfirmationDialog from "../blocks/ValidationDeleteDialog";
import { toast } from "sonner";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

export interface paramListProps {
  adviceParamId: number | null;
  adviceParamCode: string;
  adviceParamName: string;
  comments: string;
}

const initialPropsParam: paramListProps = {
  adviceParamId: null,
  adviceParamCode: "",
  adviceParamName: "",
  comments: "",
};

const API_URL_REF = apiConfigRef.ref;

const ParameterListContent = () => {
  const { GetData } = useCallApi();
  const {
    handleSubmit,
    errors,
    setErrors,
    handleEdit,
    isSubmitting,
    isUpdating,
    isDeleting,
    handleDelete,
  } = BlocksParameterListContent();
  const {
    showParameterListContent,
    setShowParameterListContent,
    selectedContent,
    menuPrivAccess,
  } = useAdviceTypeContext();
  const [selectedParamList, setSelectedParamList] = useState<paramListProps | null>(null);
  const [paramList, setParamList] = useState<paramListProps[]>([]);
  const [formData, setFormData] = useState<paramListProps>(initialPropsParam);
  const [paramLoading, setParamLoading] = useState(false);
  const [mode, setMode] = useState<"add" | "edit" | "view">("view");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [data, setData] = useState<paramListProps[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectedParam = (item: paramListProps) => {
    setSelectedParamList(item);
  };

  const column = useMemo<ColumnDef<paramListProps>[]>(
    () => [
      {
        id: "ADVICE_PARAM_NAME",
        accessorFn: (row) => row.adviceParamName,
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            className=""
            title="Parameter Name"
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "ADVICE_PARAM_CODE",
        accessorFn: (row) => row.adviceParamCode,
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            className=""
            title="Parameter Code"
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "COMMENTS",
        accessorFn: (row) => row.comments,
        header: ({ column }) => (
          <DataGridColumnHeader column={column} className="" title="Remarks" />
        ),
        enableSorting: true,
        enableHiding: false,
      },
    ],
    [selectedParamList],
  );

  const doGetListData = async (
    page: number,
    limit: number,
    sorting: any,
    filter: any,
  ) => {
    setParamLoading(true);

    try {
      sorting =
        sorting.length == 0 ? [{ id: "ADVICE_TYPE", desc: false }] : sorting;
      filter =
        filter.length == 0
          ? {}
          : { adviceParamName: filter[0].value?.toLowerCase() };

      const response = await GetData(
        `${API_URL_REF}/api/advice-type/qry-advice-type-param`,
        {
          size: limit,
          page: page + 1,
          sortBy: sorting[0].id,
          sortDirection: sorting[0].desc == false ? "ASC" : "DESC",
          adviceType: selectedContent?.adviceType,
        },
      );

      setParamList(response?.data);
      return {
        data: response?.data || [],
        totalCount: response?.totalRows || 0,
      };
    } catch (error) {
      console.error("Error fetching parameter list", error);
      toast.error("Error fetching data. Please check your connection!");
      return { data: [], totalCount: 0 };
    } finally {
      setParamLoading(false);
    }
  };

  const handleReloadParameterList = useCallback(() => {
    setMode("view");
    setFormData(initialPropsParam);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!selectedParamList && paramList.length > 0) {
      handleSelectedParam(paramList[0]);
    }
  }, [paramList, selectedParamList]);

  useEffect(() => {
    if (selectedParamList) {
      setFormData({
        adviceParamId: selectedParamList?.adviceParamId,
        adviceParamName: selectedParamList?.adviceParamName,
        adviceParamCode: selectedParamList?.adviceParamCode,
        comments: selectedParamList?.comments,
      });
      return;
    }
  }, [selectedParamList]);

  useEffect(() => {
    setFormData(initialPropsParam);
    setParamList([]);
    setSelectedParamList(null);
    setRefreshTrigger((prev) => prev + 1);
  }, [selectedContent]);

  const isFormMode = mode === "add" || mode === "edit";

  const handleConfirmDelete = async () => {
    const success = await handleDelete(formData, handleReloadParameterList);
    if (success) {
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Dialog
        open={showParameterListContent}
        onOpenChange={(open) => {
          setShowParameterListContent(open);

          if (!open) {
            setMode("view");
            setFormData(initialPropsParam);
            setSelectedParamList(null);
            setErrors({});
          }
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl overflow-hidden h-[90vh] sm:h-auto flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Parameter List
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 py-3 sm:py-5 px-3 sm:px-5 overflow-y-auto">
            {/* Data Grid Section */}
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <div className="min-w-[300px]">
                <DataGridProvider
                  key={refreshTrigger}
                  columns={column}
                  data={data} 
                  serverSide={true}
                  layout={{ card: true }}
                  pagination={{ size: 5 }}
                  getRowProps={(row) => ({
                    className: row.original.adviceParamId === selectedParamList?.adviceParamId ? selectedRowHighLight : nonSelectedRowHighLight,
                    onClick: () => setSelectedParamList(row.original),
                  })}
                  onFetchData={({
                    pageIndex,
                    pageSize,
                    sorting,
                    columnFilters,
                  }) =>
                    doGetListData(pageIndex, pageSize, sorting, columnFilters)
                  }
                />
              </div>

              <div className="w-full border-t border-gray-300 my-5" />

              <h2 className="font-medium text-lg">
                {mode === "add" && "Add parameter list"}
                {mode === "edit" && "Edit parameter list"}
                {mode === "view" && "Detail"}
              </h2>

              {isFormMode ? (
                <div className="flex flex-col gap-3 sm:gap-4 px-2 sm:px-3 py-2 sm:py-3">
                  {/* Parameter Name & Code Fields */}
                  <div className="flex flex-col gap-4">
                    {/* Parameter Name Field */}
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="text-xs sm:text-sm w-full sm:w-32 flex-shrink-0">
                          <span className="text-red-500">*</span>Parameter Name
                        </label>
                        <div className="flex-1">
                          <Input
                            type="text"
                            value={formData.adviceParamName}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                adviceParamName: e.target.value,
                              });
                              setErrors({ ...errors, adviceParamName: "" });
                            }}
                            className={`w-full h-8 sm:h-9 text-xs sm:text-sm ${errors.adviceParamName ? "border-red-500" : ""}`}
                            placeholder="Input Parameter name"
                          />
                        </div>
                      </div>
                      {errors.adviceParamName && (
                        <span className="text-red-500 text-xs sm:ml-36">
                          {errors.adviceParamName}
                        </span>
                      )}
                    </div>

                    {/* Parameter Code Field */}
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="text-xs sm:text-sm w-full sm:w-32 flex-shrink-0">
                          <span className="text-red-500">*</span>Parameter Code
                        </label>
                        <div className="flex-1">
                          <Input
                            type="text"
                            value={formData.adviceParamCode}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                adviceParamCode: e.target.value,
                              });
                              setErrors({ ...errors, adviceParamCode: "" });
                            }}
                            className={`w-full h-8 sm:h-9 text-xs sm:text-sm ${errors.adviceParamCode ? "border-red-500" : ""}`}
                            placeholder="Input Parameter code"
                          />
                        </div>
                      </div>
                      {errors.adviceParamCode && (
                        <span className="text-red-500 text-xs sm:ml-36">
                          {errors.adviceParamCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remarks Field */}
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-xs sm:text-sm w-full sm:w-32 flex-shrink-0">
                        Remarks
                      </label>
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={formData.comments}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              comments: e.target.value,
                            });
                            setErrors({ ...errors, comments: "" });
                          }}
                          className="w-full text-xs sm:text-sm h-8 sm:h-9"
                          placeholder="Input Remarks"
                        />
                      </div>
                    </div>
                    {errors.comments && (
                      <span className="text-red-500 text-xs sm:ml-36">
                        {errors.comments}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 justify-end pt-3 sm:pt-5">
                    <Button
                      variant="default"
                      className="h-9 sm:h-8 text-xs sm:text-sm w-full sm:w-auto"
                      onClick={() => {
                        if (mode === "edit") {
                          handleEdit(formData, handleReloadParameterList);
                        } else {
                          handleSubmit(formData, handleReloadParameterList);
                        }
                      }}
                    >
                      {mode === "add"
                        ? isSubmitting
                          ? "Submitting..."
                          : "Submit"
                        : isUpdating
                          ? "Updating..."
                          : "Update"}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-9 sm:h-8 text-xs sm:text-sm w-full sm:w-auto"
                      onClick={() => {
                        setMode("view");
                        setFormData(initialPropsParam);
                        setErrors({});
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex flex-col gap-3 sm:gap-4 px-2 sm:px-3 py-2 sm:py-3">
                  <div className="flex flex-col gap-4">
                    {/* Parameter Name - View Mode */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-xs sm:text-sm w-full sm:w-32 flex-shrink-0">
                        <span className="text-red-500">*</span>Parameter Name
                      </label>
                      <div className="flex-1">
                        <Input
                          value={selectedParamList?.adviceParamName}
                          type="text"
                          className="w-full h-8 sm:h-9 text-xs sm:text-sm"
                          disabled={mode === "view"}
                        />
                      </div>
                    </div>

                    {/* Parameter Code - View Mode */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-xs sm:text-sm w-full sm:w-32 flex-shrink-0">
                        <span className="text-red-500">*</span>Parameter Code
                      </label>
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={selectedParamList?.adviceParamCode}
                          className="w-full h-8 sm:h-9 text-xs sm:text-sm"
                          disabled={mode === "view"}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Remarks - View Mode */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="text-xs sm:text-sm w-full sm:w-32 flex-shrink-0">
                      Remarks
                    </label>
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={selectedParamList?.comments || ""}
                        className="text-xs sm:text-sm h-8 sm:h-9"
                        disabled={mode === "view"}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {mode === "view" && (
            <DialogFooter className="flex justify-end gap-2">
              <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
                <Button
                  variant="default"
                  className="text-sm h-8"
                  onClick={() => {
                    setFormData(initialPropsParam);
                    setMode("add");
                  }}
                >
                  New
                </Button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
                <Button
                  variant="outline"
                  className="text-sm h-8"
                  onClick={() => {
                    if (selectedParamList) {
                      setFormData(selectedParamList);
                    }
                    setMode("edit");
                  }}
                  disabled={!selectedParamList}
                >
                  Edit
                </Button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
                <Button
                  variant="outline"
                  className="text-sm h-8"
                  onClick={() => {
                    if (selectedParamList?.adviceParamId) {
                      setShowDeleteDialog(true);
                    }
                  }}
                  disabled={!selectedParamList?.adviceParamId}
                >
                  Delete
                </Button>
              </AccessWrapper>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        paramName={selectedParamList?.adviceParamName || ""}
      />
    </>
  );
};

export default ParameterListContent;
