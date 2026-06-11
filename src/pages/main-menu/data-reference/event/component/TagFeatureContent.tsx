import React, { useState, useMemo, useCallback, useEffect } from "react";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { toast } from "sonner";
import { selectedRowHigligt } from "@/styles/style";
import { Button } from "@/components/ui/button";
import { DynamicFeature, ReAttrTagByAll } from "../hooks/EventContext";
import { useEventListContext } from "../hooks/useEventContext";
import { ColumnDef } from "@tanstack/react-table";
import { Controller, useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  TagFeatureForm,
  TagFeatureTypeSchema,
  initialFormTag,
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
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const TagFeatureTab = () => {
  const {
    selectedItemTag,
    setSelectedItemTag,
    reAttrTagList,
    dsTag,
    mode,
    setMode,
    selectedReType,
    fetchDsTag,
    fetchReAttrTagByAll,
    menuPrivAccess,
  } = useEventListContext();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
    watch,
    getValues,
  } = useForm<TagFeatureForm>({
    resolver: zodResolver(TagFeatureTypeSchema),
    defaultValues: initialFormTag(selectedReType),
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    fetchDsTag();
  }, [selectedReType]);

  const handleNew = () => {
    setMode("new");
    reset(initialFormTag(selectedReType));
  };

  const handleEdit = () => {
    setMode("edit");
  };

  const handleDelete = () => {
    setIsDeleteOpen(true);
  };

  const handleCancel = () => {
    setMode("view");
  };

  const onSubmit = async () => {};

  // Handler untuk confirm delete
  const onConfirmDelete = async () => {};

  // Column definitions
  const columns = useMemo<ColumnDef<ReAttrTagByAll>[]>(
    () => [
      {
        accessorKey: "featureName",
        id: "featureName",
        header: ({ column }: any) => (
          <DataGridColumnHeader title="Feature Name" column={column} />
        ),
      },
      {
        accessorKey: "measurable",
        header: ({ column }: any) => (
          <DataGridColumnHeader title="Measurable" column={column} />
        ),
      },
      {
        accessorKey: "tagName",
        header: ({ column }: any) => (
          <DataGridColumnHeader title="Tag Name" column={column} />
        ),
      },
      {
        id: "Operation",
        header: ({ column }: any) => (
          <DataGridColumnHeader
            title="Operation"
            className="text-center"
            column={column}
          />
        ),
        cell: ({ row }: any) => {
          const data = row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  title="Edit"
                >
                  <KeenIcon icon="notepad-edit" />
                </button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <KeenIcon icon="trash" />
                </button>
              </AccessWrapper>
            </div>
          );
        },
      },
    ],
    [selectedItemTag, reAttrTagList],
  );

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
      {/* Delete Confirmation Dialog */}
      <PopUpDialog
        isOpen={isDeleteOpen}
        desc="This action cannot be undone!"
        handleDialog={() => setIsDeleteOpen(false)}
        onConfirm={onConfirmDelete}
        bgOn={false}
      />

      {/* DataGrid Table */}
      <div className="bg-white rounded-lg shadow mb-6">
        <DataGridProvider<ReAttrTagByAll>
          key={`${selectedReType}-${refreshTrigger}`}
          columns={columns}
          pagination={{ size: 10 }}
          layout={{ card: true }}
          serverSide={false}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
            fetchReAttrTagByAll({
              page: pageIndex + 1,
              size: pageSize,
              sortBy: sorting?.[0].id,
              sortDirection: sorting?.[0].desc ? "DESC" : "ASC",
              reType: selectedReType,
              spId: 0,
            })
          }
        />
      </div>

      {/* Detail Form */}
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
                <span className="text-red-500">*</span> Tag Name
              </label>
              <Controller
                name="tag"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={String(field.value)}
                    disabled={mode === "view"}
                  >
                    <SelectTrigger className="h-[30px]">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-w-[400px]">
                      {dsTag.map((item) => (
                        <SelectItem key={item.tag} value={String(item.tag)}>
                          <span className="block max-w-[250px] truncate">
                            {item.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.tag && (
                <p className="text-red-500 text-sm">{errors.tag.message}</p>
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

          <div className="flex justify-end gap-3 mt-6">
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
                {reAttrTagList && reAttrTagList.length > 0 && (
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

export default TagFeatureTab;
