import { useState, useMemo, useEffect, useCallback } from "react";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { toast } from "sonner";
import {
  nonSelectedRowHighLight,
  selectedRowHighLight,
  selectedRowHigligt,
} from "@/styles/style";
import { Button } from "@/components/ui/button";
import { DynamicFeature } from "../hooks/EventContext";
import { useEventListContext } from "../hooks/useEventContext";
import { ColumnDef } from "@tanstack/react-table";
import { Controller, useForm } from "react-hook-form";
import {
  DynamicFeatureForm,
  DynamicFeatureTypeSchema,
  initialFormDyn,
} from "../schema/eventSchemaType";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { featureSourceOption } from "../utils/featureSourceOption";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const API_URL_REF = apiConfigRef.ref;

const DynamicFeatureTab = () => {
  const { PostData, PutData, DeleteData } = useCallApi();
  const {
    selectedReType,
    dynReAttrList,
    selectedItemDyn,
    setSelectedItemDyn,
    fetchAttrOfCatg,
    attrOfCatg,
    custType,
    fetchCustType,
    acctType,
    fetchAcctType,
    mode,
    setMode,
    fetchDynReAttrList,
    isLoading,
    menuPrivAccess,
  } = useEventListContext();
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [editTrigger, setEditTrigger] = useState<number>(0);
  const [deleteTrigger, setDeleteTrigger] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [openPopover, setOpenPopover] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
    watch,
    getValues,
  } = useForm<DynamicFeatureForm>({
    resolver: zodResolver(DynamicFeatureTypeSchema),
    defaultValues: initialFormDyn(selectedReType),
  });

  const dynAttrId = watch("dynAttrId");
  const postValue = watch("attrCatg");
  const selected = featureSourceOption.find(
    (item) => item.postValue === postValue,
  );
  const attrCatgGetValue = selected?.getValue ?? "";
  useEffect(() => {
    fetchAcctType(), fetchAttrOfCatg("1"), fetchCustType();
  }, []);

  useEffect(() => {
    if (!attrCatgGetValue) return;

    if (attrCatgGetValue === "4") {
      fetchCustType();
    } else if (attrCatgGetValue === "5") {
      fetchAcctType();
    } else {
      fetchAttrOfCatg(attrCatgGetValue);
    }
  }, [attrCatgGetValue]);

  useEffect(() => {
    if (deleteTrigger > 0 && selectedItemDyn) {
      handleDelete();
    }
  }, [deleteTrigger]);

  const triggerEditMode = (item: DynamicFeature) => {
    setSelectedItemDyn(item);
    setMode("edit");
    reset({
      defReAttr: item?.defReAttr,
      dependProdSpecId: item?.defReAttr,
      attrCatg: item?.attrCatg,
      dynAttrId: item?.dynAttrId,
      tag: item?.tag,
      reAttrSrcType: item?.reAttrSrcType ?? "B",
      reAttrName: item?.reAttrName,
      measurable: item?.measurable,
      comments: item?.comments,
      reType: item?.reType,
    });
  };

  useEffect(() => {
    if (mode !== "view") return;

    if (!selectedItemDyn) {
      reset(initialFormDyn(selectedReType));
    } else {
      reset({
        defReAttr: selectedItemDyn?.defReAttr,
        dependProdSpecId: selectedItemDyn?.defReAttr,
        attrCatg: selectedItemDyn?.attrCatg,
        dynAttrId: selectedItemDyn?.dynAttrId,
        tag: selectedItemDyn?.tag,
        reAttrSrcType: selectedItemDyn?.reAttrSrcType ?? "B",
        reAttrName: selectedItemDyn?.reAttrName,
        measurable: selectedItemDyn?.measurable,
        comments: selectedItemDyn?.comments,
        reType: selectedItemDyn?.reType,
      });
    }
  }, [selectedItemDyn, reset, mode, custType, attrOfCatg, acctType]);

  const triggerDeleteMode = (item: DynamicFeature) => {
    setSelectedItemDyn(item);
    setDeleteTrigger((prev) => prev + 1);
  };

  const handleNew = () => {
    reset(initialFormDyn(selectedReType));
    setMode("new");
  };

  const handleEdit = () => {
    setMode("edit");
    if (selectedItemDyn) {
      reset({
        defReAttr: selectedItemDyn?.defReAttr,
        dependProdSpecId: selectedItemDyn?.defReAttr,
        attrCatg: selectedItemDyn?.attrCatg,
        dynAttrId: selectedItemDyn?.dynAttrId,
        tag: selectedItemDyn?.tag,
        reAttrSrcType: selectedItemDyn?.reAttrSrcType ?? "B",
        reAttrName: selectedItemDyn?.reAttrName,
        measurable: selectedItemDyn?.measurable,
        comments: selectedItemDyn?.comments,
        reType: selectedItemDyn?.reType,
      });
    }
  };

  const handleCancel = () => {
    if (selectedItemDyn) {
      reset({
        defReAttr: selectedItemDyn?.defReAttr,
        dependProdSpecId: selectedItemDyn?.defReAttr,
        attrCatg: selectedItemDyn?.attrCatg,
        dynAttrId: selectedItemDyn?.dynAttrId,
        tag: selectedItemDyn?.tag,
        reAttrSrcType: selectedItemDyn?.reAttrSrcType,
        reAttrName: selectedItemDyn?.reAttrName,
        measurable: selectedItemDyn?.measurable,
        comments: selectedItemDyn?.comments,
        reType: selectedItemDyn?.reType,
      });
    } else {
      reset(initialFormDyn(selectedReType));
    }
    setMode("view");
  };

  const handleDelete = () => {
    setIsDeleteOpen(true);
  };

  const onDeleteConfirm = async () => {
    const reAttr = Number(selectedItemDyn?.reAttr);
    const reAttrSrcType = selectedItemDyn?.reAttrSrcType ?? "B";

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
        await fetchDynReAttrList();
        setMode("view");
        setIsDeleteOpen(false);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data: DynamicFeatureForm) => {
    const reAttr = Number(selectedItemDyn?.reAttr);
    if (mode === "new") {
      try {
        const response = await PostData(
          `${API_URL_REF}/api/event/add-re-attr`,
          data,
        );
        if (response?.status) {
          toast.success("Success");
          await fetchDynReAttrList();
          setMode("view");
        } else {
          toast.error(response?.message);
        }
      } catch (error) {
        console.error(error);
      }
    } else if (mode === "edit") {
      try {
        //  console.log("DATA DI MOD", data);
        const response = await PutData(
          `${API_URL_REF}/api/event/mod-re-attr/${reAttr}`,
          data,
        );

        if (response?.status) {
          toast.success("Success");
          await fetchDynReAttrList();
          setMode("view");
        } else {
          toast.error(response?.message);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleItemContentClick = (item: DynamicFeature) => {
    //  console.log("ITEM DYN: ", item);
    setMode("view");
    setSelectedItemDyn(item);
  };

  const sourceAttrName = (row: DynamicFeature) => {
    const category = featureSourceOption.find(
      (item) => item.postValue === row.attrCatg,
    )?.getValue;

    if (category === "4") {
      return (
        custType.find((item) => item.attrId === row.dynAttrId)?.attrName ?? ""
      );
    }

    if (category === "5") {
      return (
        acctType.find((item) => item.attrId === row.dynAttrId)?.attrName ?? ""
      );
    }

    return (
      attrOfCatg.find((item) => item.attrId === row.dynAttrId)?.attrName ?? ""
    );
  };

  const attrSource = useMemo(() => {
    if (attrCatgGetValue === "4") return custType;
    if (attrCatgGetValue === "5") return acctType;
    return attrOfCatg;
  }, [custType, acctType, attrCatgGetValue, attrOfCatg]);

  const filteredAttrSource = useMemo(() => {
    return attrSource.filter((item) =>
      item.attrName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [attrSource, search]);

  const columns = useMemo<ColumnDef<DynamicFeature>[]>(
    () => [
      {
        accessorKey: "reAttrName",
        id: "reAttrName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Feature Name" column={column} />
        ),
        cell: ({ row }) => {
          const data = row.original;
          return (
            <div className={`cursor-pointer transition-colors duration-200`}>
              {data.reAttrName}
            </div>
          );
        },
      },
      {
        accessorKey: "measurable",
        header: ({ column }) => (
          <DataGridColumnHeader title="Measurable" column={column} />
        ),
        cell: ({ row }) => {
          const measurable = row.original.measurable === "Y" ? "Yes" : "No";
          return <div>{measurable}</div>;
        },
      },
      {
        accessorKey: "featureSource",
        header: ({ column }) => (
          <DataGridColumnHeader title="Source Attribute" column={column} />
        ),
        cell: ({ row }) => {
          const data = row.original;
          return <span>{sourceAttrName(data)}</span>;
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
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerDeleteMode(data);
                  }}
                  title="Delete"
                >
                  <KeenIcon icon="trash" />
                </Button>
              </AccessWrapper>
            </div>
          );
        },
      },
    ],
    [selectedReType, selectedItemDyn],
  );

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
      <PopUpDialog
        isOpen={isDeleteOpen}
        desc="This action cannot be undone!"
        handleDialog={setIsDeleteOpen}
        onConfirm={onDeleteConfirm}
        bgOn={false}
      />

      <div className="bg-white rounded-lg shadow mb-6">
        <DataGridProvider
          columns={columns}
          data={dynReAttrList}
          pagination={{ size: 10 }}
          layout={{ card: true }}
          serverSide={false}
          getRowProps={(row) => ({
            className:
              row.original.reAttrName === selectedItemDyn?.reAttrName
                ? selectedRowHighLight
                : nonSelectedRowHighLight,
            onClick: () => handleItemContentClick(row.original),
          })}
        />
      </div>

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
                <span className="text-red-500">*</span> Feature Source
              </label>
              <Controller
                name="attrCatg"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={mode === "view"}
                  >
                    <SelectTrigger className="h-[30px]">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-w-[400px]">
                      {featureSourceOption.map((item) => (
                        <SelectItem key={item.postValue} value={item.postValue}>
                          <span className="block max-w-[250px] truncate">
                            {item.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.attrCatg && (
                <p className="text-red-500 text-sm">
                  {errors.attrCatg.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Source Attribute
              </label>
              <Controller
                name="dynAttrId"
                control={control}
                render={({ field }) => {
                  const selectedItem = attrSource.find(
                    (i) => i.attrId === field.value,
                  );

                  return (
                    <Popover open={openPopover} onOpenChange={setOpenPopover}>
                      <PopoverTrigger asChild disabled={mode === "view"}>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="h-[30px] w-full justify-between"
                        >
                          <span className="truncate">
                            {selectedItem ? selectedItem.attrName : "Select..."}
                          </span>
                          <KeenIcon icon="chevron-down" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="p-0 w-[400px]">
                        <Command>
                          <CommandInput
                            placeholder="Search..."
                            value={search}
                            onValueChange={setSearch}
                          />

                          <CommandList>
                            {isLoading && (
                              <div className="flex items-center justify-center py-6 text-sm text-gray-500">
                                <KeenIcon
                                  icon="loading"
                                  className="mr-2 animate-spin"
                                />
                                Loading...
                              </div>
                            )}
                            {!isLoading && filteredAttrSource.length === 0 && (
                              <CommandEmpty>No data found.</CommandEmpty>
                            )}

                            {filteredAttrSource.map((item) => (
                              <CommandItem
                                key={item.attrId}
                                value={item.attrName}
                                onSelect={() => {
                                  field.onChange(item.attrId);
                                  setSearch("");
                                  setOpenPopover(false);
                                }}
                              >
                                <span className="truncate">
                                  {item.attrName}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  );
                }}
              />

              {errors.dynAttrId && (
                <p className="text-red-500 text-sm">
                  {errors.dynAttrId.message}
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
                {dynReAttrList && dynReAttrList.length > 0 && (
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

export default DynamicFeatureTab;
