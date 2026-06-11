import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  initialForm,
  SimNumberBindUnbindForm,
  SimNumberBindUnbindSchema,
} from "../schema/SimNumberBindUnbindSchemaType";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MdOutlineFileDownload, MdOutlineFileUpload } from "react-icons/md";
import { useSimNumberBindUnbindContext } from "../hooks/SimNumberBindUnbindContext";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo } from "react";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { toast } from "sonner";
import { Loading } from "../../role-management/block/loadingBlock";
import { AccessWrapper } from "../../role-management/hook/useRoleCheck";

const Main = () => {
  const {
    fileInputRef,
    uploadBtnRef,
    handleFileChange,
    handleUploadClick,
    handleDownloadTemplate,
    selectedItem,
    fetchQryAccNbrWithUnbinded4SimNbrBinding,
    fetchQrySimCardWithUnbinded,
    fetchQryIccidEndByCount,
    isLoading,
    setIsLoading,
    fetchQryAccNbrWithBinded4SimNbrBinding,
    fetchQryBindingSimNbr,
    fetchQryBindingTempTableCount,
    fetchQryBindingTempTable,
    handleRowClick,
    fetchQryAccNbrEndByCount4SimNbrBinding,
    queryResult,
    setQueryResult,
    onSubmit,
    fetchQryAccNbrEndByCountUnbind4SimNbrBinding,
    fetchUnbindingSimNbr,
    fetchQrySimNbrForBinding,
    menuPrivAccess,
  } = useSimNumberBindUnbindContext();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
    watch,
  } = useForm<SimNumberBindUnbindForm>({
    resolver: zodResolver(SimNumberBindUnbindSchema),
    defaultValues: initialForm(),
  });

  const actionType = watch("operationType");
  const prefix = watch("prefix");
  const accNbrBegin = watch("accNbrBegin");
  const accNbrEnd = watch("accNbrEnd");
  const accNbrQuantity = watch("accNbrQuantity");
  const iccidBegin = watch("iccidBegin");
  const iccidEnd = watch("iccidEnd");
  const iccidQuantity = watch("iccidQuantity");
  const matchFlag = watch("matchType");

  const onQuery = async () => {
    setQueryResult([]);
    try {
      // if (actionType === "1" && actionType === "0") {
      setIsLoading(true);
      const result = actionType === "1" ? await fetchQryBindingSimNbr(prefix, accNbrBegin, accNbrEnd) : await fetchQrySimNbrForBinding(prefix, accNbrBegin, accNbrEnd, iccidBegin, iccidEnd, matchFlag);

      if (!result) return;

      if (!result?.tableName) {
        toast.error("Failed GetData because tableName null!");
        return;
      }

      await Promise.all([await fetchQryBindingTempTableCount(result.tableName), await fetchQryBindingTempTable(result.tableName)]);
      // }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset(initialForm());
    setQueryResult([]);
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "serviceNumber",
        accessorFn: (row) => `${row.prefix}-${row.accNbr}`,
        header: ({ column }) => (
          <DataGridColumnHeader title="Service Number" column={column} />
        ),
        cell: ({ row }) => {
          const accNbr = row.original.accNbr;
          const prefix = row.original.prefix;

          return <div>{`${prefix}-${accNbr}`}</div>;
        },
      },
      {
        id: "iccid",
        accessorFn: (row) => row.iccid,
        header: ({ column }) => (
          <DataGridColumnHeader title="ICCID" column={column} />
        ),
      },
    ],
    [onQuery],
  );

  return (
    <form onSubmit={handleSubmit(onQuery)}>
      <div className="grid grid-cols-2">
        {isLoading && <Loading />}
        <div className="flex flex-col gap-3 p-5">
          {/* OPERATION ACTION */}
          <div className="grid grid-cols-3 gap-2 items-center">
            <Label>Operation Action</Label>
            <div className="grid grid-cols-2 col-span-2 gap-2">
              <Controller
                name="operationType"
                control={control}
                render={({ field }) => (
                  <>
                    <Label className="flex gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="0"
                        checked={field.value === "0"}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      Binding By Number
                    </Label>

                    <Label className="flex gap-2 cursor-not-allowed">
                      <input
                        type="radio"
                        value="2"
                        checked={field.value === "2"}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled
                        className="cursor-not-allowed"
                      />
                      Binding By File
                    </Label>

                    <Label className="flex gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="1"
                        checked={field.value === "1"}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      Unbinding By Number
                    </Label>

                    <Label className="flex gap-2 cursor-not-allowed">
                      <input
                        type="radio"
                        value="3"
                        checked={field.value === "3"}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled
                        className="cursor-not-allowed"
                      />
                      Unbinding By File
                    </Label>
                  </>
                )}
              />
            </div>
          </div>
          {(actionType === "0" || actionType === "1") && (
            <>
              {/* PREFIX */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label>
                  <span className="text-red-500">*</span>Prefix
                </Label>

                <Controller
                  name="prefix"
                  control={control}
                  render={({ field }) => (
                    <div
                      className={`input flex col-span-2 ${(errors as any)?.prefix && "border border-red-500 hover:border-red-500"}`}
                      title={`${(errors as any)?.prefix ? `${(errors as any)?.prefix.message}` : `${prefix}`}`}
                    >
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                        }}
                        value={field.value || ""}
                      >
                        <SelectTrigger className=" border-none h-8">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="670">670</SelectItem>
                        </SelectContent>
                      </Select>
                      {prefix && (
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setValue("prefix", "", {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            }}
                            type="button"
                          >
                            <KeenIcon icon="cross" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
              {/* SERVICE NUMBER FROM */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label>
                  <span className="text-red-500">*</span>Service Number From
                </Label>
                <Input
                  {...register("accNbrBegin")}
                  className={`col-span-2 ${(errors as any)?.accNbrBegin && "border border-red-500 hover:border-red-500"}`}
                  title={`${(errors as any)?.accNbrBegin ? `${(errors as any)?.accNbrBegin.message}` : `${accNbrBegin}`}`}
                  onBlur={(e) => {
                    const value = e.target.value;
                    setValue("accNbrEnd", value, { shouldValidate: true, shouldDirty: true });
                  }}
                />
              </div>
              {/* SERVICE NUMBER TO */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label>
                  <span className="text-red-500">*</span>Service Number To
                </Label>
                <Input
                  {...register("accNbrEnd")}
                  className={`col-span-2 ${(errors as any)?.accNbrEnd && "border border-red-500 hover:border-red-500"}`}
                  title={`${(errors as any)?.accNbrEnd ? `${(errors as any)?.accNbrEnd.message}` : `${accNbrEnd}`}`}
                  onBlur={async () => {
                    if (prefix && accNbrBegin && accNbrEnd) {
                      const API =
                        actionType === "0"
                          ? fetchQryAccNbrWithUnbinded4SimNbrBinding
                          : fetchQryAccNbrWithBinded4SimNbrBinding;
                      const result = await API(prefix, accNbrBegin, accNbrEnd);

                      if (!result || result.length === 0) {
                        setValue("accNbrQuantity", undefined);
                        setValue("accNbrEnd", "", {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        toast.error(
                          "No numbers were found between start number and end number.",
                        );
                        return;
                      } else {
                        setValue("accNbrQuantity", Number(result.length));
                      }
                    }
                  }}
                />
              </div>
              {/* SERVICE NUMBER QUANTITY */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label>Service Number Quantity</Label>
                <Input
                  {...register("accNbrQuantity", { valueAsNumber: true })}
                  className="col-span-2"
                  onBlur={async () => {
                    if (prefix && accNbrBegin && accNbrQuantity) {
                      const API =
                        actionType === "0"
                          ? fetchQryAccNbrEndByCount4SimNbrBinding
                          : fetchQryAccNbrEndByCountUnbind4SimNbrBinding;
                      const result = await API(
                        prefix,
                        accNbrBegin,
                        accNbrQuantity,
                      );

                      if (result?.length !== accNbrQuantity) {
                        setValue("accNbrEnd", "", {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setValue("accNbrQuantity", null);

                        toast.error("No enough numbers were found.");
                        return;
                      }

                      const accNbrEndResult = result?.[result?.length - 1];
                      if (!accNbrEndResult) return;
                      setValue("accNbrEnd", accNbrEndResult?.accNbr, { shouldValidate: true, shouldDirty: true });
                    }
                  }}
                />
              </div>
              {actionType === "0" && (
                <>
                  {/* ICCID FROM */}
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <Label>
                      <span className="text-red-500">*</span>ICCID From
                    </Label>
                    <Input
                      {...register("iccidBegin")}
                      className={`col-span-2 ${(errors as any)?.iccidBegin && "border border-red-500 hover:border-red-500"}`}
                      title={`${(errors as any)?.iccidBegin ? `${(errors as any)?.iccidBegin.message}` : `${iccidBegin}`}`}
                      // onBlur={(e) => {
                      //   const value = e.target.value;
                      //   setValue("iccidEnd", value);
                      // }}
                    />
                  </div>
                  {/* ICCID TO */}
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <Label>
                      <span className="text-red-500">*</span>ICCID To
                    </Label>
                    <Input
                      {...register("iccidEnd")}
                      className={`col-span-2 ${(errors as any)?.iccidEnd && "border border-red-500 hover:border-red-500"}`}
                      title={`${(errors as any)?.iccidEnd ? `${(errors as any)?.iccidEnd.message}` : `${iccidEnd}`}`}
                      onBlur={async () => {
                        if (iccidBegin && iccidEnd) {
                          const result = await fetchQrySimCardWithUnbinded(
                            iccidBegin,
                            iccidEnd,
                          );

                          if (!result || result.length === 0) {
                            setValue("iccidQuantity", undefined);
                            setValue("iccidEnd", "", {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                            toast.error(
                              "No ICCIDs were found between start ICCID and end ICCID.",
                            );
                            return;
                          } else {
                            setValue("iccidQuantity", Number(result.length));
                          }
                        }
                      }}
                    />
                  </div>
                  {/* ICCID QUANTITY */}
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <Label>ICCID Quantity</Label>
                    <Input
                      {...register("iccidQuantity", { valueAsNumber: true })}
                      className="col-span-2"
                      onBlur={async () => {
                        if (iccidBegin && iccidQuantity) {
                          const result = await fetchQryIccidEndByCount(
                            iccidBegin,
                            iccidQuantity,
                          );

                          if (!result || result.length !== iccidQuantity) {
                            setValue("iccidQuantity", undefined);
                            setValue("iccidEnd", "", {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                            toast.error("No enough ICCIDs were found.");
                            return;
                          }

                          const iccidResult = result[result.length - 1];

                          setValue("iccidEnd", iccidResult.iccid, { shouldValidate: true, shouldDirty: true });
                        }
                      }}
                    />
                  </div>
                  {/* MATCH TYPE */}
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <Label>Match Type</Label>
                    <div className="grid grid-cols-2 col-span-2 gap-2">
                      <Controller
                        name="matchType"
                        control={control}
                        render={({ field }) => (
                          <>
                            <Label className="flex gap-2 cursor-pointer">
                              <input type="radio" value="0" checked={field.value === "0"} onChange={(e) => field.onChange(e.target.value)} className="cursor-pointer" />
                              Sequence
                            </Label>
                            <Label className="flex gap-2 cursor-pointer">
                              <input type="radio" value="1" checked={field.value === "1"} onChange={(e) => field.onChange(e.target.value)} className="cursor-pointer" />
                              Random
                            </Label>
                          </>
                        )}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
          {(actionType === "2" || actionType === "3") && (
            <div className="grid grid-cols-3 items-center mt-4">
              <div className="col-start-2 flex flex-row gap-2">
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx, .xls, .txt, .csv"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple={false}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        ref={uploadBtnRef}
                        type="button"
                        onClick={handleUploadClick}
                      >
                        <MdOutlineFileUpload />
                        Upload
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      className="max-w-sm text-xs"
                      side="bottom"
                      align="start"
                    >
                      <p>
                        <strong>Format:</strong>
                        <br />
                        {actionType === "2" ? "ACC_NBR, ICCID" : "ACC_NBR"}
                      </p>
                      <p className="mt-2">
                        <strong>Note:</strong>
                      </p>
                      <ul className="list-disc ml-4">
                        <li>
                          The require field is{" "}
                          <span className="text-red-500">
                            {actionType === "2" ? "ACC_NBR, ICCID" : "ACC_NBR"}
                          </span>
                        </li>
                        <li>
                          The service number should have a prefix, such as
                          086-1300000001.
                        </li>
                        <li>The file size limit is 2.00MB</li>
                        <li>The maximum files count is 1</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  variant="outline"
                  size="sm"
                  className=""
                  type="button"
                  onClick={handleDownloadTemplate}
                >
                  <MdOutlineFileDownload />
                  <Label>File Template</Label>
                </Button>
              </div>
            </div>
          )}
          {/* QUERY AND RESET */}
          <div className="grid grid-cols-3">
            <div className="col-start-2 flex col-span-2 gap-2">
              <Button
                className="bg-blue-500 text-white"
                size="sm"
                type="submit"
              >
                Query
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
        {/* <div className="">LOG</div> */}
      </div>
      {queryResult && queryResult.length > 0 && (
        <div className="p-2">
          <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
          <Button
            className="mb-2"
            size={"sm"}
            type="button"
            onClick={() => {
              onSubmit(handleReset, actionType);
            }}
          >
            Submit
          </Button>
          </AccessWrapper>
          <DataGridProvider<any>
            columns={columns}
            // key={`${queryTrigger}-${refreshTrigger}`}
            data={queryResult}
            pagination={{ size: 10 }}
            layout={{ card: true }}
            serverSide={false}
            sorting={[{ id: "accNbrId", desc: true }]}
            // onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            //   const page = pageIndex + 1;
            //   setCurrentPage(page);
            //   if (!queryTrigger || isReset) {
            //     return Promise.resolve({ data: [], totalCount: 0 });
            //   }
            //   return fetchAccNbrDetails({
            //     page,
            //     size: pageSize,
            //     sortBy: sorting?.[0].id,
            //     sortDirection: sorting?.[0].desc ? "DESC" : "ASC",
            //     prefix: "670",
            //     spId: 0,
            //   });
            // }}
            getRowProps={(row) => ({
              className:
                row.original.accNbrId === selectedItem?.accNbrId
                  ? selectedRowHighLight
                  : nonSelectedRowHighLight,
              onClick: () => handleRowClick(row.original),
            })}
          />
        </div>
      )}
    </form>
  );
};

export default Main;
