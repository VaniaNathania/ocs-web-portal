import React, { useEffect, useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { XMLParser } from "fast-xml-parser";
import { Plus, X } from "lucide-react";

const API_URL = apiConfig.service_price_plan;

export interface AdvancedBenefit {
  scriptTempletId: number | null;
  jsonScriptPage: string | null;
  ruleScript: string|null;
  advancedBenefitRemarks: string|null;
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
  data: AdvancedBenefit | null;
  onChange: (data: AdvancedBenefit | null) => void;
  scriptToChange?: string;
}

const AdvancedBenefitComponent: React.FC<Props> = ({
  data,
  onChange,
  scriptToChange,
}) => {
  const { GetData, PostData, PythonData } = useCallApi();
  const [isActive, setIsActive] = useState<boolean>(!!data);
  const [scriptList, setScriptList] = useState<ScriptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ScriptTemplateDetail | null>(null);
  const [templateFields, setTemplateFields] = useState<TemplateProperty[]>([]);
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>(
    {}
  );

  const [formField, setFormField] = useState<AdvancedBenefit>({
    scriptTempletId: null,
    jsonScriptPage: null,
    ruleScript: "",
    advancedBenefitRemarks: "",
  });

  useEffect(() => {
    if (data === null) {
      setIsActive(false);
      setFormField({
        scriptTempletId: null,
        jsonScriptPage: null,
        ruleScript: "",
        advancedBenefitRemarks: "",
      });
    } else {
      setIsActive(true);
      setFormField(data);
      const parsedJson = safeParseJsonScriptPage(data.jsonScriptPage ?? "");
      setDynamicValues(parsedJson);
    }
  }, []);

  const safeParseJsonScriptPage = (json: string): Record<string, string> => {
    try {
      const obj = JSON.parse(json);
      return obj?.[0]?.[""] || {};
    } catch (e) {
      return {};
    }
  };

  useEffect(() => {
    if (isActive) {
      onChange(formField);
    }
  }, [formField]);

  const fetchScriptList = async () => {
    try {
      const res = await GetData(`${API_URL}/script-templet/list`, {});
      setScriptList(res?.data || []);
    } catch (error) {
      console.error("Failed to fetch script templates:", error);
      toast.error("Failed to fetch script templates");
    }
  };

  const fetchScriptDetail = async (
    scriptTempletId: number,
    isTemplateChange: boolean | null = false
  ) => {
    try {
      const res = await GetData(
        `${API_URL}/script-templet/${scriptTempletId}`,
        {}
      );
      const templateData = res.data;
      setSelectedTemplate(templateData);

      // If this is a template change, always use fresh template content
      // If this is initial load, use scriptToChange if it exists, otherwise use template content
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

      // Get values from parsed.Properties.value.group.item
      const valueItems =
        parsed?.Properties?.value?.group?.item ||
        parsed?.zsmart?.Properties?.value?.group?.item ||
        [];

      // Create initial values object from the value items
      const initialValues = normalizedProperties.reduce(
        (acc, prop) => {
          // Find corresponding value item
          const valueItem = Array.isArray(valueItems)
            ? valueItems.find((item) => item.id === prop.id)
            : valueItems.id === prop.id
              ? valueItems
              : null;

          // Use value from valueItem if found, otherwise use default
          acc[prop.id] = valueItem?.value || prop.defaultValue || "";
          return acc;
        },
        {} as Record<string, string>
      );

      setDynamicValues(initialValues);
      updateFormFieldsWithValues(templateData, scriptTempletId, initialValues);
    } catch (error) {
      console.error("Failed to fetch script template detail:", error);
      toast.error("Failed to fetch script template detail");
    }
  };

  const updateFormFieldsWithValues = (
    templateData: ScriptTemplateDetail,
    scriptTempletId: number,
    values: Record<string, string>
  ) => {
    // Add condition: if scriptTempletId is null, set jsonScriptPage to null
    const jsonScriptPage = scriptTempletId
      ? JSON.stringify([{ "": values }])
      : null;

    const ruleScript = injectValuesToScript(
      templateData.templetTypeScript,
      values
    );

    setFormField((prev) => ({
      ...prev,
      scriptTempletId,
      jsonScriptPage,
      ruleScript,
    }));
  };

  const injectValuesToScript = (
    script: string,
    values: Record<string, string>
  ): string => {
    let updatedScript = script;

    Object.entries(values).forEach(([key, value]) => {
      const placeholder = `&${key}&`;
      const regex = new RegExp(
        placeholder.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"),
        "g"
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
        updatedValues
      );
    }
  };

  const handleRuleScriptChange = (value: string) => {
    setFormField((prev) => ({
      ...prev,
      ruleScript: value,
      jsonScriptPage: null, // Set to null when user writes manually
    }));
  };

  const clearTemplate = () => {
    setFormField((prev) => ({
      ...prev,
      scriptTempletId: null,
      jsonScriptPage: null,
    }));
    setSelectedTemplate(null);
    setTemplateFields([]);
    setDynamicValues({});
  };

  const compileRuleScript = async () => {
    try {
      const response = await PythonData(
        `${API_URL}/validator/compile-phyton-script`,
        {
          phytonScript: formField.ruleScript,
        }
      );

      if (response.status) {
        toast.success(response.validationMessage || "Compiled successfully");
      } else {
        if (response.errorType === "syntax_error") {
          toast.error(`Syntax Error: ${response.validationMessage}`);
        } else {
          toast.error(response.validationMessage || "Failed to compile");
        }
      }
    } catch (error) {
      console.error("Compile error:", error);
      toast.error("An error occurred while compiling the script.");
    }
  };

  const handleTemplateChange = (scriptTempletId: string) => {
    const newTemplateId = parseInt(scriptTempletId);

    setFormField((prev) => ({
      ...prev,
      scriptTempletId: newTemplateId,
    }));
  };

  useEffect(() => {
    if (formField.scriptTempletId) {
      // Check if this is a template change (different from current selected template)
      const isTemplateChange =
        selectedTemplate &&
        selectedTemplate.templateId !== formField.scriptTempletId;
      fetchScriptDetail(formField.scriptTempletId, isTemplateChange);
    }
  }, [formField.scriptTempletId]);

  useEffect(() => {
    fetchScriptList();
  }, []);

  return (
    <div className="space-y-4">
      {!isActive ? (
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-800">Reference Accumulation</h4>
          <Button
            size="sm"
            onClick={() => setIsActive(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-4">
              {/* Script Template Section - Full width with better layout */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Script Template</Label>
                <div className="flex gap-2 items-start">
                  <div className="flex-1 min-w-0">
                    <Select
                      value={formField.scriptTempletId?.toString() || ""}
                      onValueChange={handleTemplateChange}
                    >
                      <SelectTrigger>
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
                      size="sm"
                      variant="outline"
                      onClick={clearTemplate}
                      className="px-2 flex-shrink-0"
                      title="Clear template"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Remarks Section - Full width */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Remarks</Label>
                <Input
                  type="text"
                  autoComplete="off"
                  value={formField.advancedBenefitRemarks ?? ""}
                  onChange={({ target }) => {
                    setFormField((prev) => ({
                      ...prev,
                      advancedBenefitRemarks: target.value,
                    }));
                  }}
                />
              </div>
            </div>

            {templateFields.length > 0 && (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-700">
                    Template Parameters
                  </Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templateFields.map((field) => (
                    <div key={field.id} className="space-y-1">
                      <Label className="text-sm font-medium">
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
                      />
                      {field.comments && (
                        <p className="text-xs text-gray-500">
                          {field.comments}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-gray-700">
                  Rule Script
                </Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">
                      Rule Script
                      {formField.scriptTempletId && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Auto-generated from template)
                        </span>
                      )}
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={compileRuleScript}
                      className="h-7 px-3 text-xs"
                      disabled={!formField?.ruleScript?.trim()}
                    >
                      Run
                    </Button>
                  </div>
                  <Textarea
                    value={formField.ruleScript || ""}
                    onChange={(e) => handleRuleScriptChange(e.target.value)}
                    className="text-xs font-mono"
                    rows={12}
                    placeholder="Enter your rule script here..."
                    disabled={!!formField.scriptTempletId}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    JSON Script Page
                  </Label>
                  <Textarea
                    value={formField.jsonScriptPage || ""}
                    readOnly
                    className="text-xs font-mono bg-gray-50"
                    rows={12}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="text-red-500 border-red-300 hover:bg-red-50"
                  onClick={() => {
                    setIsActive(false);
                    setFormField({
                      scriptTempletId: null,
                      jsonScriptPage: null,
                      ruleScript: "",
                      advancedBenefitRemarks: "",
                    });
                    clearTemplate();
                    onChange(null);
                  }}
                >
                  Remove Expression Price
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!data && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-md">
          No expression price added yet. Click "Add" to create one.
        </div>
      )}
    </div>
  );
};

export default AdvancedBenefitComponent;
