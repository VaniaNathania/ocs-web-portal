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

export interface TriggerRule {
  scriptTempletId: number | null;
  scriptPage: string | null;
  ruleScript: string | null;
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
  data: TriggerRule | null;
  onChange: (data: TriggerRule | null) => void;
  scriptToChange?: string;
}

const TriggerRuleComponent: React.FC<Props> = ({
  data,
  onChange,
  scriptToChange,
}) => {
  const { GetData, PythonData } = useCallApi();
  const [isActive, setIsActive] = useState<boolean>(!!data);
  const [scriptList, setScriptList] = useState<ScriptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ScriptTemplateDetail | null>(null);
  const [templateFields, setTemplateFields] = useState<TemplateProperty[]>([]);
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>(
    {}
  );

  const [formField, setFormField] = useState<TriggerRule>({
    scriptTempletId: null,
    scriptPage: null,
    ruleScript: "",
  });

  useEffect(() => {
    if (data === null) {
      setIsActive(false);
      setFormField({
        scriptTempletId: null,
        scriptPage: null,
        ruleScript: "",
      });
    } else {
      setIsActive(true);
      setFormField(data);
      const parsedJson = safeParsescriptPage(data.scriptPage ?? "");
      setDynamicValues(parsedJson);
    }
  }, []);

  const safeParsescriptPage = (json: string): Record<string, string> => {
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
    
  };

  const fetchScriptDetail = async (
    scriptTempletId: number,
    isTemplateChange: boolean | null = false
  ) => {
   
  };

  const updateFormFieldsWithValues = (
    templateData: ScriptTemplateDetail,
    scriptTempletId: number,
    values: Record<string, string>
  ) => {
    // Add condition: if scriptTempletId is null, set scriptPage to null
    const scriptPage = scriptTempletId
      ? JSON.stringify([{ "": values }])
      : null;

    const ruleScript = injectValuesToScript(
      templateData.templetTypeScript,
      values
    );

    setFormField((prev) => ({
      ...prev,
      scriptTempletId,
      scriptPage,
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
      scriptPage: null, // Set to null when user writes manually
    }));
  };

  const clearTemplate = () => {
    // First clear the form field
    setFormField((prev) => ({
      ...prev,
      scriptTempletId: null,
      scriptPage: null,
    }));
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

  // Handle template selection change
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
                    value={formField.ruleScript ?? ""}
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
                    value={formField.scriptPage || ""}
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
                      scriptPage: null,
                      ruleScript: "",
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

export default TriggerRuleComponent;
