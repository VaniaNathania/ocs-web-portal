import React, { useCallback, useEffect, useState } from "react";
import TextFloatFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/TextFloatFields";
import TextMoneyFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/TextMoneyFields";
import TextCharacterFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/TextCharacterFields";
import TextNumberFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/TextNumberFields";
import TextPasswordFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/TextPasswordFields";
import RichTextEditorFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/RichTextEditorFields";
import AttachmentFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/AttachmentFields";
import DateSelectorFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/DateSelectorFields";
import DataTimeSelecotrFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/DataTimeSelecotrFields";
import TimeSelectorFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/TimeSelectorFields";
import MemoFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/MemoFields";
import SingleChoiceFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/SingleChoiceField";
import MultiChoiceFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/MultiChoiceFields";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MdKeyboardArrowDown } from "react-icons/md";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { FormDataSingleChoice } from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/SingleChoiceField";
import { AttrCatg } from "../AllFeatureTabContent";
import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";

interface FeatureAddFormProps {
  contactChannelList: any[];
  expandedInputTypes: any[];
  onSubmit: (newAttrId?: number) => void;
  onCancel: () => void;
  rowData: any;
  attrCatgList: AttrCatg[];
}

interface textAttrDto {
  dataType: string | null;
  editable: string | null;
  mask: string | null;
  ruleScript: string | null;
  exceptionMessage: string | null;
  minValue: number | null;
  maxValue: number | null;
  spId: number;
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
}

interface AttrApplyCatgRequest {
  attrCatg: number;
  spId: number;
}

interface AttrApplyChannelRequest {
  contactChannelId: number;
  spId: number;
}

export interface FormData {
  attrRequest: {
    attrType: string;
    attrCode: string | null;
    attrName: string | null;
    csrVisible: string | null;
    configVisible: string | null;
    instantiatable: string | null;
    objAttrName: string | null;
    attrCatg: number | null;
    spId: number;
    attrValue: string | null;
    editable: string | null;
    baseAttrDto: baseAttrDto;
  };
  attrApplyCatgIds: number[];
  attrApplyChannelIds: number[];
  attrApplyCatgRequest: AttrApplyCatgRequest[];
  attrApplyChannelRequest: AttrApplyChannelRequest[];
}

const API_URL_OFFER = apiConfigOffer.offer;

const FeatureAddForm: React.FC<FeatureAddFormProps> = ({
  contactChannelList,
  expandedInputTypes,
  onSubmit,
  onCancel,
  rowData,
  attrCatgList,
}) => {
  const [singleChoiceValues, setSingleChoiceValues] = useState<
    FormDataSingleChoice[]
  >([]);
  const [selectedChannels, setSelectedChannels] = useState<number[]>([]);
  const [selectedCatg, setSelectedCatg] = useState<string[]>([]);
  const [contactChannelOpen, setContactChannelOpen] = useState(false);
  const [attrCatgOpen, setAttrCatgOpen] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const { PostData } = useCallApi();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Form data
  const initialFormData: FormData = {
    attrRequest: {
      attrType: "1",
      attrCode: null,
      attrName: null,
      csrVisible: "N",
      configVisible: "Y",
      instantiatable: "Y",
      objAttrName: null,
      attrCatg: null,
      spId: 0,
      attrValue: null,
      editable: "Y",

      // ini cuma dipakai kalau attrType = "1"
      baseAttrDto: {
        inputType: null,
        nullable: "Y",
        comments: null,
        defaultValue: null,
        valueScript: null,
        spId: 0,
        textAttrDto: {
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
    attrApplyCatgIds: [],
    attrApplyChannelIds: [],
    attrApplyCatgRequest: [],
    attrApplyChannelRequest: [],
  };

  useEffect(() => {
    //  console.log("single choice uhuy", singleChoiceValues);
  }, [singleChoiceValues]);

  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setAlert({ show: false, message: "" });
      setIsLoading(true);

      try {
        const { inputType } = formData.attrRequest.baseAttrDto;

        if (
          (inputType === "1" || inputType === "2") &&
          !singleChoiceValues.length
        ) {
          toast.error("Feature value cannot be null!");
          setIsLoading(false);
          return;
        }

        // hit add-attr API
        const addAttrRes: any = await PostData(
          `${API_URL_OFFER}/offer/attr/add-attr`,
          formData,
        );

        const resStatus = addAttrRes?.data?.status || addAttrRes?.status;
        if (!(resStatus === 201 || resStatus === true)) {
          const errorMessage =
            addAttrRes?.data?.message ||
            addAttrRes?.message ||
            "Failed to create Feature. Please try again.";
          toast.error(errorMessage);
          setAlert({ show: true, message: errorMessage });
          return;
        }

        const attrId =
          addAttrRes?.data?.attrRequest?.attrId ||
          addAttrRes?.data?.attrRequest?.baseAttrDto?.baseAttrId;

        if (!attrId) {
          toast.error("attrId not found from add-attr response!");
          return;
        }

        // lanjut batch-add kalau valid
        if (inputType === "1" || inputType === "2") {
          const batchPayload = singleChoiceValues.map((item) => ({
            ...item,
            baseAttrId: attrId,
            attrDriverList:
              item.attrDriverList?.map(({ objAttrName, ...rest }) => rest) ||
              [],
            attrValueLinkageList:
              item.attrValueLinkageList?.map((val) => {
                const { attrName, ...idRest } = val.id || {};
                return { ...val, id: idRest };
              }) || [],
          }));

          const batchRes = await PostData(
            `${API_URL_OFFER}/offer/attr/batch-add-attr-value`,
            batchPayload,
          );

          if (!batchRes?.status) {
            toast.error(
              batchRes?.message ||
                "Failed to add options (batch). Please try again.",
            );
            return;
          }
        }

        toast.success("Feature created successfully!");
        onSubmit?.(attrId);
      } catch (error: any) {
        toast.error(
          error?.message || "Something went wrong. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [formData, singleChoiceValues, PostData, onSubmit],
  );

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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    updateFormData(name, value);
  };

  useEffect(() => {
    updateFormData("attrApplyChannelIds", selectedChannels);

    const channelRequest = selectedChannels.map((id) => ({
      contactChannelId: id,
      spId: formData.attrRequest.spId,
    }));

    updateFormData("attrApplyChannelRequest", channelRequest);
  }, [selectedChannels, formData.attrRequest.spId]);

  useEffect(() => {
    updateFormData("attrApplyCatgIds", selectedCatg);

    const catgRequest = selectedCatg.map((catg) => ({
      attrCatg: catg,
      spId: formData.attrRequest.spId,
    }));

    updateFormData("attrApplyCatgRequest", catgRequest);
  }, [selectedCatg, formData.attrRequest.spId]);

  const renderExtraInputTypeFields = () => {
    switch (formData.attrRequest.baseAttrDto?.inputType) {
      case "4":
        const dataType =
          formData.attrRequest.baseAttrDto.textAttrDto.dataType || "C";
        switch (dataType) {
          case "F":
            return (
              <TextFloatFields
                formData={formData}
                onChange={handleInputChange}
                isEditingMode={true}
              />
            );
          case "M":
            return (
              <TextMoneyFields
                formData={formData}
                onChange={handleInputChange}
                isEditingMode={true}
              />
            );
          case "C":
            return (
              <TextCharacterFields
                formData={formData}
                onChange={handleInputChange}
                isEditingMode={true}
              />
            );
          case "N":
            return (
              <TextNumberFields
                formData={formData}
                onChange={handleInputChange}
                isEditingMode={true}
              />
            );
          case "P":
            return (
              <TextPasswordFields
                formData={formData}
                onChange={handleInputChange}
                isEditingMode={true}
              />
            );
          default:
            return null;
        }
      case "C":
        return (
          <RichTextEditorFields
            formData={formData}
            onChange={handleInputChange}
            isEditingMode={true}
          />
        );
      case "6":
        return (
          <AttachmentFields
            formData={formData}
            onChange={handleInputChange}
            isEditingMode={true}
          />
        );
      case "3":
        return (
          <DateSelectorFields
            formData={formData}
            onChange={handleInputChange}
            isEditingMode={true}
          />
        );
      case "B":
        return (
          <DataTimeSelecotrFields
            formData={formData}
            onChange={handleInputChange}
            isEditingMode={true}
          />
        );
      case "A":
        return (
          <TimeSelectorFields
            formData={formData}
            onChange={handleInputChange}
            isEditingMode={true}
          />
        );
      case "5":
        return (
          <MemoFields
            formData={formData}
            onChange={handleInputChange}
            isEditingMode={true}
          />
        );
      case "1":
        return (
          <SingleChoiceFields
            formData={formData}
            onChange={handleInputChange}
            isEditingMode={true}
            rowData={rowData}
            onSingleChoiceChange={setSingleChoiceValues}
          />
        );
      case "2":
        return (
          <MultiChoiceFields
            formData={formData}
            onChange={handleInputChange}
            isEditingMode={true}
            rowData={rowData}
            onSingleChoiceChange={setSingleChoiceValues}
          />
        );
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
                <input
                  type="radio"
                  name="attrRequest.attrType"
                  value="1"
                  checked={formData.attrRequest.attrType === "1"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
                Basic Feature
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="attrRequest.attrType"
                  value="2"
                  checked={formData.attrRequest.attrType === "2"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attrRequest: {
                    ...formData.attrRequest,
                    attrCode: e.target.value === "" ? null : e.target.value, // kosong jadi null
                  },
                })
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder="Enter feature code"
              required
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attrRequest: {
                    ...formData.attrRequest,
                    attrName: e.target.value === "" ? null : e.target.value, // kosong jadi null
                  },
                })
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder="Enter feature name"
              required
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <div className="grid grid-cols-[160px_1fr] items-center gap-4">
              <span className="text-sm text-gray-800">Feature Category:</span>
              <div className="flex flex-row">
                <Popover open={attrCatgOpen} onOpenChange={setAttrCatgOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-[170px] px-2 py-1 text-sm h-10 border border-gray-300 rounded-md flex items-center justify-between"
                    >
                      <span className="truncate w-[85%] text-left">
                        {selectedCatg.length === 0
                          ? "Select Feature Category"
                          : attrCatgList
                              .filter((item) =>
                                selectedCatg.includes(item.attrCatg),
                              )
                              .map((item) => item.attrCatgName)
                              .join(" , ")}
                      </span>
                      <MdKeyboardArrowDown className="h-4 w-4 opacity-50" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[400px] h-[300px] overflow-y-auto">
                    <div className="flex flex-col gap-2">
                      {attrCatgList.map((item) => (
                        <label
                          key={item.attrCatgName}
                          className="flex items-center gap-2 text-md"
                        >
                          <Checkbox
                            checked={selectedCatg.includes(item.attrCatg)}
                            onCheckedChange={(checked) => {
                              // console.log("item.value:", item.value, "checked:", checked);
                              setSelectedCatg((prev) =>
                                checked
                                  ? [...prev, item.attrCatg]
                                  : prev.filter((val) => val !== item.attrCatg),
                              );
                            }}
                          />

                          {item.attrCatgName}
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                {selectedCatg.length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedCatg([]);
                    }}
                    className=""
                  >
                    <KeenIcon icon="cross" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3 - Contact Channel & CSR Visible*/}
        <div className="grid grid-cols-2 gap-8">
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Contact Channel:</span>
            <Popover
              open={contactChannelOpen}
              onOpenChange={setContactChannelOpen}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-[170px] px-2 py-1 text-sm h-10 border border-gray-300 rounded-md flex items-center justify-between"
                >
                  <span className="truncate w-[85%] text-left">
                    {selectedChannels.length === 0
                      ? "Select Contact Channel"
                      : contactChannelList
                          .filter((item) =>
                            selectedChannels.includes(item.contactChannelId),
                          )
                          .map((item) => item.contactChannelName)
                          .join(" , ")}
                  </span>
                  <MdKeyboardArrowDown className="h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>

              <PopoverContent className="w-[400px] h-[300px] overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {contactChannelList.map((item) => (
                    <label
                      key={item.value}
                      className="flex items-center gap-2 text-md"
                    >
                      <Checkbox
                        checked={selectedChannels.includes(
                          item.contactChannelId,
                        )}
                        onCheckedChange={(checked) => {
                          setSelectedChannels((prev) => {
                            let updated: number[];
                            if (checked) {
                              updated = [...prev, item.contactChannelId];
                            } else {
                              updated = prev.filter(
                                (val) => val !== item.contactChannelId,
                              );
                            }

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
                <input
                  type="radio"
                  name="attrRequest.csrVisible"
                  value="Y"
                  checked={formData.attrRequest.csrVisible === "Y"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="attrRequest.csrVisible"
                  value="N"
                  checked={formData.attrRequest.csrVisible === "N"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
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
                <input
                  type="radio"
                  name="attrRequest.configVisible"
                  value="Y"
                  checked={formData.attrRequest.configVisible === "Y"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="attrRequest.configVisible"
                  value="N"
                  checked={formData.attrRequest.configVisible === "N"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
                No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Instantiation:</span>
            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="attrRequest.instantiatable"
                  value="Y"
                  checked={formData.attrRequest.instantiatable === "Y"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="attrRequest.instantiatable"
                  value="N"
                  checked={formData.attrRequest.instantiatable === "N"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
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
                <input
                  type="radio"
                  name="attrRequest.editable"
                  value="Y"
                  checked={formData.attrRequest.editable === "Y"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="attrRequest.editable"
                  value="N"
                  checked={formData.attrRequest.editable === "N"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
                No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Value Nullable:</span>
            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="attrRequest.baseAttrDto.nullable"
                  value="Y"
                  checked={formData.attrRequest.baseAttrDto.nullable === "Y"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="attrRequest.baseAttrDto.nullable"
                  value="N"
                  checked={formData.attrRequest.baseAttrDto.nullable === "N"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attrRequest: {
                    ...formData.attrRequest,
                    baseAttrDto: {
                      ...formData.attrRequest.baseAttrDto,
                      promptMsg: e.target.value === "" ? null : e.target.value,
                    },
                  },
                })
              }
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
              name="attrRequest.baseAttrDto.inputType"
              value={`${formData.attrRequest.baseAttrDto.inputType}${formData.attrRequest.baseAttrDto.inputType === "4" ? `-${formData.attrRequest.baseAttrDto.textAttrDto.dataType || "C"}` : ""}`}
              onChange={(e) => {
                const value = e.target.value;
                if (value.includes("-")) {
                  const [inputType, dataType] = value.split("-");
                  updateFormData(
                    "attrRequest.baseAttrDto.inputType",
                    inputType,
                  );
                  updateFormData(
                    "attrRequest.baseAttrDto.textAttrDto.dataType",
                    dataType,
                  );
                } else {
                  updateFormData("attrRequest.baseAttrDto.inputType", value);

                  if (value === "5" || value === "C") {
                    updateFormData(
                      "attrRequest.baseAttrDto.textAttrDto.dataType",
                      "C",
                    );
                    // console.log("input type dipilih, data type c");
                  } else {
                    updateFormData(
                      "attrRequest.baseAttrDto.textAttrDto.dataType",
                      null,
                    );
                  }
                }
              }}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Select Input Type...</option>
              {expandedInputTypes.map((inputType, index) => {
                if (inputType?.inputType === "7") return;
                return (
                  <option
                    key={index}
                    value={
                      inputType.dataType
                        ? `${inputType.inputType}-${inputType.dataType}`
                        : inputType.inputType
                    }
                  >
                    {inputType.inputTypeName}
                  </option>
                );
              })}
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attrRequest: {
                    ...formData.attrRequest,
                    baseAttrDto: {
                      ...formData.attrRequest.baseAttrDto,
                      valueScript:
                        e.target.value === "" ? null : e.target.value,
                    },
                  },
                })
              }
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
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
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
                <input
                  type="radio"
                  name="attrRequest.attrType"
                  value="1"
                  checked={formData.attrRequest.attrType === "1"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
                Basic Feature
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="attrRequest.attrType"
                  value="2"
                  checked={formData.attrRequest.attrType === "2"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attrRequest: {
                    ...formData.attrRequest,
                    attrCode: e.target.value === "" ? null : e.target.value,
                  },
                })
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder="Enter feature code"
              required
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attrRequest: {
                    ...formData.attrRequest,
                    attrName: e.target.value === "" ? null : e.target.value,
                  },
                })
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 "
              placeholder="Enter feature name"
              required
              autoComplete="off"
            />
          </div>
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <div className="grid grid-cols-[160px_1fr] items-center gap-4">
              <span className="text-sm text-gray-800">Feature Category:</span>
              <div className="flex flex-row">
                <Popover open={attrCatgOpen} onOpenChange={setAttrCatgOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-[170px] px-2 py-1 text-sm h-10 border border-gray-300 rounded-md flex items-center justify-between"
                    >
                      <span className="truncate w-[85%] text-left">
                        {selectedCatg.length === 0
                          ? "Select Feature Category"
                          : attrCatgList
                              .filter((item) =>
                                selectedCatg.includes(item.attrCatg),
                              )
                              .map((item) => item.attrCatgName)
                              .join(" , ")}
                      </span>
                      <MdKeyboardArrowDown className="h-4 w-4 opacity-50" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[400px] h-[300px] overflow-y-auto">
                    <div className="flex flex-col gap-2">
                      {attrCatgList.map((item) => (
                        <label
                          key={item.attrCatgName}
                          className="flex items-center gap-2 text-md"
                        >
                          <Checkbox
                            checked={selectedCatg.includes(item.attrCatg)}
                            onCheckedChange={(checked) => {
                              // console.log("item.value:", item.value, "checked:", checked);
                              setSelectedCatg((prev) =>
                                checked
                                  ? [...prev, item.attrCatg]
                                  : prev.filter((val) => val !== item.attrCatg),
                              );
                            }}
                          />

                          {item.attrCatgName}
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                {selectedCatg.length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedCatg([]);
                    }}
                    className=""
                  >
                    <KeenIcon icon="cross" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3 - Contact Channel & CSR Visible*/}
        <div className="grid grid-cols-2 gap-8">
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Contact Channel:</span>
            <Popover
              open={contactChannelOpen}
              onOpenChange={setContactChannelOpen}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-[170px] px-2 py-1 text-sm h-10 border border-gray-300 rounded-md flex items-center justify-between"
                >
                  <span className="truncate w-[85%] text-left">
                    {selectedChannels.length === 0
                      ? "Select Contact Channel"
                      : contactChannelList
                          .filter((item) =>
                            selectedChannels.includes(item.contactChannelId),
                          )
                          .map((item) => item.contactChannelName)
                          .join(" , ")}
                  </span>
                  <MdKeyboardArrowDown className="h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>

              <PopoverContent className="w-[400px] h-[300px] overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {contactChannelList.map((item) => (
                    <label
                      key={item.value}
                      className="flex items-center gap-2 text-md"
                    >
                      <Checkbox
                        checked={selectedChannels.includes(
                          item.contactChannelId,
                        )}
                        onCheckedChange={(checked) => {
                          // console.log("item.value:", item.value, "checked:", checked);
                          setSelectedChannels((prev) =>
                            checked
                              ? [...prev, item.contactChannelId]
                              : prev.filter(
                                  (val) => val !== item.contactChannelId,
                                ),
                          );
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
                <input
                  type="radio"
                  name="attrRequest.csrVisible"
                  value="Y"
                  checked={formData.attrRequest.csrVisible === "Y"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="attrRequest.csrVisible"
                  value="N"
                  checked={formData.attrRequest.csrVisible === "N"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
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
                <input
                  type="radio"
                  name="attrRequest.configVisible"
                  value="Y"
                  checked={formData.attrRequest.configVisible === "Y"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="attrRequest.configVisible"
                  value="N"
                  checked={formData.attrRequest.configVisible === "N"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
                No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <span className="text-sm text-gray-800">Instantiation:</span>
            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="attrRequest.instantiatable"
                  value="Y"
                  checked={formData.attrRequest.instantiatable === "Y"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="instantiatable"
                  value="N"
                  checked={formData.attrRequest.instantiatable === "N"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
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
                <input
                  type="radio"
                  name="attrRequest.editable"
                  value="Y"
                  checked={formData.attrRequest.editable === "Y"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="attrRequest.editable"
                  value="N"
                  checked={formData.attrRequest.editable === "N"}
                  onChange={handleInputChange}
                  className="mr-1"
                />
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
          className={`px-4 py-2 rounded focus:outline-none focus:ring-2 
      ${isLoading ? "bg-blue-400 text-white cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500"}`}
        >
          {isLoading ? "Adding..." : "Add"}
        </button>
        <button
          type="button"
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
        <h3 className="text-lg font-semibold text-gray-800">Feature Name</h3>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {String(formData.attrRequest.attrType) === "1"
          ? renderBasicFeatureForm()
          : renderObjectFeatureForm()}
      </div>
    </div>
  );
};

export default FeatureAddForm;
