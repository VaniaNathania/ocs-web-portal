// components/ExpressionPriceDialog.tsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { XMLParser } from "fast-xml-parser";
import { X } from "lucide-react";
import PythonScriptEditor from "./PythonCompiler";

const API_URL = apiConfig.service_price_plan;

export interface ExpressionPrice {
  scriptTempletId: number | null;
  scriptPage: string | null; // 👈 Sama kayak jsonScriptPage di component asli
  ruleScript: string;
  ruleComments: string;
  reId?: number;
  offerVerId?: number;
  spId?: number;
}

interface ScriptTemplate {
  scriptTempletId: number;
  scriptTempletName: string;
}

interface ScriptTemplateDetail {
  scriptTempletName: string;
  templetContent: string;
  templetTypeScript: string;
  templateId: number;
}

interface TemplateProperty {
  id: string;
  name: string;
  displayName: string;
  dataType: string;
  defaultValue: string;
  type: string;
  nullable: string;
  comments: string;
  minValue: string;
  maxValue: string;
  minLength: string;
  maxLength: string;
  value: string;
}

interface Props {
  show: boolean;
  onClose: () => void;
  onSaveSuccess?: () => void;
  scriptToChange?: string;
  reId?: number;
  offerVerId?: number;
}

const ExpressionPriceDialog: React.FC<Props> = ({
  show,
  onClose,
  onSaveSuccess,
  scriptToChange,
  reId,
  offerVerId,
}) => {
  const { GetData, PostData } = useCallApi();
  const [scriptList, setScriptList] = useState<ScriptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ScriptTemplateDetail | null>(null);
  const [templateFields, setTemplateFields] = useState<TemplateProperty[]>([]);
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>(
    {},
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 👈 Tambah flag

  const [formField, setFormField] = useState<ExpressionPrice>({
    scriptTempletId: null,
    scriptPage: null,
    ruleScript: "",
    ruleComments: "",
    reId: reId || 0,
    offerVerId: offerVerId || 0,
    spId: 0,
  });

  //  console.log(formField);
  // 👇 Helper function sama persis kayak ExpressionPriceComponent
  const safeParseScriptPage = (scriptPage: string): Record<string, string> => {
    try {
      const obj = JSON.parse(scriptPage);
      return obj?.[0]?.[""] || {};
    } catch (e) {
      return {};
    }
  };

  // 👇 Fetch data saat dialog dibuka
  const getDetailScript = async () => {
    setIsLoading(true);
    setIsInitialLoad(true); // 👈 Set flag
    try {
      const response = await GetData(
        `${API_URL}/rate-plan/qry-re-price-plan-by-re-and-offer-ver?reId=${reId}&offerVerId=${offerVerId}&spId=0`,
        {},
      );

      if (
        response?.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const data = response.data[0];

        setFormField({
          scriptTempletId: data.scriptTempletId ?? null,
          scriptPage: data.scriptPage ?? null,
          ruleScript: data.ruleScript ?? "",
          ruleComments: data.ruleComments ?? "",
          reId: reId || data.reId || 0,
          offerVerId: offerVerId || data.offerVerId || 0,
          spId: data.spId ?? 0,
        });

        if (data.scriptTempletId) {
          try {
            const templateRes = await GetData(
              `${API_URL}/script-templet/${data.scriptTempletId}`,
              {},
            );
            const templateData = templateRes.data;
            setSelectedTemplate(templateData);

            const parser = new XMLParser({
              ignoreAttributes: false,
              attributeNamePrefix: "",
            });

            const parsed = parser.parse(templateData.templetContent);

            const properties =
              parsed?.zsmart?.Properties?.Property ||
              parsed?.Properties?.Property ||
              [];

            const normalizedProperties: TemplateProperty[] = Array.isArray(
              properties,
            )
              ? properties
              : [properties];

            setTemplateFields(normalizedProperties);

            const existingValues = data.scriptPage
              ? safeParseScriptPage(data.scriptPage)
              : {};

            const mergedValues = normalizedProperties.reduce(
              (acc, prop) => {
                acc[prop.id] =
                  existingValues[prop.id] || prop.defaultValue || "";
                return acc;
              },
              {} as Record<string, string>,
            );

            setDynamicValues(mergedValues);
          } catch (templateError) {
            console.error("Failed to fetch template detail:", templateError);
          }
        }
      } else {
        resetForm();
      }
    } catch (error) {
      console.error("Failed to fetch script detail:", error);
      resetForm();
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false); // 👈 Reset flag setelah selesai
    }
  };

  // 👇 Effect untuk fetch data
  useEffect(() => {
    if (show) {
      fetchScriptList();
      getDetailScript();
    } else {
      // Reset saat dialog ditutup
      resetForm();
    }
  }, [show]);

  const resetForm = () => {
    setFormField({
      scriptTempletId: null,
      scriptPage: null,
      ruleScript: "",
      ruleComments: "",
      reId: reId || 0,
      offerVerId: offerVerId || 0,
      spId: 0,
    });
    setSelectedTemplate(null);
    setTemplateFields([]);
    setDynamicValues({});
  };

  const fetchScriptList = async () => {
    try {
      const res = await GetData(`${API_URL}/script-templet/list`, {});
      setScriptList(res?.data || []);
    } catch (error) {
      console.error("Failed to fetch script templates:", error);
      toast.error("Failed to fetch script templates");
    }
  };

  // 👇 Fetch script detail logic - SAMA PERSIS kayak ExpressionPriceComponent
  const fetchScriptDetail = async (
    scriptTempletId: number,
    isTemplateChange: boolean | null = false,
  ) => {
    try {
      const res = await GetData(
        `${API_URL}/script-templet/${scriptTempletId}`,
        {},
      );
      const templateData = res.data;
      setSelectedTemplate(templateData);

      // Logic sama persis
      const xmlToParse = isTemplateChange
        ? templateData.templetContent
        : scriptToChange && scriptToChange.trim() !== ""
          ? scriptToChange
          : templateData.templetContent;

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
      });

      const parsed = parser.parse(xmlToParse);

      const properties =
        parsed?.zsmart?.Properties?.Property ||
        parsed?.Properties?.Property ||
        [];

      const normalizedProperties: TemplateProperty[] = Array.isArray(properties)
        ? properties
        : [properties];

      setTemplateFields(normalizedProperties);

      const valueItems =
        parsed?.Properties?.value?.group?.item ||
        parsed?.zsmart?.Properties?.value?.group?.item ||
        [];

      const initialValues = normalizedProperties.reduce(
        (acc, prop) => {
          const valueItem = Array.isArray(valueItems)
            ? valueItems.find((item) => item.id === prop.id)
            : valueItems.id === prop.id
              ? valueItems
              : null;

          acc[prop.id] = valueItem?.value || prop.defaultValue || "";
          return acc;
        },
        {} as Record<string, string>,
      );

      setDynamicValues(initialValues);
      updateFormFieldsWithValues(templateData, scriptTempletId, initialValues);
    } catch (error) {
      console.error("Failed to fetch script template detail:", error);
      toast.error("Failed to fetch script template detail");
    }
  };

  // 👇 Update form dengan values - SAMA PERSIS
  const updateFormFieldsWithValues = (
    templateData: ScriptTemplateDetail,
    scriptTempletId: number,
    values: Record<string, string>,
  ) => {
    const scriptPage = JSON.stringify([{ "": values }]); // 👈 Generate JSON
    const ruleScript = injectValuesToScript(
      templateData.templetTypeScript,
      values,
    );

    setFormField((prev) => ({
      ...prev,
      scriptTempletId,
      scriptPage, // 👈 Set scriptPage
      ruleScript,
    }));
  };

  // 👇 Inject values ke script - SAMA PERSIS
  const injectValuesToScript = (
    script: string,
    values: Record<string, string>,
  ): string => {
    let updatedScript = script;

    Object.entries(values).forEach(([key, value]) => {
      const placeholder = `&${key}&`;
      const regex = new RegExp(
        placeholder.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"),
        "g",
      );
      updatedScript = updatedScript.replace(regex, value);
    });

    return updatedScript;
  };

  const handleDynamicValueChange = (fieldId: string, value: string) => {
    const updatedValues = { ...dynamicValues, [fieldId]: value };
    setDynamicValues(updatedValues);

    if (selectedTemplate && formField.scriptTempletId != null) {
      updateFormFieldsWithValues(
        selectedTemplate,
        formField.scriptTempletId,
        updatedValues,
      );
    }
  };

  const handleRuleScriptChange = (value: string) => {
    setFormField((prev) => ({
      ...prev,
      ruleScript: value,
      scriptPage: null,
    }));
  };

  const clearTemplate = () => {
    setFormField((prev) => ({
      ...prev,
      scriptTempletId: null,
      scriptPage: null,
    }));
    setSelectedTemplate(null);
    setTemplateFields([]);
    setDynamicValues({});
  };

  // 👇 Handle template change - SAMA PERSIS
  const handleTemplateChange = (scriptTempletId: string) => {
    const newTemplateId = parseInt(scriptTempletId);
    setFormField((prev) => ({
      ...prev,
      scriptTempletId: newTemplateId,
    }));
  };

  const handleSave = async () => {
    if (!formField.ruleScript.trim()) {
      toast.error("Rule script is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        scriptTempletId: formField.scriptTempletId,
        ruleScript: formField.ruleScript,
        ruleComments: formField.ruleComments,
        scriptPage: formField.scriptPage,
        reId: formField.reId,
        offerVerId: formField.offerVerId,
        spId: formField.spId,
      };

      const response = await PostData(
        `${API_URL}/rate-plan/mod-re-price-plan`,
        payload,
      );

      if (response?.status) {
        toast.success("Expression price saved successfully");

        if (onSaveSuccess) {
          onSaveSuccess();
        }

        onClose();
      } else {
        toast.error(response?.message || "Failed to save expression price");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (formField.scriptTempletId && !isInitialLoad) {
      const isTemplateChange =
        selectedTemplate &&
        selectedTemplate.templateId !== formField.scriptTempletId;
      fetchScriptDetail(formField.scriptTempletId, isTemplateChange);
    }
  }, [formField.scriptTempletId]);

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Reservation Rule
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
              <p className="text-sm text-gray-500">Loading script data...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* Script Template Section */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Script Template
                </Label>
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Select
                      value={formField.scriptTempletId?.toString() || ""}
                      onValueChange={handleTemplateChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Template (Optional)" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        {scriptList.map((template) => (
                          <SelectItem
                            key={template.scriptTempletId}
                            value={template.scriptTempletId.toString()}
                          >
                            {template.scriptTempletName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formField.scriptTempletId && (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={clearTemplate}
                      className="shrink-0 h-10 w-10"
                      title="Clear template"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Remarks Section */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Remarks
                </Label>
                <Input
                  type="text"
                  autoComplete="off"
                  value={formField.ruleComments ?? ""}
                  onChange={({ target }) => {
                    setFormField((prev) => ({
                      ...prev,
                      ruleComments: target.value,
                    }));
                  }}
                  placeholder="Enter remarks (optional)"
                  className="w-full"
                />
              </div>

              {/* Template Parameters Section */}
              {templateFields.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Template Parameters
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Configure the template parameters below
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {templateFields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {field.displayName || field.name}
                          {field.nullable === "false" && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        <Input
                          value={dynamicValues[field.id] || ""}
                          onChange={(e) =>
                            handleDynamicValueChange(field.id, e.target.value)
                          }
                          placeholder={
                            field.defaultValue ||
                            `Enter ${field.displayName || field.name}`
                          }
                          required={field.nullable === "false"}
                          className="w-full"
                        />
                        {field.comments && (
                          <p className="text-xs text-gray-500 mt-1">
                            {field.comments}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rule Script Section */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Python Script Editor */}
                  <div className="space-y-2">
                    <PythonScriptEditor
                      value={formField.ruleScript}
                      onChange={handleRuleScriptChange}
                      disabled={!!formField.scriptTempletId}
                      isTemplateGenerated={!!formField.scriptTempletId}
                    />
                  </div>

                  {/* Script Page Preview (JSON) */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Script Page (JSON)
                    </Label>
                    <Textarea
                      value={formField.scriptPage || ""}
                      readOnly
                      className="text-xs font-mono bg-gray-50 border-gray-300"
                      rows={12}
                      placeholder="Auto-generated from template parameters"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving || isLoading}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="min-w-[100px] bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpressionPriceDialog;
