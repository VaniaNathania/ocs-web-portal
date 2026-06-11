import { ArrowLeft } from "lucide-react";
import { useAdviceTypeContext } from "../hooks/useAdviceTypeContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import AdviceTypeAction from "../action/AdviceTypeAction";
import { adviceTypeContentProps, adviceTypeLangProps, initialPropsAdviceTypeContent } from "../hooks/AdviceTypeContext";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { formatDateTime } from "../blocks/AddDialog";
import { NumericFormat } from "react-number-format";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const API_URL_REF = apiConfigRef.ref;

const DetailContent = () => {
  const { PutData } = useCallApi();
  const { setShowTemplateDefinition, handleSelectedContent, setShowSenderParameter, setSelectedMessageChannel, selectedMessageChannel, contentDetail, setContentDetail, showDetailContent, setShowDetailContent, selectedContent, selectedChildrenSide, showDeleteDialog, setShowDeleteDialog, fetchingListContent, dataTableContext, isLoadingList, selectedParentAdviceType, setSelectedParentAdviceType, parentAdviceTypeOpen, setParentAdviceTypeOpen, formData, setFormData, isEditMode, setIsEditMode, setShowTemplateMulti, adviceTypeLangList, setAdviceTypeLangList, selectedLangData, setSelectedLangData, setSelectedLangId, setTemplateDefinitionLang, deleteAdviceTypeLang, menuPrivAccess } = useAdviceTypeContext();
  const { messageChannel, fetchMessageChannel, messageLoading, multiLang, fetchingMultiLang } = AdviceTypeAction();
  const [messageChannelOpen, setMessageChannelOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [originalAdviceTypeLangList, setOriginalAdviceTypeLangList] = useState<adviceTypeLangProps[]>([]);

  const parseSenderParam = (senderParamString: string | Record<string, string>): Record<string, string> => {
    if (typeof senderParamString === "object" && senderParamString !== null) {
      return senderParamString;
    }

    if (typeof senderParamString === "string" && senderParamString) {
      const params: Record<string, string> = {};
      const regex = /(\w+)="([^"]*)"/g;
      let match;

      while ((match = regex.exec(senderParamString)) !== null) {
        params[match[1]] = match[2];
      }

      return params;
    }

    return {};
  };

  const handleSubmit = useCallback(async () => {
    setIsUpdating(true);

    try {
      const formatSenderParamForPayload = (senderParam: Record<string, string>) => {
        return Object.entries(senderParam)
          .map(([k, v]) => `${k}="${v}"`)
          .join(" ");
      };

      const payload = {
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
        adviceType: Number(formData?.adviceType),
        times: formData?.times,
        timeInterval: formData?.timeInterval,
        parentAdviceType: formData?.parentAdviceType,
        adviceCatg: formData?.adviceCatg,
        adviceParamCode: formData?.adviceParamCode,
        spId: formData?.spId || 0,
        adviceTypeLangList: adviceTypeLangList.map((item) => ({
          adviceType: Number(formData?.adviceType),
          defLangId: item.defLangId,
          defLangName: item.defLangName,
          msgDefine: item.msgDefine,
          spId: item.spId || 0,
          subjectDefine: item.subjectDefine || "",
          // stdCode: item.stdCode || "",
        })),
      };

      const response = await PutData(`${API_URL_REF}/api/advice-type/mod-advice-type`, payload);

      if (response?.status) {
        toast.success("Advice type updated successfully!");
        // localStorage.removeItem("adviceTypeLangList");
        setOriginalAdviceTypeLangList(adviceTypeLangList);
        await fetchingListContent();
        await fetchingMultiLang();
        setIsEditMode(false);
        setContentDetail("view");
        // setShowDetailContent(false);
      } else {
        const errorMessage = response?.message || "Failed to updated advice type. Please try again.";
        toast.error(errorMessage);
        console.error("❌ Api returned error:", response);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }, [PutData, formData, setIsEditMode, setContentDetail, fetchingListContent, adviceTypeLangList]);

  const column = useMemo<ColumnDef<adviceTypeLangProps>[]>(
    () => [
      {
        id: "defLangName",
        accessorFn: (row) => row.defLangName,
        header: ({ column }) => <DataGridColumnHeader column={column} className="" title="Language" />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "msgDefine",
        accessorFn: (row) => row.msgDefine,
        header: ({ column }) => <DataGridColumnHeader column={column} className="" title="Template Definition" />,
        enableSorting: true,
        enableHiding: false,
      },
    ],
    [],
  );

  useEffect(() => {
    if (selectedContent) {
      setFormData({
        ...selectedContent,
        senderParam: parseSenderParam(selectedContent.senderParam || {}),
      });

      // const savedLangList = localStorage.getItem("adviceTypeLangList");
      // if (savedLangList) {
      //   try {
      //     const parsedList = JSON.parse(savedLangList);
      //     const filteredList = parsedList.filter((item: adviceTypeLangProps) => item.adviceType === Number(selectedContent.adviceType));
      //     setAdviceTypeLangList(filteredList);
      //   } catch (error) {
      //     console.error("Error parsing saved language list:", error);
      //   }
      // }

      const loadMultiLangData = async () => {
        try {
          const apiData = await fetchingMultiLang();

          const convertedData: adviceTypeLangProps[] = (apiData || []).map((item: any) => ({
            adviceType: Number(item.adviceType),
            defLangId: Number(item.defLangId),
            defLangName: item.defLangName,
            msgDefine: item.msgDefine,
            spId: item.spId || 0,
            subjectDefine: item.subjectDefine || "",
          }));

          setAdviceTypeLangList(convertedData);
          setOriginalAdviceTypeLangList(convertedData);
        } catch (error: any) {
          console.error("Error loading multi language data:", error);
        }
      };

      loadMultiLangData();
    }
  }, [selectedContent]);

  useEffect(() => {
    if (messageChannel.length === 0 && !messageLoading) {
      fetchMessageChannel();
    }
  }, [messageChannel, messageLoading]);

  useEffect(() => {
    if (!showDetailContent && dataTableContext.length > 0) {
      handleSelectedContent(dataTableContext[0]);
    }
  }, [showDetailContent, dataTableContext, handleSelectedContent]);

  const senderParamText = Object.entries(formData.senderParam ?? {})
    .map(([k, v]) => `${k}=\\"${v}\\"`)
    .join(" | ");

  const handleConfirmDeleteLang = async () => {
    if (!selectedLangData) return;

    deleteAdviceTypeLang(selectedLangData?.defLangId);
    toast.success(`Language "${selectedLangData.defLangName}" deleted`);
    setIsDeleteOpen(false);
    setSelectedLangId("");
    setTemplateDefinitionLang("");
    setSelectedLangData(null);
  };

  return (
    <>
      {selectedMessageChannel === "LETTER" || formData.adviceChannelName === "LETTER" ? (
        <>
          <div className="flex flex-col min-h-[calc(50vh-4rem)] mt-3 mx-2 sm:mx-3 border shadow-md p-3 sm:p-4 gap-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowDetailContent(false);
                  setSelectedMessageChannel(null);
                  setFormData(initialPropsAdviceTypeContent);
                  setIsEditMode(false);
                  setContentDetail("view");
                }}
                className="p-1 hover:bg-accent rounded-md"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base sm:text-lg font-semibold">{contentDetail === "edit" ? "Edit Advice Type" : "Detail"}</h2>
            </div>

            <div className="flex-1 overflow-auto p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-5">
                {/* Message Channel */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
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
                    <SelectTrigger className="w-full sm:w-64 h-8" disabled={contentDetail === "view"}>
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">
                    <span className="text-red-500">*</span>
                    Standard Code
                  </label>
                  <Input value={formData.stdCode} onChange={(e) => setFormData({ ...formData, stdCode: e.target.value })} className="w-full sm:w-64 h-8" placeholder="Input Standard Code" disabled={contentDetail === "view"} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="font-medium text-sm">Please choose template files (the first one is main file)</h2>
                <Input type="file" className="w-full max-w-md" disabled={contentDetail === "view"} />
              </div>
            </div>

            {isEditMode ? (
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button
                  variant="outline"
                  className="text-sm px-5 w-full sm:w-auto order-2 sm:order-1"
                  onClick={() => {
                    setIsEditMode(false);
                    setContentDetail("view");
                    if (selectedContent) {
                      setFormData({
                        ...selectedContent,
                        senderParam: parseSenderParam(selectedContent.senderParam || {}),
                      });
                    } else {
                      setFormData(initialPropsAdviceTypeContent);
                    }
                    setAdviceTypeLangList(originalAdviceTypeLangList);
                    setSelectedLangData(null);
                    setSelectedLangId("");
                    setTemplateDefinitionLang("");
                    fetchingMultiLang();
                    toast.info("Changes cancelled");
                  }}
                >
                  Cancel
                </Button>
                <Button variant="default" className="text-sm px-5 w-full sm:w-auto order-1 sm:order-2" onClick={() => handleSubmit()} disabled={isUpdating}>
                  Update
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button
                  variant="default"
                  className="text-sm px-5 w-full sm:w-auto order-1"
                  onClick={() => {
                    setIsEditMode(true);
                    setContentDetail("edit");
                  }}
                >
                  Edit
                </Button>
                <Button variant="outline" className="text-sm px-5 w-full sm:w-auto order-3" onClick={() => setShowDeleteDialog(true)}>
                  Delete
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col min-h-[calc(100vh-4rem)] mt-3 mx-2 sm:mx-3 border shadow-md p-3 sm:p-4 gap-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowDetailContent(false);
                  setIsEditMode(false);
                  setContentDetail("view");
                }}
                className="p-1 hover:bg-accent rounded-md"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base sm:text-lg font-semibold">{contentDetail === "edit" ? "Edit Advice Type" : "Detail"}</h2>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-5">
                {/* Message Channel */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
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
                        adviceChannelName: String(selected?.adviceChannelName),
                      });
                      setSelectedMessageChannel(selected?.adviceChannelName || "");
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-64 h-8" disabled={contentDetail === "view"}>
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">
                    <span className="text-red-500">*</span>
                    Standard Code
                  </label>
                  <Input
                    value={formData?.stdCode}
                    onChange={(e) => {
                      setFormData({ ...formData, stdCode: e.target.value });
                      setErrors({ ...errors, stdCode: "" });
                    }}
                    className="w-full sm:w-64 h-8"
                    placeholder="Input Standard Code"
                    disabled={contentDetail === "view"}
                  />
                </div>

                {/* Template Name */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">
                    <span className="text-red-500">*</span>
                    Template Name
                  </label>
                  <Input
                    value={formData?.adviceTypeName ?? ""}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        adviceTypeName: e.target.value,
                      });
                      setErrors({ ...errors, adviceTypeName: "" });
                    }}
                    className="w-full sm:w-64 h-8"
                    placeholder="Input Template Name"
                    disabled={contentDetail === "view"}
                  />
                </div>

                {/* Template Definition */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">
                    <span className="text-red-500">*</span>
                    Template Definition
                  </label>
                  <div className="relative w-full sm:w-64">
                    <Input value={formData?.msgDefine || ""} className="w-full h-8 bg-gray-100 pr-10 cursor-pointer" readOnly placeholder="Select template definition" disabled={contentDetail === "view"} onClick={() => contentDetail === "edit" && setShowTemplateDefinition(true)} />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-500">
                      <button className="text-gray-500 hover:text-gray-700 disabled:opacity-50 p-1" title="Select Template" disabled={contentDetail === "view"} onClick={() => setShowTemplateDefinition(true)}>
                        <KeenIcon icon="notepad-edit" />
                      </button>
                    </div>
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
                        checked={formData?.isHis === "Y"}
                        onChange={(e) => {
                          setFormData({ ...formData, isHis: e.target.value });
                          setErrors({ ...errors, isHis: "" });
                        }}
                        disabled={contentDetail === "view"}
                      />
                      <label className="text-sm">Yes</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="radio"
                        value="N"
                        checked={formData?.isHis === "N"}
                        onChange={(e) => {
                          setFormData({ ...formData, isHis: e.target.value });
                          setErrors({ ...errors, isHis: "" });
                        }}
                        disabled={contentDetail === "view"}
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
                        checked={formData?.disabled === "Y"}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            disabled: e.target.value,
                          });
                          setErrors({ ...errors, disabled: "" });
                        }}
                        disabled={contentDetail === "view"}
                      />
                      <label className="text-sm">Yes</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="radio"
                        value="N"
                        checked={formData?.disabled === "N"}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            disabled: e.target.value,
                          });
                          setErrors({ ...errors, disabled: "" });
                        }}
                        disabled={contentDetail === "view"}
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
                    value={formData?.effTime || ""}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        effTime: formatDateTime(e.target.value),
                      });
                      setErrors({ ...errors, effTime: "" });
                    }}
                    className="w-full sm:w-64 h-8 border rounded-md border-gray-300 text-sm px-2"
                    disabled={contentDetail === "view"}
                  />
                </div>

                {/* Expiry Time */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">Expiry Time</label>
                  <input
                    type="datetime-local"
                    value={formData?.expTime ?? ""}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        expTime: formatDateTime(e.target.value),
                      });
                      setErrors({ ...errors, expTime: "" });
                    }}
                    className="w-full sm:w-64 h-8 border rounded-md border-gray-300 text-sm px-2"
                    disabled={contentDetail === "view"}
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
                    <SelectTrigger className="w-full sm:w-64 h-8" disabled={contentDetail === "view"}>
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
                      setFormData({
                        ...formData,
                        priority: String(newValue ?? ""),
                      });
                    }}
                    className="w-full sm:w-64 h-8 input"
                    placeholder="Input priority"
                    disabled={contentDetail === "view"}
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
                      setFormData({
                        ...formData,
                        srcNbr: String(newValue ?? ""),
                      });
                    }}
                    className="w-full sm:w-64 h-8 input"
                    placeholder="Input source number"
                    disabled={contentDetail === "view"}
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
                      setFormData({
                        ...formData,
                        delayTime: String(newValue ?? ""),
                      });
                    }}
                    className="w-full sm:w-64 h-8 input"
                    placeholder="Input delay time"
                    disabled={contentDetail === "view"}
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
                    // disabled={true}
                  >
                    <SelectTrigger className="w-full sm:w-64 h-8" disabled={contentDetail === "view"}>
                      <SelectValue placeholder="Select Message Catalog" />
                    </SelectTrigger>
                    <SelectContent>{selectedChildrenSide ? <SelectItem value={selectedChildrenSide.value}>{selectedChildrenSide.lookupName}</SelectItem> : <SelectItem value="empty">No catalog selected</SelectItem>}</SelectContent>
                  </Select>
                </div>

                {/* Sender Parameter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm w-full sm:w-40 flex-shrink-0">Sender Parameter</label>
                  <div className="relative w-full sm:w-64">
                    <Input value={senderParamText} className="w-full h-8 bg-gray-100 pr-10 cursor-pointer" onClick={() => setShowSenderParameter(true)} disabled={contentDetail === "view"} title={senderParamText} />
                    <button className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-500" title="Select sender parameter" onClick={() => setShowSenderParameter(true)} disabled={contentDetail === "view"}>
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
                      setFormData({
                        ...formData,
                        times: String(newValue ?? ""),
                      });
                    }}
                    className="w-full sm:w-64 h-8 input"
                    placeholder="Input send time"
                    disabled={contentDetail === "view"}
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
                    disabled={contentDetail === "view"}
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
                    disabled={contentDetail === "view"}
                  />
                </div>
              </div>

              <div className="border-t border-gray-400 pt-5">
                <div className="flex flex-row items-center justify-between">
                  <div className="flex items-center">
                    <h2 className="text-base sm:text-lg font-semibold mb-3">Multi-Language</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
                      <Button
                        variant="default"
                        className="text-sm px-5 w-full sm:w-auto order-1 h-8"
                        onClick={() => {
                          setShowTemplateMulti(true);
                          setSelectedLangId("");
                          setTemplateDefinitionLang("");
                          setSelectedLangData(null);
                        }}
                        disabled={!isEditMode}
                      >
                        Add
                      </Button>
                    </AccessWrapper>
                    <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
                      <Button
                        variant="outline"
                        className="text-sm px-5 w-full sm:w-auto order-2 h-8"
                        disabled={!isEditMode}
                        onClick={() => {
                          if (!selectedLangData) {
                            toast.error("Please select the data to edit.");
                            return;
                          }
                          setShowTemplateMulti(true);
                        }}
                      >
                        Edit
                      </Button>
                    </AccessWrapper>
                    <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
                      <Button
                        variant="outline"
                        className="text-sm px-5 w-full sm:w-auto order-3 h-8"
                        onClick={() => {
                          if (!selectedLangData) {
                            toast.error("Please select the data to delete.");
                            return;
                          }
                          setIsDeleteOpen(true);
                        }}
                        disabled={!isEditMode}
                      >
                        Delete
                      </Button>
                    </AccessWrapper>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <DataGridProvider
                    columns={column}
                    data={isEditMode ? adviceTypeLangList : multiLang}
                    layout={{ card: true }}
                    getRowProps={(row) => ({
                      className: row.original.defLangId === selectedLangData?.defLangId ? selectedRowHighLight : nonSelectedRowHighLight,
                      onClick: () => setSelectedLangData(row.original),
                    })}
                  />
                </div>
              </div>
            </div>

            {/* {isEditMode && (
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button
                  variant="default"
                  className="text-sm px-5 w-full sm:w-auto order-1 sm:order-2"
                  onClick={() => handleSubmit()}
                >
                  Update
                </Button>
                <Button
                  variant="outline"
                  className="text-sm px-5 w-full sm:w-auto order-2 sm:order-1"
                  onClick={() => {
                    setIsEditMode(false);
                    setContentDetail("view");
                    if (selectedContent) {
                      setFormData({
                        ...selectedContent,
                        senderParam: parseSenderParam(selectedContent.senderParam || {}),
                      });
                    } else {
                      setFormData(initialPropsAdviceTypeContent);
                    }
                  }}
                >
                  Cancel
                </Button>
              </div>
            )} */}

            {isEditMode ? (
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button
                  variant="outline"
                  className="text-sm px-5 w-full sm:w-auto order-2 sm:order-1"
                  onClick={() => {
                    setIsEditMode(false);
                    setContentDetail("view");
                    if (selectedContent) {
                      setFormData({
                        ...selectedContent,
                        senderParam: parseSenderParam(selectedContent.senderParam || {}),
                      });
                    } else {
                      setFormData(initialPropsAdviceTypeContent);
                    }
                    setAdviceTypeLangList(originalAdviceTypeLangList);
                    setSelectedLangData(null);
                    setSelectedLangId("");
                    setTemplateDefinitionLang("");
                    fetchingMultiLang();
                    toast.info("Changes cancelled");
                  }}
                >
                  Cancel
                </Button>
                <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
                  <Button variant="default" className="text-sm px-5 w-full sm:w-auto order-1 sm:order-2" onClick={() => handleSubmit()} disabled={isUpdating}>
                    Update
                  </Button>
                </AccessWrapper>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
                  <Button
                    variant="default"
                    className="text-sm px-5 w-full sm:w-auto order-1"
                    onClick={() => {
                      setIsEditMode(true);
                      setContentDetail("edit");
                    }}
                  >
                    Edit
                  </Button>
                </AccessWrapper>
                <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
                  <Button variant="outline" className="text-sm px-5 w-full sm:w-auto order-3" onClick={() => setShowDeleteDialog(true)}>
                    Delete
                  </Button>
                </AccessWrapper>
              </div>
            )}
          </div>
        </>
      )}
      <PopUpDialog desc="This action cannot be undone!" isOpen={isDeleteOpen} handleDialog={setIsDeleteOpen} onConfirm={handleConfirmDeleteLang} />
    </>
  );
};

export default DetailContent;
