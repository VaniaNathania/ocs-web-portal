import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  DataGridColumnHeader,
  DataGridProvider,
  KeenIcon,
  useDataGrid,
} from "@/components";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { toast } from "sonner";
import {
  nonSelectedRowHighLight,
  selectedRowHighLight,
  selectedRowHigligt,
} from "@/styles/style";
import { Button } from "@/components/ui/button";
import { DefReAttrByAll, ReserveReAttr } from "../hooks/EventContext";
import { useEventListContext } from "../hooks/useEventContext";
import { ColumnDef } from "@tanstack/react-table";
import { Controller, useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  StaticFeatureForm,
  StaticFeatureTypeSchema,
  initialFormStatic,
} from "../schema/eventSchemaType";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const API_URL_REF = apiConfigRef.ref;

const StaticFeatureTab = () => {
  const {
    defReAttrList,
    selectedItemStatic,
    setSelectedItemStatic,
    fetchDefReAttrByAll,
    fetchReserveReAttr,
    selectedReType,
    mode,
    setMode,
    reserveReAttr,
    setReserveReAttr,
    menuPrivAccess,
  } = useEventListContext();
  const { PostData, PutData, DeleteData } = useCallApi();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
    watch,
    getValues,
  } = useForm<StaticFeatureForm>({
    resolver: zodResolver(StaticFeatureTypeSchema),
    defaultValues: initialFormStatic(selectedReType),
  });
  const [deleteTrigger, setDeleteTrigger] = useState<number>(0);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [reserveReAttrFiltered, setReserveReAttrFiltered] = useState<
    ReserveReAttr[]
  >([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    // fetchDefReAttrByAll();
    fetchReserveReAttr();
  }, [selectedReType]);

  useEffect(() => {
    if (reserveReAttr.length === 0) return;

    const used = defReAttrList.map((item) => Number(item.defReAttr));

    const filtered = reserveReAttr.filter(
      (item) => !used.includes(Number(item.reAttr)),
    );

    // console.log("USED:", used);
    // console.log(
    //   "FILTERED:",
    //   filtered.map((x) => x.reAttr)
    // );

    setReserveReAttrFiltered(filtered);
  }, [defReAttrList]);

  //  console.log("errors static", errors);

  useEffect(() => {
    if (!selectedItemStatic) {
      reset(initialFormStatic(selectedReType));
      return;
    }

    reset({
      defReAttr: selectedItemStatic?.defReAttr,
      reAttrSrcType: selectedItemStatic?.reAttrSrcType ?? "A",
      reAttrName: selectedItemStatic?.reAttrName,
      measurable: selectedItemStatic?.measurable,
      comments: selectedItemStatic?.comments,
      reType: selectedReType ?? null,
    });
  }, [selectedItemStatic, selectedReType, reset, reserveReAttr]);

  const handleNew = () => {
    setMode("new");
    reset(initialFormStatic(selectedReType));
  };

  const onSubmit = async (data: StaticFeatureForm) => {
    const reAttr = Number(selectedItemStatic?.reAttr);
    if (mode === "new") {
      try {
        const response = await PostData(
          `${API_URL_REF}/api/event/add-re-attr`,
          data,
        );
        if (response?.status) {
          toast.success("Success");
          // await fetchDefReAttrByAll();
          setRefreshTrigger((prev) => prev + 1);
          await fetchReserveReAttr();
          setMode("view");
        } else {
          toast.error(response?.message ?? "Failed");
        }
      } catch (err) {
        //  console.log(err);
      }
    } else if (mode === "edit") {
      try {
        const response = await PutData(
          `${API_URL_REF}/api/event/mod-re-attr/${reAttr}`,
          data,
        );

        if (response?.status) {
          toast.success("Success");
          // await fetchDefReAttrByAll();
          setRefreshTrigger((prev) => prev + 1);
          await fetchReserveReAttr();
          setMode("view");
        } else {
          toast.error(response?.message ?? "Failed");
        }
      } catch (err) {
        //  console.log(err);
      }
    }
  };

  const handleEdit = () => {
    setMode("edit");
    if (selectedItemStatic) {
      reset({
        defReAttr: selectedItemStatic?.defReAttr,
        reAttrSrcType: selectedItemStatic?.reAttrSrcType ?? "A",
        reAttrName: selectedItemStatic?.reAttrName,
        measurable: selectedItemStatic?.measurable,
        comments: selectedItemStatic?.comments,
        reType: selectedReType ?? null,
      });
    }
  };

  const handleItemContentClick = (item: DefReAttrByAll) => {
    //  console.log("ITEM STATIC: ", item);
    setMode("view");
    setSelectedItemStatic(item);
  };

  const triggerEditMode = (item: DefReAttrByAll) => {
    setSelectedItemStatic(item);
    setMode("edit");
    reset({
      defReAttr: item?.reAttr,
      dependProdSpecId: item?.defReAttr,
      reAttrSrcType: item?.reAttrSrcType ?? "A",
      reAttrName: item?.reAttrName,
      measurable: item?.measurable,
      comments: item?.comments,
      reType: selectedReType ?? null,
    });
  };

  const triggerDeleteMode = (item: DefReAttrByAll) => {
    setSelectedItemStatic(item);
    setDeleteTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    if (deleteTrigger > 0 && selectedItemStatic) {
      handleDelete();
    }
  }, [deleteTrigger]);

  const handleDelete = () => {
    setIsDeleteOpen(true);
  };

  const handleCancel = () => {
    setMode("view");
    reset({
      defReAttr: selectedItemStatic?.defReAttr,
      reAttrSrcType: selectedItemStatic?.reAttrSrcType ?? "A",
      reAttrName: selectedItemStatic?.reAttrName,
      measurable: selectedItemStatic?.measurable,
      comments: selectedItemStatic?.comments,
      reType: selectedReType ?? null,
    });
  };

  const onDeleteConfirm = async () => {
    const reAttr = Number(selectedItemStatic?.reAttr);
    const reAttrSrcType = selectedItemStatic?.reAttrSrcType ?? "A";

    try {
      const response = await DeleteData(
        `${API_URL_REF}/api/event/del-re-attr/${reAttr}?reAttrSrcType=${reAttrSrcType}`,
        {
          reAttr,
          reAttrSrcType,
        },
      );
      if (response?.status) {
        toast.success("Success");
        // await fetchDefReAttrByAll();
        setRefreshTrigger((prev) => prev + 1);
        await fetchReserveReAttr();
        setMode("view");
        setIsDeleteOpen(false);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Column definitions
  const columns = useMemo<ColumnDef<DefReAttrByAll>[]>(
    () => [
      {
        accessorKey: "reAttrName",
        id: "reAttrName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Feature Name" column={column} />
        ),
      },
      {
        accessorKey: "measurable",
        header: ({ column }) => (
          <DataGridColumnHeader title="Measurable" column={column} />
        ),
        cell: ({ row }) => {
          const data = row.original;

          const measurable = data.measurable === "Y" ? "Yes" : "No";

          return <span>{measurable}</span>;
        },
      },
      {
        accessorKey: "reAttr",
        header: ({ column }) => (
          <DataGridColumnHeader title="Reserved Feature" column={column} />
        ),
        cell: ({ row }) => {
          const data = row.original;
          const found = reserveReAttr.find(
            (item) => Number(item.reAttr) === Number(data.defReAttr),
          );

          return found ? `${found.reAttrName} [${found.reAttr}]` : "";
        },
      },
      {
        id: "Operation",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Operation"
            className="text-center"
            column={column}
          />
        ),
        cell: ({ row }) => {
          const data = row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
                <Button
                  variant="ghost"
                  className=""
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerEditMode(data);
                  }}
                  title="Edit"
                >
                  <KeenIcon icon="notepad-edit" />
                </Button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
                <Button
                  variant="ghost"
                  className="text-red-500"
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerDeleteMode(data);
                  }}
                >
                  <KeenIcon icon="trash" />
                </Button>
              </AccessWrapper>
            </div>
          );
        },
      },
    ],
    [selectedItemStatic, defReAttrList, reserveReAttr],
  );

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
      {/* Delete Confirmation */}
      <PopUpDialog
        isOpen={isDeleteOpen}
        desc={"This action cannot be undone!"}
        handleDialog={() => setIsDeleteOpen(false)}
        onConfirm={onDeleteConfirm}
        bgOn={false}
      />

      {/* DataGrid */}
      <div className="bg-white rounded-lg shadow mb-6">
        <DataGridProvider<DefReAttrByAll>
          columns={columns}
          key={`${selectedReType}-${refreshTrigger}`}
          pagination={{ size: 10 }}
          layout={{ card: true }}
          serverSide={true}
          sorting={[{ id: "reAttrName", desc: true }]}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
            fetchDefReAttrByAll({
              page: pageIndex + 1,
              size: pageSize,
              sortBy: sorting?.[0].id,
              sortDirection: sorting?.[0].desc ? "DESC" : "ASC",
              reType: selectedReType,
              spId: 0,
            })
          }
          getRowProps={(row) => ({
            className:
              row.original.defReAttr === selectedItemStatic?.defReAttr
                ? selectedRowHighLight
                : nonSelectedRowHighLight,
            onClick: () => handleItemContentClick(row.original),
          })}
        />
      </div>

      {/* Detail */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Detail</h3>

          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Feature Name
              </label>
              <Input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                {...register("reAttrName")}
                disabled={mode === "view"}
              />
              {errors.reAttrName && (
                <p className="text-red-500 text-sm">
                  {errors.reAttrName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Measurable
              </label>
              <div className="flex items-center gap-6 h-10">
                <Controller
                  name="measurable"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Label className="mr-3">
                        <input
                          type="radio"
                          value="Y"
                          checked={field.value === "Y"}
                          onChange={(e) => field.onChange(e.target.value)}
                          className={`mr-1 ${mode === "view" ? "cursor-not-allowed" : "cursor-pointer"}`}
                          disabled={mode === "view"}
                        />
                        Yes
                      </Label>
                      <Label>
                        <input
                          type="radio"
                          value="N"
                          checked={field.value === "N"}
                          onChange={(e) => field.onChange(e.target.value)}
                          className={`mr-1 ${mode === "view" ? "cursor-not-allowed" : "cursor-pointer"}`}
                          disabled={mode === "view"}
                        />
                        No
                      </Label>
                    </>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Reserved Feature
              </label>
              <Controller
                name="defReAttr"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : undefined}
                    disabled={mode === "view"}
                  >
                    <SelectTrigger className="h-[30px]">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-w-[400px]">
                      {mode === "new"
                        ? reserveReAttrFiltered.map((item) => (
                            <SelectItem
                              key={item.reAttr}
                              value={String(item.reAttr)}
                            >
                              <span className="block max-w-[250px] truncate">{`${item.reAttrName} [${item.reAttr}]`}</span>
                            </SelectItem>
                          ))
                        : reserveReAttr.map((item) => (
                            <SelectItem
                              key={item.reAttr}
                              value={String(item.reAttr)}
                            >
                              <span className="block max-w-[250px] truncate">{`${item.reAttrName} [${item.reAttr}]`}</span>
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.defReAttr && (
                <p className="text-red-500 text-sm">
                  {errors.defReAttr.message}
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <Input
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              {...register("comments")}
              disabled={mode === "view"}
            />
          </div>

          <div className="flex justify-end gap-3">
            {mode === "view" ? (
              <>
                <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-300 hover:text-white "
                    onClick={(e) => {
                      e.preventDefault();
                      handleNew();
                    }}
                  >
                    New
                  </Button>
                </AccessWrapper>
                {defReAttrList && defReAttrList.length > 0 && (
                  <>
                    <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleEdit}
                      >
                        Edit
                      </Button>
                    </AccessWrapper>
                    <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                      >
                        Delete
                      </Button>
                    </AccessWrapper>
                  </>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-500 text-white hover:bg-blue-300 hover:text-white "
                  type="submit"
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default StaticFeatureTab;
