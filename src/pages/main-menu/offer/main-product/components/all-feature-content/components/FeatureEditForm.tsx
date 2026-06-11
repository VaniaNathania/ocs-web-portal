import React, { useCallback, useEffect, useState } from "react";
import TextFloatFields from "../../InputTypesTemplate/TextFloatFields";
import RichTextEditorFields from "../../InputTypesTemplate/RichTextEditorFields";
import AttachmentFields from "../../InputTypesTemplate/AttachmentFields";
import DateSelectorFields from "../../InputTypesTemplate/DateSelectorFields";
import DataTimeSelecotrFields from "../../InputTypesTemplate/DataTimeSelecotrFields";
import TimeSelectorFields from "../../InputTypesTemplate/TimeSelectorFields";
import MemoFields from "../../InputTypesTemplate/MemoFields";
import SingleChoiceFields from "../../InputTypesTemplate/SingleChoiceField";
import MultiChoiceFields from "../../InputTypesTemplate/MultiChoiceFields";
import TextCharacterFields from "../../InputTypesTemplate/TextCharacterFields";
import TextMoneyFields from "../../InputTypesTemplate/TextMoneyFields";
import TextNumberFields from "../../InputTypesTemplate/TextNumberFields";
import TextPasswordFields from "../../InputTypesTemplate/TextPasswordFields";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Checkbox } from "@/components/ui/checkbox";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import { FormDataSingleChoice } from "../../InputTypesTemplate/SingleChoiceField";
import { OfferTypeMeta } from "../../../blocks/utils/MapDisplayData";

interface FeatureEditFormProps {
  contactChannelList: any[];
  expandedInputTypes: any[];
  detailContactChannel: any[];
  onSubmit: () => void;
  onCancel: () => void;
  isAddMode: boolean;
  rowData: any;
  selectedFeature: any;
  detailData: any;
  isEditingMode: boolean;
  detailDriverAndLinkage: any[];
  renderAttrCatg: () => OfferTypeMeta
}

interface textAttrDto {
  dataType: string | null;
  editable: string | null;
  mask: string | null;
  ruleScript: string | null;
  exceptionMessage: string | null;
  minValue: string | null;
  maxValue: string | null;
  spId: number;
  textAttrId: number | null;
}

interface baseAttrDto {
  inputType: string | null;
  nullable: string | null;
  comments: string | null;
  defaultValue: number | null;
  valueScript: string | null;
  spId: number;
  textAttrDto: textAttrDto;
  promptMsg: string | null;
  baseAttrId: number | null;
}

interface AttrApplyCatgRequest {
  attrId: number | null;
  attrCatg: string;
  spId: number;
}

interface AttrApplyChannelRequest {
  attrId: number | null;
  contactChannelId: number;
  spId: number;
}

interface FormData {
  attrRequest: {
    attrId: number | null;
    attrType: string;
    attrCode: string | null;
    attrName: string | null;
    csrVisible: string | null;
    configVisible: string | null;
    instantiatable: string | null;
    objAttrId: number | null;
    objAttrName: string | null;
    attrCatg: string | null;
    spId: number;
    attrValue: string | null;
    editable: string | null;
    baseAttrDto: baseAttrDto;
  };
  attrApplyCatgIds: string[];
  attrApplyChannelIds: number[];
  attrApplyCatgRequest: AttrApplyCatgRequest[];
  attrApplyChannelRequest: AttrApplyChannelRequest[];
}

const API_URL_OFFER = apiConfigOffer.offer;

const FeatureEditForm: React.FC<FeatureEditFormProps> = ({ contactChannelList, detailData, expandedInputTypes, onSubmit, onCancel, isAddMode, rowData, selectedFeature, isEditingMode, detailDriverAndLinkage, detailContactChannel, renderAttrCatg }) => {
  const [selectedChannels, setSelectedChannels] = useState<number[]>([]);
  const [singleChoiceValues, setSingleChoiceValues] = useState<FormDataSingleChoice[]>([]);
  const [contactChannelOpen, setContactChannelOpen] = useState(false);
  const { PutData, PostData } = useCallApi();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const attrId = selectedFeature.attrId;
  const meta = renderAttrCatg()

  useEffect(() => {
    // console.log("DETAIL DRIVER LINKAGE: ", detailDriverAndLinkage);
  }, [detailDriverAndLinkage]);

  // Form data
  const initialFormData: FormData = {
    attrRequest: {
      attrId: attrId,
      attrType: "1",
      attrCode: null,
      attrName: null,
      csrVisible: null,
      configVisible: null,
      instantiatable: null,
      objAttrId: null,
      objAttrName: null,
      attrCatg: null,
      spId: 0,
      attrValue: null,
      editable: null,

      // ini cuma dipakai kalau attrType = "1"
      baseAttrDto: {
        baseAttrId: attrId,
        inputType: null,
        nullable: null,
        comments: null,
        defaultValue: null,
        valueScript: null,
        spId: 0,
        textAttrDto: {
          textAttrId: attrId,
          dataType: null,
          editable: null,
          mask: null,
          ruleScript: null,
          exceptionMessage: null,
          minValue: null,
          maxValue: null,
          spId: 0,
        },
        promptMsg: null,
      },
    },
    // list category & channel
    attrApplyCatgIds: [meta.attrCatg],
    attrApplyChannelIds: [],
    attrApplyCatgRequest: [
      {
        attrId: attrId,
        attrCatg: meta.attrCatg,
        spId: 0,
      },
    ],
    attrApplyChannelRequest: [],
  };

  const [formData, setFormData] = useState(initialFormData);

  const updateFormData = (name: string, value: any) => {
    setFormData((prev) => {
      const keys = name.split(".");
      const newData: any = { ...prev };

      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  useEffect(() => {
    if (detailContactChannel && detailContactChannel.length > 0) {
      const initialSelected = detailContactChannel.map((item) => item.contactChannelId);
      setSelectedChannels(initialSelected);

      setFormData((prev) => ({
        ...prev,
        attrApplyChannelIds: initialSelected,
        attrApplyChannelRequest: initialSelected.map((id) => ({
          attrId: detailData.attrId || selectedFeature.attrId,
          contactChannelId: id,
          spId: 0,
        })),
      }));
    }
  }, [detailContactChannel]);

  useEffect(() => {
    // console.log("ATTR ID SELECTED FEATURE : ", selectedFeature);
    // console.log("DETAIL DATA ON EDIT : ", detailData);
    if (detailData) {
      setFormData((prev) => ({
        ...prev,
        attrRequest: {
          ...prev.attrRequest,
          attrId: detailData.attrId || selectedFeature.attrId,
          attrType: detailData.attrType,
          attrCode: detailData.attrCode,
          attrName: detailData.attrName,
          csrVisible: detailData.csrVisible,
          configVisible: detailData.configVisible,
          instantiatable: detailData.instantiatable,
          objAttrId: detailData.objAttrId,
          objAttrName: detailData.objAttrName,
          attrCatg: detailData.attrCatg || "1",
          spId: 0,
          attrValue: detailData.attrValue,
          editable: detailData.editable,
          baseAttrDto: {
            ...prev.attrRequest.baseAttrDto,
            baseAttrId: detailData.attrId || selectedFeature.attrId,
            inputType: detailData.inputType,
            nullable: detailData.nullable,
            comments: detailData.comments,
            defaultValue: detailData.defaultValue,
            valueScript: detailData.valueScript,
            spId: 0,
            promptMsg: detailData.promptMsg,
            textAttrDto: {
              ...prev.attrRequest.baseAttrDto.textAttrDto,
              textAttrId: detailData.attrId || selectedFeature.attrId,
              dataType: detailData.dataType,
              editable: detailData.editable,
              mask: detailData.mask,
              ruleScript: detailData.ruleScript,
              exceptionMessage: detailData.exceptionMessage,
              minValue: detailData.minValue,
              maxValue: detailData.maxValue,
              spId: 0,
            },
          },
        },
        attrApplyCatgIds: detailData.attrApplyCatgIds || prev.attrApplyCatgIds || [1],
        attrApplyChannelIds: detailData.attrApplyChannelIds || prev.attrApplyChannelIds || [],
        attrApplyCatgRequest: detailData.attrApplyCatgRequest ||
          prev.attrApplyCatgRequest || [
            {
              attrId: detailData.attrId || prev.attrRequest.attrId,
              attrCatg: detailData.attrCatg || 1,
              spId: 0,
            },
          ],

        attrApplyChannelRequest: detailData.attrApplyChannelRequest || prev.attrApplyChannelRequest || [],
      }));
    }
  }, [detailData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // if (!validateForm()) {
      //   return;
      // }
      setIsLoading(true);

      try {
        const { inputType } = formData.attrRequest.baseAttrDto;
        if ((inputType === "1" || inputType === "2") && !singleChoiceValues.length) {
          toast.error("Feature value cannot be null!");
          setIsLoading(false);
          return;
        }

        const response: any = await PutData(`${API_URL_OFFER}/offer/attr/mod-attr`, formData);
        const savedBaseAttrId = response?.data?.data?.baseAttrId ?? formData.attrRequest.baseAttrDto.baseAttrId;

        const resStatus = response?.data?.status || response?.status;

        if (!(resStatus === 201 || resStatus === true)) {
          const errorMessage = response?.data?.message || response?.message || "Failed to create Feature. Please try again.";
          toast.error(errorMessage);
          return;
        }

        // console.log("👉 singleChoiceValues:", singleChoiceValues);

        // hit batch-add-attr
        if (inputType === "1" || inputType === "2") {
          // ambil hanya data yang baru
          const newValues = singleChoiceValues.filter((item) => !item.attrValueId || item.attrValueId > 10000);

          if (!newValues.length) {
            // console.log("✅ Tidak ada data baru untuk di-add");
          } else {
            const batchPayload = newValues.map((item) => {
              // drop objAttrName di attrDriverList
              const finalDriverList =
                item.attrDriverList?.map(({ objAttrName, ...driverRest }) => ({
                  ...driverRest,
                })) || [];

              // drop attrName di attrValueLinkageList.id
              const finalValueLinkageList =
                item.attrValueLinkageList?.map((val) => {
                  const { attrName, ...idRest } = val.id || {};
                  return {
                    ...val,
                    id: {
                      ...idRest,
                    },
                  };
                }) || [];

              return {
                ...item,
                baseAttrId: savedBaseAttrId,
                spId: 0,
                attrDriverList: finalDriverList,
                attrValueLinkageList: finalValueLinkageList,
              };
            });

            const batchRes = await PostData(`${API_URL_OFFER}/offer/attr/batch-add-attr-value`, batchPayload);

            if (!batchRes?.status) {
              const errorMessage = batchRes?.message || "Failed to add options (batch). Please try again.";
              toast.error(errorMessage);
              return;
            }
          }
        }
        toast.success("Feature Update successfully!");
        onSubmit?.();
      } catch (error: any) {
        const errorMessage = error?.message || "Something went wrong. Please try again.";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, PutData, PostData, singleChoiceValues, onSubmit]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData(name, value);
  };

  const renderExtraInputTypeFields = () => {
    switch (formData.attrRequest.baseAttrDto.inputType) {
      case "4":
        const dataType = formData.attrRequest.baseAttrDto.textAttrDto.dataType || "C";
        switch (dataType) {
          case "F":
            return <TextFloatFields formData={formData} onChange={handleInputChange} isEditingMode={true} />;
          case "M":
            return <TextMoneyFields formData={formData} onChange={handleInputChange} isEditingMode={true} />;
          case "C":
            return <TextCharacterFields formData={formData} onChange={handleInputChange} isEditingMode={true} />;
          case "N":
            return <TextNumberFields formData={formData} onChange={handleInputChange} isEditingMode={true} />;
          case "P":
            return <TextPasswordFields formData={formData} onChange={handleInputChange} isEditingMode={true} />;
          default:
            return null;
        }
      case "C":
        return <RichTextEditorFields formData={formData} onChange={handleInputChange} isEditingMode={true} />;
      case "6":
        return <AttachmentFields formData={formData} onChange={handleInputChange} isEditingMode={true} />;
      case "3":
        return <DateSelectorFields formData={formData} onChange={handleInputChange} isEditingMode={true} />;
      case "B":
        return <DataTimeSelecotrFields formData={formData} onChange={handleInputChange} isEditingMode={true} />;
      case "A":
        return <TimeSelectorFields formData={formData} onChange={handleInputChange} isEditingMode={true} />;
      case "5":
        return <MemoFields formData={formData} onChange={handleInputChange} isEditingMode={true} />;
      case "1":
        return <SingleChoiceFields formData={detailDriverAndLinkage} onChange={handleInputChange} isEditingMode={isEditingMode} rowData={rowData} onSingleChoiceChange={setSingleChoiceValues} />;
      case "2":
        return <MultiChoiceFields formData={detailDriverAndLinkage} onChange={handleInputChange} isEditingMode={isEditingMode} rowData={rowData} onSingleChoiceChange={setSingleChoiceValues} />;
      default:
        return null;
    }
  };

  const renderBasicFeatureForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Row 1 - Feature Type & Feature Code */}
        <div className="grid grid-cols-2 gap-8">
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Feature Type:</span>
            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.attrType" value="1" checked={formData.attrRequest.attrType === "1"} onChange={handleInputChange} className="mr-1" />
                Basic Feature
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.attrType" value="2" checked={formData.attrRequest.attrType === "2"} onChange={handleInputChange} className="mr-1" />
                Object Feature
              </label>
            </div>
          </div>
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">
              <span className="text-red-500">*</span>Feature Code:
            </span>
            <input
              type="text"
              name="attrCode"
              value={formData.attrRequest.attrCode ?? ""}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  attrRequest: {
                    ...formData.attrRequest,
                    attrCode: e.target.value === "" ? null : e.target.value,
                  },
                });
              }}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 disabled:cursor-not-allowed"
              placeholder="Enter feature code"
              required
              disabled={isEditingMode}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Row 2 - Feature Name & Feature Category*/}
        <div className="grid grid-cols-2 gap-8">
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">
              <span className="text-red-500">*</span>Feature Name:
            </span>
            <input
              type="text"
              name="attrRequest.attrName"
              value={formData.attrRequest.attrName ?? ""}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  attrRequest: {
                    ...formData.attrRequest,
                    attrName: e.target.value === "" ? null : e.target.value,
                  },
                });
              }}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder="Enter feature name"
              required
              autoComplete="off"
            />
          </div>
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Feature Category:</span>
            <div className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 flex items-center">
              <span className="px-2 py-0.5 border border-gray-400 rounded bg-blue-50 text-gray-700">{meta.offerName}</span>
            </div>
          </div>
        </div>

        {/* Row 3 - Contact Channel & CSR Visible*/}
        <div className="grid grid-cols-2 gap-8">
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Contact Channel:</span>
            <Popover open={contactChannelOpen} onOpenChange={setContactChannelOpen}>
              <PopoverTrigger asChild>
                <button type="button" className="w-[170px] px-2 py-1 text-sm h-10 border border-gray-300 rounded-md flex items-center justify-between">
                  <span className="truncate w-[85%] text-left">
                    {selectedChannels.length === 0
                      ? "Select Contact Channel"
                      : contactChannelList
                          .filter((item) => selectedChannels.includes(item.contactChannelId))
                          .map((item) => item.contactChannelName)
                          .join(" , ")}
                  </span>
                  <MdKeyboardArrowDown className="h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>

              <PopoverContent className="w-[400px] h-[300px] overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {contactChannelList.map((item) => (
                    <label key={item.value} className="flex items-center gap-2 text-md">
                      <Checkbox
                        checked={selectedChannels.includes(item.contactChannelId)}
                        onCheckedChange={(checked) => {
                          setSelectedChannels((prev) => {
                            const updated = checked ? [...prev, item.contactChannelId] : prev.filter((val) => val !== item.contactChannelId);

                            setFormData((prev) => ({
                              ...prev,
                              attrApplyChannelIds: updated,
                              attrApplyChannelRequest: updated.map((id) => ({
                                attrId: detailData.attrId || selectedFeature.attrId,
                                contactChannelId: id,
                                spId: 0,
                              })),
                            }));

                            return updated;
                          });
                        }}
                      />

                      {item.contactChannelName}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">CSR Visible:</span>
            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.csrVisible" value="Y" checked={formData.attrRequest.csrVisible === "Y"} onChange={handleInputChange} className="mr-1" />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.csrVisible" value="N" checked={formData.attrRequest.csrVisible === "N"} onChange={handleInputChange} className="mr-1" />
                No
              </label>
            </div>
          </div>
        </div>

        {/* Row 4 - Project Visible & Instantiation */}
        <div className="grid grid-cols-2 gap-8">
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Project Visible:</span>
            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.configVisible" value="Y" checked={formData.attrRequest.configVisible === "Y"} onChange={handleInputChange} className="mr-1" />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.configVisible" value="N" checked={formData.attrRequest.configVisible === "N"} onChange={handleInputChange} className="mr-1" />
                No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Instantiation:</span>
            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.instantiatable" value="Y" checked={formData.attrRequest.instantiatable === "Y"} onChange={handleInputChange} className="mr-1" />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.instantiatable" value="N" checked={formData.attrRequest.instantiatable === "N"} onChange={handleInputChange} className="mr-1" />
                No
              </label>
            </div>
          </div>
        </div>

        {/* Row 5 - Editable & Value Nullable */}
        <div className="grid grid-cols-2 gap-8">
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Editable:</span>
            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.baseAttrDto.textAttrDto.editable" value="Y" checked={formData.attrRequest.baseAttrDto.textAttrDto.editable === "Y"} onChange={handleInputChange} className="mr-1" />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.baseAttrDto.textAttrDto.editable" value="N" checked={formData.attrRequest.baseAttrDto.textAttrDto.editable === "N"} onChange={handleInputChange} className="mr-1" />
                No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Value Nullable:</span>
            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.baseAttrDto.nullable" value="Y" checked={formData.attrRequest.baseAttrDto.nullable === "Y"} onChange={handleInputChange} className="mr-1" />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.baseAttrDto.nullable" value="N" checked={formData.attrRequest.baseAttrDto.nullable === "N"} onChange={handleInputChange} className="mr-1" />
                No
              </label>
            </div>
          </div>
        </div>

        {/* Row 6 - Prompt Message */}
        <div className="grid grid-cols-1 gap-8">
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Prompt Message:</span>
            <textarea
              name="attrRequest.baseAttrDto.promptMsg"
              value={formData.attrRequest.baseAttrDto.promptMsg ?? ""}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  attrRequest: {
                    ...formData.attrRequest,
                    baseAttrDto: {
                      ...formData.attrRequest.baseAttrDto,
                      promptMsg: e.target.value === "" ? null : e.target.value,
                    },
                  },
                });
              }}
              rows={2}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder=""
            />
          </div>
        </div>

        {/* Row 7 - Input Type */}
        <div className="grid grid-cols-2 gap-8">
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">
              <span className="text-red-500">*</span>Input Type:
            </span>
            <select
              name="inputType"
              value={`${formData.attrRequest.baseAttrDto.inputType}${formData.attrRequest.baseAttrDto.inputType === "4" ? `-${formData.attrRequest.baseAttrDto.textAttrDto.dataType || "C"}` : ""}`}
              onChange={(e) => {
                const value = e.target.value;
                if (value.includes("-")) {
                  const [inputType, dataType] = value.split("-");
                  updateFormData("attrRequest.baseAttrDto.inputType", inputType);
                  updateFormData("attrRequest.baseAttrDto.textAttrDto.dataType", dataType);
                } else {
                  updateFormData("attrRequest.baseAttrDto.inputType", value);
                  if (value === "5") {
                    updateFormData("attrRequest.baseAttrDto.textAttrDto.dataType", "C");
                  } else {
                    updateFormData("attrRequest.baseAttrDto.textAttrDto.dataType", null);
                  }
                }
              }}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 disabled:cursor-not-allowed"
              required
              disabled={isEditingMode}
            >
              <option value="">Select Input Type...</option>
              {expandedInputTypes.map((inputType, index) => (
                <option key={index} value={inputType.dataType ? `${inputType.inputType}-${inputType.dataType}` : inputType.inputType}>
                  {inputType.inputTypeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 8 - Value Script */}
        <div className="grid grid-cols-1 gap-8">
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Value Script:</span>
            <textarea
              name="attrRequest.baseAttrDto.valueScript"
              value={formData.attrRequest.baseAttrDto.valueScript ?? ""}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  attrRequest: {
                    ...formData.attrRequest,
                    baseAttrDto: {
                      ...formData.attrRequest.baseAttrDto,
                      valueScript: e.target.value === "" ? null : e.target.value,
                    },
                  },
                });
              }}
              rows={2}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder=""
            />
          </div>
        </div>

        {renderExtraInputTypeFields()}
      </div>
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {isAddMode ? "Add" : "Update"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300">
          Cancel
        </button>
      </div>
    </form>
  );

  const renderObjectFeatureForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Row 1 - Feature Type & Feature Code */}
        <div className="grid grid-cols-2 gap-8">
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Feature Type:</span>
            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.attrType" value="1" checked={formData.attrRequest.attrType === "1"} onChange={handleInputChange} className="mr-1" />
                Basic Feature
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.attrType" value="2" checked={formData.attrRequest.attrType === "2"} onChange={handleInputChange} className="mr-1" />
                Object Feature
              </label>
            </div>
          </div>
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">
              <span className="text-red-500">*</span>Feature Code:
            </span>
            <input
              type="text"
              name="attrRequest.attrCode"
              value={formData.attrRequest.attrCode ?? ""}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  attrRequest: {
                    ...formData.attrRequest,
                    attrCode: e.target.value === "" ? null : e.target.value,
                  },
                });
              }}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder="Enter feature code"
              required
              disabled={isEditingMode}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Row 2 - Feature Name & Feature Category*/}
        <div className="grid grid-cols-2 gap-8">
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">
              <span className="text-red-500">*</span>Feature Name:
            </span>
            <input
              type="text"
              name="attrRequest.attrName"
              value={formData.attrRequest.attrName ?? ""}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  attrRequest: {
                    ...formData.attrRequest,
                    attrName: e.target.value === "" ? null : e.target.value,
                  },
                });
              }}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder="Enter feature name"
              required
              autoComplete="off"
            />
          </div>
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Feature Category:</span>
            <div className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 flex items-center">
              <span className="px-2 py-0.5 border border-gray-400 rounded bg-blue-50 text-gray-700">{meta.offerName}</span>
            </div>
          </div>
        </div>

        {/* Row 3 - Contact Channel & CSR Visible*/}
        <div className="grid grid-cols-2 gap-8">
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Contact Channel:</span>
            <Popover open={contactChannelOpen} onOpenChange={setContactChannelOpen}>
              <PopoverTrigger asChild>
                <button type="button" className="w-[170px] px-2 py-1 text-sm h-10 border border-gray-300 rounded-md flex items-center justify-between">
                  <span className="truncate w-[85%] text-left">
                    {selectedChannels.length === 0
                      ? "Select Contact Channel"
                      : contactChannelList
                          .filter((item) => selectedChannels.includes(item.contactChannelId))
                          .map((item) => item.contactChannelName)
                          .join(" , ")}
                  </span>
                  <MdKeyboardArrowDown className="h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>

              <PopoverContent className="w-[400px] h-[300px] overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {contactChannelList.map((item) => (
                    <label key={item.value} className="flex items-center gap-2 text-md">
                      <Checkbox
                        checked={selectedChannels.includes(item.contactChannelId)}
                        onCheckedChange={(checked) => {
                          setSelectedChannels((prev) => {
                            const updated = checked ? [...prev, item.contactChannelId] : prev.filter((val) => val !== item.contactChannelId);

                            setFormData((prev) => ({
                              ...prev,
                              attrApplyChannelIds: updated,
                              attrApplyChannelRequest: updated.map((id) => ({
                                attrId: detailData.attrId || selectedFeature.attrId,
                                contactChannelId: id,
                                spId: 0,
                              })),
                            }));

                            return updated;
                          });
                        }}
                      />

                      {item.contactChannelName}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">CSR Visible:</span>
            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.csrVisible" value="Y" checked={formData.attrRequest.csrVisible === "Y"} onChange={handleInputChange} className="mr-1" />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.csrVisible" value="N" checked={formData.attrRequest.csrVisible === "N"} onChange={handleInputChange} className="mr-1" />
                No
              </label>
            </div>
          </div>
        </div>

        {/* Row 4 - Project Visible & Instantiation */}
        <div className="grid grid-cols-2 gap-8">
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Project Visible:</span>
            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.configVisible" value="Y" checked={formData.attrRequest.configVisible === "Y"} onChange={handleInputChange} className="mr-1" />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.configVisible" value="N" checked={formData.attrRequest.configVisible === "N"} onChange={handleInputChange} className="mr-1" />
                No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Instantiation:</span>
            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.instantiatable" value="Y" checked={formData.attrRequest.instantiatable === "Y"} onChange={handleInputChange} className="mr-1" />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.instantiatable" value="N" checked={formData.attrRequest.instantiatable === "N"} onChange={handleInputChange} className="mr-1" />
                No
              </label>
            </div>
          </div>
        </div>

        {/* Row 5 - Editable & Value Nullable */}
        <div className="grid grid-cols-2 gap-8">
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Editable:</span>
            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.baseAttrDto.textAttrDto.editable" value="Y" checked={formData.attrRequest.baseAttrDto.textAttrDto.editable === "Y"} onChange={handleInputChange} className="mr-1" />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.baseAttrDto.textAttrDto.editable" value="N" checked={formData.attrRequest.baseAttrDto.textAttrDto.editable === "N"} onChange={handleInputChange} className="mr-1" />
                No
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 rounded focus:outline-none focus:ring-2 
      ${isLoading ? "bg-blue-400 text-white cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500"}`}
        >
          {isLoading ? (isAddMode ? "Adding..." : "Updating...") : isAddMode ? "Add" : "Update"}
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={onCancel}
          className={`px-4 py-2 rounded focus:outline-none focus:ring-2
      ${isLoading ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-gray-300"}`}
        >
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div className="flex-1 bg-white border border-gray-200 rounded shadow-sm overflow-auto">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Edit Feature : {selectedFeature?.attrName || "Feature Details"}</h3>
      </div>

      {/* Form Content */}
      <div className="p-6">{String(formData.attrRequest.attrType) === "1" ? renderBasicFeatureForm() : renderObjectFeatureForm()}</div>
    </div>
  );
};

export default FeatureEditForm;
