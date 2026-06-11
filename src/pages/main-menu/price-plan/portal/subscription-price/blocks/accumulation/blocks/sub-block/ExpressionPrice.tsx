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
import { useFormContext } from "react-hook-form";
import { SubscriptionCreateAcmFormType } from "../AddPriceDialog";
// import { SubscriptionCreatePriceRatingForm } from "./AddPriceVersionDialog";

const API_URL = apiConfig.service_price_plan;

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
}

export interface CompileResponse {
  message: string;
  status: number;
  data: {
    message: string;
  };
}

const ExpressionPrice = () => {
  const { GetData, PythonData } = useCallApi();
  const { setValue, watch } =
    useFormContext<SubscriptionCreateAcmFormType>();

  const currentExpressionPrice = watch("expressionPrice");

  const [isActive, setIsActive] = useState<boolean>(false);
  const [scriptList, setScriptList] = useState<ScriptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ScriptTemplateDetail | null>(null);
  const [templateFields, setTemplateFields] = useState<TemplateProperty[]>([]);
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>(
    {}
  );

  // Helper function to safely parse jsonScriptPage
  const safeParseJsonScriptPage = (json: string): Record<string, string> => {
    try {
      const obj = JSON.parse(json);
      return obj?.[0]?.[""] || {};
    } catch (e) {
      return {};
    }
  };

  // Initialize state from form data
  useEffect(() => {
    const hasExpressionPrice =
      currentExpressionPrice &&
      (currentExpressionPrice.scriptTempletId ||
        currentExpressionPrice.ruleScript ||
        currentExpressionPrice.jsonScriptPage ||
        currentExpressionPrice.ruleComment);

    if (hasExpressionPrice) {
      setIsActive(true);
      // Parse existing jsonScriptPage to populate dynamic values
      if (currentExpressionPrice.jsonScriptPage) {
        const parsedJson = safeParseJsonScriptPage(
          currentExpressionPrice.jsonScriptPage
        );
        setDynamicValues(parsedJson);
      }
    }
  }, [currentExpressionPrice]);

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
      // If this is initial load, use existing rule script if it exists, otherwise use template content
      const xmlToParse = isTemplateChange
        ? templateData.templetContent
        : currentExpressionPrice?.ruleScript &&
            currentExpressionPrice.ruleScript.trim() !== ""
          ? templateData.templetContent // Use template content to parse fields, but keep existing script
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

      // Create initial values object from the value items or existing dynamicValues
      const initialValues = normalizedProperties.reduce(
        (acc, prop) => {
          // If we have existing dynamic values (from jsonScriptPage), use them
          if (dynamicValues[prop.id] !== undefined) {
            acc[prop.id] = dynamicValues[prop.id];
          } else {
            // Find corresponding value item
            const valueItem = Array.isArray(valueItems)
              ? valueItems.find((item) => item.id === prop.id)
              : valueItems.id === prop.id
                ? valueItems
                : null;

            // Use value from valueItem if found, otherwise use default
            acc[prop.id] = valueItem?.value || prop.defaultValue || "";
          }
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

    setValue("expressionPrice", {
      scriptTempletId,
      jsonScriptPage,
      ruleScript,
      ruleComment: currentExpressionPrice?.ruleComment || null,
    });
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

    if (selectedTemplate && currentExpressionPrice?.scriptTempletId != null) {
      updateFormFieldsWithValues(
        selectedTemplate,
        currentExpressionPrice.scriptTempletId,
        updatedValues
      );
    }
  };

  const handleScriptTemplateChange = (value: string) => {
    const newTemplateId = parseInt(value);

    // Update form field first
    setValue("expressionPrice", {
      ...currentExpressionPrice,
      scriptTempletId: newTemplateId,
    });
  };

  const handleRemarksChange = (value: string) => {
    setValue("expressionPrice", {
      ...currentExpressionPrice,
      ruleComment: value || null,
    });
  };

  const handleRuleScriptChange = (value: string) => {
    setValue("expressionPrice", {
      ...currentExpressionPrice,
      ruleScript: value,
      jsonScriptPage: null,
    });
  };

  const clearTemplate = () => {
    // First clear the form field
    setValue("expressionPrice", {
      ...currentExpressionPrice,
      scriptTempletId: null,
      jsonScriptPage: null,
    });
    // Then clear template-related state
    setSelectedTemplate(null);
    setTemplateFields([]);
    setDynamicValues({});
  };

  const compileRuleScript = async () => {
    try {
      const response = await PythonData(
        `${API_URL}/validator/compile-phyton-script`,
        {
          phytonScript: currentExpressionPrice?.ruleScript,
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

  const handleAddExpressionPrice = () => {
    setIsActive(true);
    setValue("expressionPrice", {
      scriptTempletId: null,
      jsonScriptPage: null,
      ruleScript: "",
      ruleComment: "",
    });
  };

  const handleRemoveExpressionPrice = () => {
    setIsActive(false);
    setSelectedTemplate(null);
    setTemplateFields([]);
    setDynamicValues({});
    setValue("expressionPrice", {
      scriptTempletId: null,
      jsonScriptPage: null,
      ruleScript: null,
      ruleComment: null,
    });
  };

  // Effect to handle template change
  useEffect(() => {
    if (currentExpressionPrice?.scriptTempletId) {
      // Check if this is a template change (different from current selected template)
      const isTemplateChange =
        selectedTemplate &&
        selectedTemplate.templateId !== currentExpressionPrice.scriptTempletId;
      fetchScriptDetail(
        currentExpressionPrice.scriptTempletId,
        isTemplateChange
      );
    }
  }, [currentExpressionPrice?.scriptTempletId]);

  useEffect(() => {
    fetchScriptList();
  }, []);

  return (
    <div className="space-y-4">
      {!isActive ? (
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-800">Expression Price</h4>
          <Button
            type="button"
            size="sm"
            onClick={handleAddExpressionPrice}
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
                      value={
                        currentExpressionPrice?.scriptTempletId?.toString() ||
                        ""
                      }
                      onValueChange={handleScriptTemplateChange}
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
                  {currentExpressionPrice?.scriptTempletId && (
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
                  value={currentExpressionPrice?.ruleComment ?? ""}
                  onChange={(e) => handleRemarksChange(e.target.value)}
                  placeholder="Enter remarks"
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
                      {currentExpressionPrice?.scriptTempletId && (
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
                      disabled={!currentExpressionPrice?.ruleScript?.trim()}
                    >
                      Run
                    </Button>
                  </div>
                  <Textarea
                    value={currentExpressionPrice?.ruleScript || ""}
                    onChange={(e) => handleRuleScriptChange(e.target.value)}
                    className="text-xs font-mono"
                    rows={12}
                    placeholder="Enter your rule script here..."
                    disabled={!!currentExpressionPrice?.scriptTempletId}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    JSON Script Page
                  </Label>
                  <Textarea
                    value={currentExpressionPrice?.jsonScriptPage || ""}
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
                  onClick={handleRemoveExpressionPrice}
                >
                  Remove Expression Price
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isActive && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-md">
          No expression price added yet. Click "Add" to create one.
        </div>
      )}
    </div>
  );
};

export default ExpressionPrice;
