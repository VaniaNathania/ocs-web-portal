import { ArrowLeft } from "lucide-react";
import { useAdviceTypeContext } from "../hooks/useAdviceTypeContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import AdviceTypeAction from "../action/AdviceTypeAction";
import { adviceTypeContentProps, initialPropsAdviceTypeContent } from "../hooks/AdviceTypeContext";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { comment } from "stylis";

const API_URL_REF = apiConfigRef.ref;

export const formatDateTime = (value: string) => {
  return value.includes(":") && value.length === 16 ? `${value}:00` : value;
};

const AddDialog = () => {
  const { PostData } = useCallApi();
  const { setShowAddView, setShowTemplateDefinition, handleSelectedContent, setShowSenderParameter, fetchingListContent, selectedMessageChannel, setSelectedMessageChannel, selectedChildrenSide, selectedSubChildrenSide, selectedParentAdviceType, setSelectedParentAdviceType, dataTableContext, isLoadingList, parentAdviceTypeOpen, setParentAdviceTypeOpen, formData, setFormData, setSelectedParentSide, setIsAddingData, setSelectedContent, setSelectedSubChildrenSide } = useAdviceTypeContext();
  const { messageChannel, fetchMessageChannel, messageLoading } = AdviceTypeAction();
  const [messageChannelOpen, setMessageChannelOpen] = useState(false);
  // const [formData, setFormData] = useState<adviceTypeContentProps>(initialPropsAdviceTypeContent);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const column = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "language",
        accessorFn: (row) => row.language,
        header: ({ column }) => <DataGridColumnHeader column={column} className="" title="Language" />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "templateDefinition",
        accessorFn: (row) => row.templateDefinition,
        header: ({ column }) => <DataGridColumnHeader column={column} className="" title="Template Definition" />,
        enableSorting: true,
        enableHiding: false,
      },
    ],
    [],
  );

  const validateForm = () => {
    let requiredFields =
      selectedMessageChannel === "LETTER"
        ? [
            { key: "adviceChannel", label: "Advice channel" },
            { key: "stdCode", label: "Standard code" },
          ]
        : [
            { key: "adviceChannel", label: "Advice channel" },
            { key: "stdCode", label: "Standard code" },
            { key: "adviceTypeName", label: "Template name" },
            { key: "msgDefine", label: "Template Definition" },
          ];

    const newErrors: Record<string, string> = {};
    let isValid = true;

    setAlert({ show: false, message: "" });

    requiredFields.forEach(({ key, label }) => {
      let value;
      value = formData[key as keyof adviceTypeContentProps];

      const isEmpty = value === "" || value === null || value === undefined;

      if (isEmpty) {
        newErrors[key] = `${label} is required`;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (!isValid) {
      toast.error("Please fill in all required fields");
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setAlert({ show: false, message: "" });
    setErrors({});
    setIsAddingData(true);

    const currentChild = selectedChildrenSide;
    const currentSubChild = selectedSubChildrenSide;

    try {
      const formatSenderParamForPayload = (senderParam: Record<string, string>) => {
        return Object.entries(senderParam)
          .map(([k, v]) => `${k}="${v}"`)
          .join(" ");
      };

      let payload: any = {
        adviceTypeName: formData?.adviceTypeName,
        adviceChannel: formData?.adviceChannel,
        adviceChannelName: formData?.adviceChannelName,
        isHis: formData?.isHis,
        disabled: formData?.disabled,
        effTime: formData?.effTime,
        expTime: formData?.expTime,
        msgDefine: formData?.msgDefine,
        comments: formData?.comments,
        delayTime: formData?.delayTime,
        stdCode: formData?.stdCode,
        priority: formData?.priority,
        srcNbr: formData?.srcNbr,
        senderParam: formatSenderParamForPayload(formData?.senderParam || {}),
        adviceType: formData?.adviceType,
        times: formData?.times,
        timeInterval: formData?.timeInterval,
        parentAdviceType: formData?.parentAdviceType,
        adviceCatg: selectedChildrenSide?.value,
        // adviceTypeSortId: selectedSubChildrenSide?.adviceTypeSortId,
        adviceParamCode: formData?.adviceParamCode,
        adviceTypeSortId: 0,
      };

      // if (selectedMessageChannel === "LETTER") {
      //   delete payload.adviceTypeName;
      // }

      if (selectedSubChildrenSide) {
        payload.adviceCatg = selectedSubChildrenSide?.adviceCatg;
        payload.adviceTypeSortId = selectedSubChildrenSide?.adviceTypeSortId;
      }

      const response = await PostData(`${API_URL_REF}/api/advice-type/add-advice-type`, payload);

      if (response?.status) {
        toast.success("Advice type created successfully!");
        setFormData(initialPropsAdviceTypeContent);
        setShowAddView(false);
        if (currentSubChild) {
          setSelectedSubChildrenSide(currentSubChild);
        }

        setIsAddingData(false);

        await fetchingListContent();
      } else {
        const errorMessage = response?.message || "Failed to create advice type. Please try again.";
        toast.error(errorMessage);
        console.error("❌ API returned error:", response);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Something went wrong. Please try again.";
      console.error("❌ Error creating advice type:", error);
      toast.error(errorMessage);
      setIsAddingData(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const senderParamText = Object.entries(formData.senderParam ?? {})
    .map(([k, v]) => `${k}=\\"${v}\\"`)
    .join(" | ");

  //reset error di template definition
  useEffect(() => {
    if (formData.msgDefine && errors.msgDefine) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.msgDefine;
        return newErrors;
      });
    }
  }, [formData.msgDefine]);

  return (
    <>
      {selectedMessageChannel === "LETTER" ? (
        <>
          <div className="flex flex-col min-h-[calc(50vh-4rem)] mt-3 mx-2 sm:mx-3 border shadow-md p-3 sm:p-4 gap-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowAddView(false);
                  setSelectedMessageChannel(null);
                  setSelectedParentSide(null);
                  setSelectedContent(null);
                  setIsAddingData(false);
                  setFormData(initialPropsAdviceTypeContent);
                  if (dataTableContext.length > 0) {
                    handleSelectedContent(dataTableContext[0]);
                  }
                }}
                className="p-1 hover:bg-accent rounded-md"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base sm:text-lg font-semibold">Detail</h2>
            </div>

            <div className="flex-1 overflow-auto p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-5">
                {/* Message Channel */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">
                    <span className="text-red-500">*</span>
                    Message Channel
                  </label>
                  <Select
                    open={messageChannelOpen}
                    onOpenChange={(open) => {
                      setMessageChannelOpen(open);
                      if (open && messageChannel.length === 0 && !messageLoading) {
                        fetchMessageChannel();
                      }
                    }}
                    value={formData?.adviceChannel?.toString() || ""}
                    onValueChange={(value) => {
                      const selected = messageChannel.find((item) => item.adviceChannel === value);
                      setFormData({
                        ...formData,
                        adviceChannel: value,
                      });
                      setSelectedMessageChannel(selected?.adviceChannelName || "");
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-64 h-8">
                      <SelectValue placeholder="Select Message Channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {messageLoading && <SelectItem value="loading">Loading...</SelectItem>}
                      {!messageLoading && messageChannel.length === 0 && <SelectItem value="empty">No data available</SelectItem>}
                      {!messageLoading &&
                        messageChannel.map((item) => (
                          <SelectItem key={item.adviceChannel} value={item.adviceChannel}>
                            {item.adviceChannelName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Standard Code */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0 sm:pt-1">
                    <span className="text-red-500">*</span>
                    Standard Code
                  </label>
                  <div className="flex flex-col gap-1 w-full">
                    <Input
                      value={formData.stdCode}
                      onChange={(e) => {
                        setFormData({ ...formData, stdCode: e.target.value });
                        setErrors({ ...errors, stdCode: "" });
                      }}
                      className={`w-full h-8 sm:w-64 ${errors.stdCode ? "border-red-500" : ""}`}
                      placeholder="Input Standard Code"
                    />
                    {errors.stdCode && <span className="text-red-500 text-xs">{errors.stdCode}</span>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="font-medium text-sm">Please choose template files (the first one is main file)</h2>
                <Input
                  type="file"
                  className="w-full max-w-md"
                  value={formData?.adviceTypeName ?? ""}
                  onChange={(e) => {
                    setFormData({ ...formData, adviceTypeName: e.target.value });
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                variant="default"
                className="text-sm px-5 w-full sm:w-auto"
                onClick={() => {
                  handleSubmit();
                }}
                disabled={isSubmitting}
              >
                Submit
              </Button>
              <Button
                variant="outline"
                className="text-sm px-5 w-full sm:w-auto"
                onClick={() => {
                  setShowAddView(false);
                  setFormData(initialPropsAdviceTypeContent);
                  setSelectedMessageChannel(null);
                  setIsAddingData(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col min-h-[calc(100vh-4rem)] mt-3 mx-2 sm:mx-3 border shadow-md p-3 sm:p-4 gap-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowAddView(false);
                  setSelectedMessageChannel(null);
                  setFormData(initialPropsAdviceTypeContent);
                }}
                className="p-1 hover:bg-accent rounded-md"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base sm:text-lg font-semibold">Add Advice Type</h2>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-2">
              {alert.show && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{alert.message}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-5">
                {/* Message Channel */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0 sm:pt-1">
                    <span className="text-red-500">*</span>
                    Message Channel
                  </label>
                  <div className="flex flex-col gap-1 w-full sm:w-64">
                    <Select
                      open={messageChannelOpen}
                      onOpenChange={(open) => {
                        setMessageChannelOpen(open);
                        if (open && messageChannel.length === 0 && !messageLoading) {
                          fetchMessageChannel();
                        }
                      }}
                      value={formData.adviceChannel?.toString() || ""}
                      onValueChange={(value) => {
                        const selected = messageChannel.find((item) => item.adviceChannel === value);
                        setFormData({
                          ...formData,
                          adviceChannel: value,
                        });
                        setErrors({ ...errors, adviceChannel: "" });
                        setSelectedMessageChannel(selected?.adviceChannelName || "");
                      }}
                    >
                      <SelectTrigger className={`w-full h-8 ${errors.adviceChannel ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select Message Channel" />
                      </SelectTrigger>
                      <SelectContent>
                        {messageLoading && <SelectItem value="loading">Loading...</SelectItem>}
                        {!messageLoading && messageChannel.length === 0 && <SelectItem value="empty">No data available</SelectItem>}
                        {!messageLoading &&
                          messageChannel.map((item) => (
                            <SelectItem key={item.adviceChannel} value={item.adviceChannel}>
                              {item.adviceChannelName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {errors.adviceChannel && <span className="text-red-500 text-xs">{errors.adviceChannel}</span>}
                  </div>
                </div>

                {/* Standard Code */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0 sm:pt-1">
                    <span className="text-red-500">*</span>
                    Standard Code
                  </label>
                  <div className="flex flex-col gap-1 w-full sm:w-64">
                    <Input
                      value={formData.stdCode}
                      onChange={(e) => {
                        setFormData({ ...formData, stdCode: e.target.value });
                        setErrors({ ...errors, stdCode: "" });
                      }}
                      className={`w-full h-8 ${errors.stdCode ? "border-red-500" : ""}`}
                      placeholder="Input Standard Code"
                    />
                    {errors.stdCode && <span className="text-red-500 text-xs">{errors.stdCode}</span>}
                  </div>
                </div>

                {/* Template Name */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0 sm:pt-1">
                    <span className="text-red-500">*</span>
                    Template Name
                  </label>
                  <div className="flex flex-col gap-1 w-full sm:w-64">
                    <Input
                      value={formData.adviceTypeName ?? ""}
                      onChange={(e) => {
                        setFormData({ ...formData, adviceTypeName: e.target.value });
                        setErrors({ ...errors, adviceTypeName: "" });
                      }}
                      className={`w-full h-8 ${errors.adviceTypeName ? "border-red-500" : ""}`}
                      placeholder="Input Template Name"
                    />
                    {errors.adviceTypeName && <span className="text-red-500 text-xs">{errors.adviceTypeName}</span>}
                  </div>
                </div>

                {/* Template Definition */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0 sm:pt-1">
                    <span className="text-red-500">*</span>
                    Template Definition
                  </label>
                  <div className="flex flex-col gap-1 w-full sm:w-64">
                    <div className="relative">
                      <Input value={formData.msgDefine} className={`w-full h-8 bg-gray-100 pr-10 cursor-pointer ${errors.msgDefine ? "border-red-500" : ""}`} onClick={() => setShowTemplateDefinition(true)} readOnly disabled={selectedMessageChannel === null} />
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-500">
                        <button className="text-gray-500 hover:text-gray-700 disabled:opacity-50 p-1" title="Select Template" onClick={() => setShowTemplateDefinition(true)} disabled={selectedMessageChannel === null}>
                          <KeenIcon icon="notepad-edit" />
                        </button>
                      </div>
                    </div>
                    {errors.msgDefine && <span className="text-red-500 text-xs">{errors.msgDefine}</span>}
                  </div>
                </div>

                {/* Retain History */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">Retain History</label>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="radio"
                        value="Y"
                        checked={formData.isHis === "Y"}
                        onChange={(e) => {
                          setFormData({ ...formData, isHis: e.target.value });
                          setErrors({ ...errors, isHis: "" });
                        }}
                      />
                      <label className="text-sm">Yes</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="radio"
                        value="N"
                        checked={formData.isHis === "N"}
                        onChange={(e) => {
                          setFormData({ ...formData, isHis: e.target.value });
                          setErrors({ ...errors, isHis: "" });
                        }}
                      />
                      <label className="text-sm">No</label>
                    </div>
                  </div>
                </div>

                {/* Disabled */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">Disabled</label>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="radio"
                        value="Y"
                        checked={formData.disabled === "Y"}
                        onChange={(e) => {
                          setFormData({ ...formData, disabled: e.target.value });
                          setErrors({ ...errors, disabled: "" });
                        }}
                      />
                      <label className="text-sm">Yes</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="radio"
                        value="N"
                        checked={formData.disabled === "N"}
                        onChange={(e) => {
                          setFormData({ ...formData, disabled: e.target.value });
                          setErrors({ ...errors, disabled: "" });
                        }}
                      />
                      <label className="text-sm">No</label>
                    </div>
                  </div>
                </div>

                {/* Effective Time */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">Effective Time</label>
                  <input
                    type="datetime-local"
                    value={formData.effTime || ""}
                    onChange={(e) => {
                      setFormData({ ...formData, effTime: formatDateTime(e.target.value) });
                      setErrors({ ...errors, effTime: "" });
                    }}
                    className="w-full sm:w-64 h-8 border rounded-md border-gray-300 text-sm px-2"
                  />
                </div>

                {/* Expiry Time */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">Expiry Time</label>
                  <input
                    type="datetime-local"
                    value={formData.expTime || ""}
                    onChange={(e) => {
                      setFormData({ ...formData, expTime: formatDateTime(e.target.value) });
                      setErrors({ ...errors, expTime: "" });
                    }}
                    className="w-full sm:w-64 h-8 border rounded-md border-gray-300 text-sm px-2"
                  />
                </div>

                {/* Parent Advice Type */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">Parent Advice Type</label>
                  <Select
                    open={parentAdviceTypeOpen}
                    onOpenChange={(open) => {
                      setParentAdviceTypeOpen(open);
                      if (open && dataTableContext.length === 0 && !isLoadingList) {
                        fetchingListContent();
                      }
                    }}
                    value={formData.parentAdviceType ? String(formData.parentAdviceType) : ""}
                    onValueChange={(value) => {
                      const selected = dataTableContext.find((item) => String(item.adviceType) === String(value));
                      setFormData({
                        ...formData,
                        parentAdviceType: String(value),
                      });
                      setSelectedParentAdviceType(selected?.adviceTypeName || "");
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-64 h-8">
                      <SelectValue placeholder="--Please Select--">{selectedParentAdviceType || "--Please Select--"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingList && (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      )}
                      {!isLoadingList && dataTableContext.length === 0 && (
                        <SelectItem value="empty" disabled>
                          No Data Available
                        </SelectItem>
                      )}
                      {!isLoadingList &&
                        dataTableContext.map((item) => (
                          <SelectItem key={item.adviceType} value={String(item.adviceType)}>
                            {item.adviceTypeName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">Priority</label>
                  <NumericFormat
                    value={formData.priority ?? null}
                    thousandSeparator="."
                    decimalSeparator=","
                    allowNegative={false}
                    onValueChange={(e) => {
                      const newValue = e.floatValue === undefined ? null : e.floatValue;
                      setFormData({ ...formData, priority: String(newValue ?? "") });
                    }}
                    className="w-full sm:w-64 h-8 input"
                    placeholder="Input priority"
                  />
                </div>

                {/* Source Number */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">[Source] Number</label>
                  <NumericFormat
                    value={formData.srcNbr ?? null}
                    thousandSeparator="."
                    decimalSeparator=","
                    allowNegative={false}
                    onValueChange={(e) => {
                      const newValue = e.floatValue === undefined ? null : e.floatValue;
                      setFormData({ ...formData, srcNbr: String(newValue ?? "") });
                    }}
                    className="w-full sm:w-64 h-8 input"
                    placeholder="Input source number"
                  />
                </div>

                {/* Delay Time */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">Delay Time (second)</label>
                  <NumericFormat
                    value={formData.delayTime ?? null}
                    thousandSeparator="."
                    decimalSeparator=","
                    allowNegative={false}
                    onValueChange={(e) => {
                      const newValue = e.floatValue === undefined ? null : e.floatValue;
                      setFormData({ ...formData, delayTime: String(newValue ?? "") });
                    }}
                    className="w-full sm:w-64 h-8 input"
                    placeholder="Input delay time"
                  />
                </div>

                {/* Message Catalog */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">Message Catalog</label>
                  <Select
                    value={selectedChildrenSide?.value || formData.adviceCatg || ""}
                    onValueChange={(value) => {
                      setFormData({ ...formData, adviceCatg: value });
                      setErrors({ ...errors, adviceCatg: "" });
                    }}
                    disabled={true}
                  >
                    <SelectTrigger className="w-full sm:w-64 h-8">
                      <SelectValue placeholder="Select Message Catalog" />
                    </SelectTrigger>
                    <SelectContent>{selectedChildrenSide ? <SelectItem value={selectedChildrenSide.value}>{selectedChildrenSide.lookupName}</SelectItem> : <SelectItem value="empty">No catalog selected</SelectItem>}</SelectContent>
                  </Select>
                </div>

                {/* Sender Parameter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">Sender Parameter</label>
                  <div className="relative w-full sm:w-64">
                    <Input readOnly value={senderParamText} className="w-full h-8 bg-gray-100 pr-10 cursor-pointer" onClick={() => setShowSenderParameter(true)} title={senderParamText} disabled={selectedMessageChannel === null} />
                    <button className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-500" title="Select sender parameter" onClick={() => setShowSenderParameter(true)} disabled={selectedMessageChannel === null}>
                      <KeenIcon icon="notepad-edit" />
                    </button>
                  </div>
                </div>

                {/* Send Time */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">Send Time</label>
                  <NumericFormat
                    value={formData.times ?? null}
                    thousandSeparator="."
                    decimalSeparator=","
                    allowNegative={false}
                    onValueChange={(e) => {
                      const newValue = e.floatValue === undefined ? null : e.floatValue;
                      setFormData({ ...formData, times: String(newValue ?? "") });
                    }}
                    className="w-full sm:w-64 h-8 input"
                    placeholder="Input send time"
                  />
                </div>

                {/* Send Time Interval */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">Send Time Interval</label>
                  <NumericFormat
                    value={formData.timeInterval || undefined}
                    thousandSeparator="."
                    decimalSeparator=","
                    allowNegative={false}
                    onValueChange={(e) => {
                      setFormData({
                        ...formData,
                        timeInterval: e.floatValue !== undefined ? String(e.floatValue) : "",
                      });
                    }}
                    className="w-full sm:w-64 h-8 input"
                    placeholder="Input send time interval"
                  />
                </div>

                {/* Remarks */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 md:col-span-2 xl:col-span-2">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">Remarks</label>
                  <Input
                    value={formData.comments || ""}
                    onChange={(e) => {
                      setFormData({ ...formData, comments: e.target.value });
                      setErrors({ ...errors, comments: "" });
                    }}
                    className="w-full sm:flex-1 h-8"
                    placeholder="Input Remarks"
                  />
                </div>
              </div>

              <div className="border-t border-gray-400 pt-5">
                <h2 className="text-base sm:text-lg font-semibold mb-3">Multi-Language</h2>
                <div className="overflow-x-auto">
                  <DataGridProvider columns={column} />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                variant="default"
                className="text-sm px-5 w-full sm:w-auto order-1 sm:order-none"
                onClick={() => {
                  handleSubmit();
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
              <Button
                variant="outline"
                className="text-sm px-5 w-full sm:w-auto order-2 sm:order-none"
                onClick={() => {
                  setShowAddView(false);
                  setSelectedMessageChannel(null);
                  setFormData(initialPropsAdviceTypeContent);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AddDialog;
