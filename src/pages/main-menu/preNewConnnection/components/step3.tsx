import { DataGridColumnHeader, DataGridProvider, DefaultTooltip, KeenIcon } from "@/components";
import { usePreNew } from "../hooks/context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { queryTempTable } from "../interface";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FormatFileSize } from "../../upload-simcard/utils/FormatFileSize";
import useStep3 from "../services/useStep3";
import { Loading } from "../../role-management/block/loadingBlock";
import { Step3Form, Step3TypeSchema } from "../schema/Step3TypeSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const PncStep3 = () => {
  const {
    handleDownloadTemplate,
    handleUploadClick,
    handleFileChange,
    handleQuery,
    handleRemoveFile,
    handleReset,
    handleRowClick,
    iccidFileInputRef,
    iccidUploadBtnRef,
    serviceNumberFileInputRef,
    serviceNumberUploadBtnRef,
    setTriggerFetch,
    prevAccNbrBegin,
    prevSearchQuantity,
    prevIccidBegin,
    triggerReset,
    setTriggerReset,
  } = useStep3();
  const { form, setForm, resourceType, initialUploadFiles } = usePreNew();

  const schema = Step3TypeSchema(form);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    resetField,
    clearErrors,
    formState: { errors },
    watch,
  } = useForm<Step3Form>({
    resolver: zodResolver(schema),
  });

  const prefixVal = watch("prefix");
  const accNbrBeginVal = watch("accNbrBegin");
  const accNbrEndVal = watch("accNbrEnd");
  const quantityAccNbrVal = watch("quantityAccNbr");
  const quantityIccidVal = watch("quantityIccid");
  const searchQuantityVal = watch("searchQuantity");
  const iccidBeginVal = watch("iccidBegin");
  const iccidEndVal = watch("iccidEnd");

  useEffect(() => {
    setValue("quantityAccNbr", form.quantityAccNbrResp, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [form.quantityAccNbrResp]);

  useEffect(() => {
    setValue("quantityIccid", form.quantityIccidResp, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [form.quantityIccidResp]);

  useEffect(() => {
    clearErrors();

    reset({
      prefix: "",
      accNbrBegin: undefined,
      accNbrEnd: undefined,
      quantityAccNbr: undefined,
      quantityIccid: undefined,
      searchQuantity: undefined,
      iccidBegin: undefined,
      iccidEnd: undefined,
    });

    setForm((prev) => ({
      ...prev,
      accNbrBegin: undefined,
      selectedPrefix: "",
      accNbrEnd: undefined,
      quantityResp: undefined,
      searchQuantity: undefined,
      iccidBegin: undefined,
      iccidEnd: undefined,
    }));

    prevAccNbrBegin.current = undefined;
    prevSearchQuantity.current = undefined;
    prevIccidBegin.current = undefined;
  }, [form.searchType, form.resourceType, form.operationType, triggerReset]);

  //  console.log("errors", errors);

  const columns = useMemo<ColumnDef<queryTempTable>[]>(
    () => [
      {
        id: "serviceNumber",
        accessorFn: (row) => `${row.prefix}-${row.accNbr}`,
        header: ({ column }) => <DataGridColumnHeader title="Service Number" column={column} />,
        cell: ({ row }) => {
          const accNbr = row.original.accNbr.toString().replace("670", "");
          const prefix = row.original.prefix;

          return <div>{`${prefix}-${accNbr}`}</div>;
        },
      },
      {
        id: "iccid",
        accessorFn: (row) => row.iccid,
        header: ({ column }) => <DataGridColumnHeader title="ICCID" column={column} />,
      },
    ],
    [form.tempTable],
  );

  return (
    <form onSubmit={handleSubmit(handleQuery)}>
      <div className="grid grid-cols-2 gap-2 ">
        {form.isLoading && <Loading />}
        <div className="flex flex-row gap-2 items-center">
          <Label className="w-32">Operation Type</Label>
          <div className="flex flex-row flex-1 gap-2">
            <div
              className={`rounded-md border-2 transition-all duration-300 relative py-2 px-4  overflow-hidden input input-sm hover:border-primary max-w-[128px]
                  ${form?.operationType === "0" ? "border-primary cursor-default" : "border-slate-200 text-slate-600 cursor-pointer"}`}
              onClick={() => {
                setForm((prev) => ({
                  ...prev,
                  operationType: "0",
                  uploadFiles: initialUploadFiles,
                }));
              }}
            >
              Select By File
              <div
                className={`bg-primary absolute w-[40px] h-[40px] rotate-45 transition-all duration-300
                      translate-x-1/2 translate-y-1/2 ${form?.operationType === "0" ? "right-0 bottom-0" : "-right-5 -bottom-5"}`}
              >
                <div className="absolute text-white -rotate-45 bottom-2 left-0">
                  <KeenIcon icon="check" />
                </div>
              </div>
            </div>
            <div
              className={`rounded-md border-2 transition-all duration-300 relative py-2 px-4  overflow-hidden input input-sm hover:border-primary max-w-[128px]
                  ${form?.operationType === "1" ? "border-primary cursor-default" : "border-slate-200 text-slate-600 cursor-pointer"}`}
              onClick={() => {
                setForm((prev) => ({
                  ...prev,
                  operationType: "1",
                  uploadFiles: initialUploadFiles,
                }));
              }}
            >
              Batch by Range
              <div
                className={`bg-primary absolute w-[40px] h-[40px] rotate-45 transition-all duration-300
                      translate-x-1/2 translate-y-1/2 ${form?.operationType === "1" ? "right-0 bottom-0" : "-right-5 -bottom-5"}`}
              >
                <div className="absolute text-white -rotate-45 bottom-2 left-0">
                  <KeenIcon icon="check" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Label className="w-32">
            <span className="text-red-500">*</span>Resource Type
          </Label>
          <div className="input input-sm flex-1 max-w-[360px]">
            <Select
              value={form.resourceType}
              onValueChange={(val) => {
                setForm((prev) => ({
                  ...prev,
                  resourceType: val,
                  uploadFiles: initialUploadFiles,
                }));
              }}
            >
              <SelectTrigger className="bg-transparant border-none">
                <SelectValue placeholder={"Please Select"} />
              </SelectTrigger>
              <SelectContent side="bottom">
                {resourceType.map((item) => (
                  <SelectItem key={item.key} value={item.key ?? ""}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {form.operationType === "0" && form.resourceType != "0" && (
          <div>
            <div className="flex flex-row gap-2 items-center">
              <Label className="w-32">
                <span className="text-red-500">*</span>ICCID
              </Label>
              <div className="flex flex-row flex-1 gap-2">
                <input type="file" className="hidden" accept=".xlsx, .xls" ref={iccidFileInputRef} onChange={handleFileChange("ICCID")} multiple={false} />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" ref={iccidUploadBtnRef} type="button" onClick={() => handleUploadClick("ICCID")}>
                        <KeenIcon icon="file-up" />
                        Select Files
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm text-xs" side="bottom" align="start">
                      <p>
                        <strong>Format:</strong>
                        <br />
                        ICCID
                      </p>
                      <p className="mt-2">
                        <strong>Note:</strong>
                      </p>
                      <ul className="list-disc ml-4">
                        <li>
                          The require field is <span className="text-red-500">ICCID</span>
                        </li>
                        <li>The file size limit is 30.00MB</li>
                        <li>The maximum files count is 20</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button variant="outline" size="sm" className="" type="button" onClick={() => handleDownloadTemplate("ICCID")}>
                  <KeenIcon icon="file-down" />
                  <Label>File Template</Label>
                </Button>
              </div>
            </div>
            {form.uploadFiles?.ICCID.files &&
              form.uploadFiles?.ICCID.files.length > 0 &&
              form.uploadFiles?.ICCID.files?.map((item, idx) => (
                <div className="flex">
                  <span className="w-32"></span>
                  <div key={idx} className="flex items-center gap-2 text-sm bg-blue-100 border rounded px-3 py-2 m-1 justify-between h-8">
                    <DefaultTooltip title={`${item.name} (${FormatFileSize(item.size)})`}>
                      <span className="ml-2 text-sm max-w-[180px] truncate text-gray-700">{`${item.name} (${FormatFileSize(item.size)})`}</span>
                    </DefaultTooltip>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="hover:bg-blue-100"
                      onClick={() => {
                        handleRemoveFile("ICCID", idx);
                        if (iccidFileInputRef.current) {
                          iccidFileInputRef.current.value = "";
                        }
                      }}
                    >
                      <KeenIcon icon="cross" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
        {form.operationType === "0" && form.resourceType != "1" && (
          <div>
            <div className="flex flex-row gap-2 items-center">
              <Label className="w-32">
                <span className="text-red-500">*</span>Service Number
              </Label>
              <div className="flex flex-row flex-1 gap-2">
                <input type="file" className="hidden" accept=".xlsx, .xls, .txt, .csv" ref={serviceNumberFileInputRef} onChange={handleFileChange("SERVICENUMBER")} multiple={false} />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" ref={serviceNumberUploadBtnRef} type="button" onClick={() => handleUploadClick("SERVICENUMBER")}>
                        <KeenIcon icon="file-up" />
                        Select Files
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm text-xs" side="bottom" align="start">
                      <p>
                        <strong>Format:</strong>
                        <br />
                        ACC_NBR
                      </p>
                      <p className="mt-2">
                        <strong>Note:</strong>
                      </p>
                      <ul className="list-disc ml-4">
                        <li>
                          The require field is <span className="text-red-500">ACC_NBR</span>
                        </li>
                        <li>The service number should have a prefix, such as 670-1300000001</li>
                        <li>The file size limit is 30.00MB</li>
                        <li>The maximum files count is 20</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button variant="outline" size="sm" className="" type="button" onClick={() => handleDownloadTemplate("SERVICENUMBER")}>
                  <KeenIcon icon="file-down" />
                  <Label>File Template</Label>
                </Button>
              </div>
            </div>
            {form.uploadFiles?.SERVICENUMBER.files &&
              form.uploadFiles?.SERVICENUMBER.files.length > 0 &&
              form.uploadFiles?.SERVICENUMBER.files.map((item, idx) => (
                <div className="flex">
                  <span className="w-32"></span>
                  <div key={idx} className="flex items-center gap-2 text-sm bg-blue-100 border rounded px-3 py-2 m-1 justify-between h-8">
                    <DefaultTooltip title={`${item.name} (${FormatFileSize(item.size)})`}>
                      <span className="ml-2 text-sm max-w-[180px] truncate text-gray-700">{`${item.name} (${FormatFileSize(item.size)})`}</span>
                    </DefaultTooltip>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="hover:bg-blue-100"
                      onClick={() => {
                        handleRemoveFile("SERVICENUMBER", idx);
                        if (serviceNumberFileInputRef.current) {
                          serviceNumberFileInputRef.current.value = "";
                        }
                      }}
                    >
                      <KeenIcon icon="cross" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
        {form.operationType === "1" && (
          <>
            <div className="flex flex-row gap-2 items-center">
              <Label className="w-32">Search Type</Label>

              <div className="flex flex-row flex-1 gap-4 items-center">
                <label className="flex flex-row gap-2 items-center input-sm cursor-pointer">
                  <Input type="radio" name="searchType" value="0" className="w-[14px] h-[14px] accent-primary" checked={form.searchType === "0"} onChange={(e) => setForm({ ...form, searchType: e.target.value })} />
                  By Region
                </label>

                <label className="flex flex-row gap-2 items-center input-sm cursor-pointer">
                  <Input type="radio" name="searchType" value="1" className="w-[14px] h-[14px] accent-primary" checked={form.searchType === "1"} onChange={(e) => setForm({ ...form, searchType: e.target.value })} />
                  By Quantity
                </label>
              </div>
            </div>
            {form.operationType === "1" && form.searchType === "1" && (
              <div className="flex flex-row gap-2 items-center">
                <Label className="w-32">
                  <span className="text-red-500">*</span>Search Quantity
                </Label>
                <div className={`input input-sm flex-1 max-w-[360px] ${errors.searchQuantity ? "border-red-500 hover:border-red-500" : ""}`}>
                  <Input
                    className="border-none"
                    value={!searchQuantityVal ? "" : (searchQuantityVal ?? "")}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");

                      setForm((prev) => ({
                        ...prev,
                        searchQuantity: Number(value),
                      }));

                      setValue("searchQuantity", Number(value), {
                        shouldValidate: true,
                      });
                    }}
                    onBlur={(e) => {
                      const value = e.target.value.replace(/\D/g, "");

                      setForm((prev) => ({
                        ...prev,
                        searchQuantity: Number(value) ?? undefined,
                      }));

                      setValue("searchQuantity", Number(value) ?? undefined, {
                        shouldValidate: true,
                      });

                      if (value && form.searchQuantity) {
                        setTriggerFetch(true);
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
        {form.operationType === "1" && form.resourceType != "1" && (
          <div className=" gap-2 items-center col-span-2 grid grid-cols-5">
            <div className="col-span-5 flex flex-row gap-2 items-center">
              <div className="w-1 h-6 bg-primary rounded-md"></div>
              <Label className="w-32">Service Number</Label>
            </div>
            <div className="col-span-2 flex flex-row gap-2 items-center">
              <Label className="w-32">
                <span className="text-red-500">*</span>Service Number From
              </Label>
              <div className="flex-1 flex flex-row items-center gap-1 max-w-[360px]">
                <div className={`input input-sm flex flex-row p-0 w-[100px] ${errors.prefix ? "border-red-500 hover:border-red-500" : ""}`}>
                  <Select
                    onValueChange={(val) => {
                      setForm((prev) => ({
                        ...prev,
                        selectedPrefix: val,
                      }));

                      setValue("prefix", val, { shouldValidate: true });

                      if (val && form.accNbrBegin) {
                        setTriggerFetch(true);
                      }
                    }}
                    value={prefixVal ?? ""}
                  >
                    <SelectTrigger className="bg-transparent border-none">
                      <SelectValue placeholder="Select..." />
                      {prefixVal && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="p-0 mr-2 w-[20px] h-[20px]"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              selectedPrefix: "",
                            }));

                            setValue("prefix", "", { shouldValidate: true });
                          }}
                        >
                          <KeenIcon icon="cross" />
                        </Button>
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="670">670</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className={`input input-sm flex-1 ${errors.accNbrBegin ? "border-red-500 hover:border-red-500" : ""}`}>
                  <Input
                    className="border-none"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setForm((prev) => ({
                        ...prev,
                        accNbrBegin: value,
                      }));

                      setValue("accNbrBegin", value, { shouldValidate: true });
                    }}
                    value={accNbrBeginVal ?? ""}
                    onBlur={(e) => {
                      const value = e.target.value;

                      setForm((prev) => ({
                        ...prev,
                        accNbrBegin: value,
                        accNbrEnd: form.searchType === "0" ? value : undefined,
                      }));

                      setValue("accNbrBegin", value, { shouldValidate: true });
                      setValue("accNbrEnd", form.searchType === "0" ? value : undefined, { shouldValidate: true });

                      if (value && form.selectedPrefix) {
                        setTriggerFetch(true);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            {form.searchType === "0" && (
              <>
                <div className="col-span-2 flex flex-row gap-2 items-center">
                  <Label className="w-32">
                    <span className="text-red-500">*</span>Service Number To
                  </Label>
                  <div className="flex-1 flex flex-row items-center gap-1 max-w-[360px]">
                    <div className={`input input-sm flex flex-row p-0 w-[100px] ${errors.prefix ? "border-red-500 hover:border-red-500" : ""}`}>
                      <Select
                        onValueChange={(val) => {
                          setForm((prev) => ({
                            ...prev,
                            selectedPrefix: val,
                          }));

                          setValue("prefix", val, { shouldValidate: true });

                          // if (val && form.accNbrEnd) {
                          //   setTriggerFetch(true);
                          // }
                        }}
                        value={prefixVal ?? ""}
                      >
                        <SelectTrigger className="bg-transparent border-none">
                          <SelectValue placeholder="Select..." />
                          {prefixVal && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="p-0 mr-2 w-[20px] h-[20px]"
                              onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  selectedPrefix: "",
                                }));

                                setValue("prefix", "", {
                                  shouldValidate: true,
                                });
                              }}
                            >
                              <KeenIcon icon="cross" />
                            </Button>
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="670">670</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className={`input input-sm flex-1 ${errors.accNbrEnd ? "border-red-500 hover:border-red-500" : ""}`}>
                      <Input
                        className="border-none"
                        value={accNbrEndVal ?? ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setForm((prev) => ({
                            ...prev,
                            accNbrEnd: value,
                          }));

                          setValue("accNbrEnd", value, {
                            shouldValidate: true,
                          });
                        }}
                        onBlur={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setForm((prev) => ({
                            ...prev,
                            accNbrEnd: value,
                          }));

                          setValue("accNbrEnd", value, {
                            shouldValidate: true,
                          });

                          if (value && form.accNbrEnd) {
                            setTriggerFetch(true);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <Label className="w-32 flex-1">
                    <span className="text-red-500">*</span>Quantity
                  </Label>
                  <div className={`input input-sm flex-1 max-w-[360px] ${errors.quantityAccNbr ? "border-red-500 hover:border-red-500" : ""}`}>
                    <Input className="border-none" value={quantityAccNbrVal ?? ""} readOnly />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {form.operationType === "1" && form.resourceType != "0" && (
          <div className=" gap-2 items-center col-span-2 grid grid-cols-5">
            <div className="col-span-5 flex flex-row gap-2 items-center">
              <div className="w-1 h-6 bg-primary rounded-md"></div>
              <Label className="w-32">ICCID</Label>
            </div>
            <div className="col-span-2 flex flex-row gap-2 items-center">
              <Label className="w-32">
                <span className="text-red-500">*</span>ICCID From
              </Label>
              <div className={`input input-sm flex-1 max-w-[360px] ${errors.iccidBegin ? "border-red-500 hover:border-red-500" : ""}`}>
                <Input
                  className="border-none"
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      iccidBegin: value,
                    }));

                    setValue("iccidBegin", value, { shouldValidate: true });
                  }}
                  value={iccidBeginVal ?? ""}
                  onBlur={(e) => {
                    const value = e.target.value;

                    setForm((prev) => ({
                      ...prev,
                      iccidBegin: value,
                      iccidEnd: form.searchType === "0" ? value : undefined,
                    }));

                    setValue("iccidBegin", value, { shouldValidate: true });
                    setValue("iccidEnd", form.searchType === "0" ? value : undefined, { shouldValidate: true });

                    if (value) {
                      setTriggerFetch(true);
                    }
                  }}
                />
              </div>
            </div>
            {form.searchType === "0" && (
              <>
                <div className="col-span-2 flex flex-row gap-2 items-center">
                  <Label className="w-32">
                    <span className="text-red-500">*</span>ICCID To
                  </Label>
                  <div className={`input input-sm flex-1 max-w-[360px] ${errors.iccidEnd ? "border-red-500 hover:border-red-500" : ""}`}>
                    <Input
                      className="border-none"
                      value={iccidEndVal ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          iccidEnd: value,
                        }));

                        setValue("iccidEnd", value, { shouldValidate: true });
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          iccidEnd: value,
                        }));

                        setValue("iccidEnd", value, { shouldValidate: true });
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <Label className="w-32 flex-1">
                    <span className="text-red-500">*</span>Quantity
                  </Label>
                  <div className={`input input-sm flex-1 max-w-[360px] ${errors.quantityIccid ? "border-red-500 hover:border-red-500" : ""}`}>
                    <Input className="border-none" value={quantityIccidVal ?? ""} readOnly />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        <div className="col-span-2 flex justify-end gap-2 p-5">
          <Button type="submit" variant="default" size="sm" onClick={handleQuery}>
            Query
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} type="button">
            Reset
          </Button>
        </div>
        {form.tempTable && form.tempTable.length > 0 && (
          <div className="col-span-2">
            <DataGridProvider<queryTempTable>
              columns={columns}
              key={`grid-${form.tempTable}`}
              data={form.tempTable}
              pagination={{ size: 10 }}
              layout={{ card: true }}
              serverSide={false}
              sorting={[{ id: "accNbrId", desc: true }]}
              getRowProps={(row) => ({
                className: row.original.accNbrId === form.selectedItemStep3?.accNbrId ? selectedRowHighLight : nonSelectedRowHighLight,
                onClick: () => handleRowClick(row.original),
              })}
            />
          </div>
        )}
      </div>
    </form>
  );
};

export default PncStep3;
