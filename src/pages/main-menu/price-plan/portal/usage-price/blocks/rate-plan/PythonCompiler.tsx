// components/PythonCompiler.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";

const API_URL = apiConfig.service_price_plan;

interface PythonScriptEditorProps {
  value: string; // Bisa undefined dari parent
  onChange: (value: string) => void;
  disabled?: boolean;
  isTemplateGenerated?: boolean;
}

const PythonScriptEditor: React.FC<PythonScriptEditorProps> = ({
  value,
  onChange,
  disabled = false,
  isTemplateGenerated = false,
}) => {
  const { PythonData } = useCallApi();

  const compileRuleScript = async () => {
    // 👇 Handle undefined/null value
    const scriptValue = value || "";
    
    if (!scriptValue.trim()) {
      toast.error("Script is empty");
      return;
    }

    try {
      const response = await PythonData(
        `${API_URL}/validator/compile-phyton-script`,
        {
          phytonScript: scriptValue,
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

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">
          Rule Script <span className="text-red-500">*</span>
          {isTemplateGenerated && (
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
          disabled={!value?.trim()} // 👈 Handle undefined
        >
          Run
        </Button>
      </div>
      <Textarea
        value={value || ""} // 👈 Fallback ke empty string
        onChange={(e) => onChange(e.target.value)}
        className="text-xs font-mono"
        rows={12}
        placeholder="Enter your rule script here..."
        disabled={disabled}
      />
    </div>
  );
};

export default PythonScriptEditor;