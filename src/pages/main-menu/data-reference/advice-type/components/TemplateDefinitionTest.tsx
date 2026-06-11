import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdviceTypeContext } from "../hooks/useAdviceTypeContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { apiConfigPython, apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import { adviceTypeLangProps } from "../hooks/AdviceTypeContext";
import axios from "axios";
import { DefaultTooltip, KeenIcon } from "@/components";
import { useCallApi } from "@/hooks";
import { template } from "handlebars";
import { htmlToPlainText } from "./TemplateDefinitionAdviceType";

const API_URL_PYTHON = apiConfigPython.python;

export const macroExtraParamMap: Record<string, string[]> = {
  OFFER_ACTIVE_CODE: ["OFFER_CODE"],
  OFFER_CATG_ID: ["PricePlanId"],
  PRICE_ACTIVE_CODE: ["PricePlanCode"],
  OFFER_NAME: ["PricePlanId"],
  OFFER_COMMENTS_CODE: ["OFFER_CODE"],
  OFFER_COMMENTS_ID: ["PricePlanId"],
};

const TemplateDefinitionTest = () => {
  const { PostData } = useCallApi();
  const { showTestTemplateDefinition, setShowTestTemplateDefinition, selectedMessageChannel, titleParam, emailContent, messageTemplate, messageTemplateLang, dynamicParams, formData, setFormData, setShowTemplateDefinition, setShowTemplateMulti, templateDefinitionMode, selectedContent, adviceTypeLangList, setAdviceTypeLangList, selectedLangData, selectedMacroList, selectedParamList, setShowKeyValueParam, paramListValue, setParamListValue, macroListValue, compileEmailMode } = useAdviceTypeContext();
  const [compileLoading, setCompileLoading] = useState(false);
  const [beginTestLoading, setBeginTestLoading] = useState(false);
  const [testResultDialog, setTestResultDialog] = useState("");
  const [testResultLang, setTestResultLang] = useState("");
  const [isCompileSuccessDialog, setIsCompileSuccessDialog] = useState(false);
  const [isCompileSuccessLang, setIsCompileSuccessLang] = useState(false);
  const [paramAcc, setParamAcc] = useState("");
  const [paramSubs, setParamSubs] = useState("");

  const currentTemplate = templateDefinitionMode === "addDialog" ? messageTemplate : messageTemplateLang;
  const testResult = templateDefinitionMode === "addDialog" ? testResultDialog : testResultLang;
  const isCompileSuccess = templateDefinitionMode === "addDialog" ? isCompileSuccessDialog : isCompileSuccessLang;
  const hasStrMsg = /strMsg\s*=/.test(currentTemplate);
  const hasPrint = /print\s*\(/.test(currentTemplate);
  const hasOutput = hasStrMsg || hasPrint;

  const assignmentLines: string[] = [];

  selectedMacroList.forEach((m) => {
    assignmentLines.push(`${m} = Macro.get('${m}')`);

    const extraParams = macroExtraParamMap[m];
    if (extraParams?.length) {
      extraParams.forEach((p) => {
        assignmentLines.push(`${p} = Param.get('${p}')`);
      });
    }
  });

  selectedParamList.forEach((p) => {
    assignmentLines.push(`${p} = Param.get('${p}')`);
  });

  const assignmentCode = assignmentLines.join("\n");

  const macroExtraParams = selectedMacroList.flatMap((m) => macroExtraParamMap[m] || []);

  const mergedParamList = Array.from(new Set([...selectedParamList, ...macroExtraParams, ...dynamicParams]));

  const paramPayload = mergedParamList.reduce(
    (acc, p) => {
      acc[p] = paramListValue[p] && paramListValue[p].trim() !== "" ? paramListValue[p] : macroListValue[p] || null;
      return acc;
    },
    {} as Record<string, string | null>,
  );

  let finalCode = "";

  //  RESET STATE SAAT MODE BERUBAH
  useEffect(() => {
    if (!showTestTemplateDefinition) {
      setTestResultDialog("");
      setTestResultLang("");
      setIsCompileSuccessDialog(false);
      setIsCompileSuccessLang(false);
    }
  }, [showTestTemplateDefinition]);

  useEffect(() => {
    const newValues: Record<string, string> = {};

    selectedParamList.forEach((p) => {
      newValues[p] = paramListValue[p] ?? "";
    });

    setParamListValue(newValues);
  }, [selectedParamList]);

  const handleCompile = async () => {
    setCompileLoading(true);

    if (templateDefinitionMode === "addDialog") {
      setIsCompileSuccessDialog(false);
    } else {
      setIsCompileSuccessLang(false);
    }

    try {
      const safeTemplate = currentTemplate.startsWith("\n") ? currentTemplate : "\n" + currentTemplate;

      finalCode = assignmentCode ? `${assignmentCode}${safeTemplate}` : currentTemplate;

      if (!hasOutput) {
        if (selectedParamList.length > 0 || selectedMacroList.length > 0) {
          const vars = [...macroExtraParams, ...selectedParamList];
          finalCode += `\n\nstrMsg = f"${vars.map((v) => `{${v}}`).join(", ")}"`;
        } else {
          finalCode += `\n\nstrMsg = ""`;
        }
      }

      const response = await axios.post(`${API_URL_PYTHON}/api/python/run`, {
        code: finalCode,
        params: paramPayload,
      });

      const result = response.data?.data?.output;

      if (!result?.success) {
        throw new Error(result?.message || "Compile failed");
      }

      const output = result.output ?? "";

      toast.success("Compiled successfully!");

      if (templateDefinitionMode === "addDialog") {
        setTestResultDialog(output);
        setIsCompileSuccessDialog(true);
      } else {
        setTestResultLang(output);
        setIsCompileSuccessLang(true);
      }
    } catch (error: any) {
      const output = error?.message || error?.response?.data?.data?.output?.message || "Failed to compiled. Please try again.";

      toast.error(error?.message || "Compile failed");

      if (templateDefinitionMode === "addDialog") {
        setTestResultDialog(output);
        setIsCompileSuccessDialog(false);
      } else {
        setTestResultLang(output);
        setIsCompileSuccessLang(false);
      }
    } finally {
      setCompileLoading(false);
    }
  };

  const handleCompileText = async () => {
    const payload = {
      adviceChannel: selectedMessageChannel,
      template: htmlToPlainText(emailContent),
      params: paramPayload,
    };

    setBeginTestLoading(true);

    if (templateDefinitionMode === "addDialog") {
      setIsCompileSuccessDialog(false);
    } else {
      setIsCompileSuccessLang(false);
    }
    try {
      const response = await PostData(`${API_URL_PYTHON}/api/python/msg-compile`, payload);

      if (response?.status) {
        setTestResultDialog(response?.data);
        setIsCompileSuccessDialog(true);
        toast.success("Compiled email successfully!");
      } else {
        const errorMessage = response?.message || "Failed to compiled";
        toast.error(errorMessage);
        setTestResultDialog(errorMessage);
        setIsCompileSuccessDialog(false);
      }
    } catch (error: any) {
      const output = error?.message || error?.response?.message || "Failed to compiled. please try again.";
      toast.error(output || "Compiled failed");
      setTestResultDialog(output);
      setIsCompileSuccessDialog(false);
    } finally {
      setBeginTestLoading(false);
    }
  };

  const handleCompileHTML = async () => {
    setBeginTestLoading(true);

    const payload = {
      adviceChannel: selectedMessageChannel,
      template: htmlToPlainText(emailContent),
      params: paramPayload,
    };

    try {
      const response = await axios.post(`${API_URL_PYTHON}/api/python/mgs-compile-preview`, payload, {
        responseType: "text",
        headers: {
          Accept: "text/html",
        },
      });

      setTestResultDialog(response?.data);
      setIsCompileSuccessDialog(true);
    } catch (error: any) {
      const output = error?.message || error?.response?.message || "Failed to compiled. please try again.";
      toast.error(output);
      setTestResultDialog(output);
      setIsCompileSuccessDialog(false);
    } finally {
      setBeginTestLoading(false);
    }
  };

  const handleOk = () => {
    if (!isCompileSuccess) {
      toast.error("Please compile the template successfully first");
      return;
    }

    if (templateDefinitionMode === "addDialog") {
      setFormData({
        ...formData,
        msgDefine: currentTemplate,
      });
      toast.success("Template saved successfully");
      // console.log("formData:", formData.msgDefine)
      setShowTemplateDefinition(false);
    } else {
      if (!selectedLangData) {
        toast.error("Language data not found");
        return;
      }

      const newLangData: adviceTypeLangProps = {
        adviceType: selectedContent?.adviceType ? Number(selectedContent.adviceType) : 0,
        defLangId: selectedLangData.defLangId,
        defLangName: selectedLangData?.defLangName,
        msgDefine: currentTemplate,
        spId: formData.spId || 0,
        subjectDefine: formData.subjectDefine || "",
        adviceTypeName: String(selectedContent?.adviceTypeName),
      };

      const existingIndex = adviceTypeLangList.findIndex((item) => item.defLangId === newLangData.defLangId);

      if (existingIndex !== -1) {
        setAdviceTypeLangList((prev) => prev.map((item) => (item.defLangId === newLangData.defLangId ? newLangData : item)));
        toast.success("Multi-language template updated successfully");
      } else {
        setAdviceTypeLangList((prev) => [...prev, newLangData]);
        toast.success("Multi-language template added successfully");
      }

      setShowTemplateMulti(false);
    }

    setShowTestTemplateDefinition(false);

    if (templateDefinitionMode === "addDialog") {
      setTestResultDialog("");
      setIsCompileSuccessDialog(false);
    } else {
      setTestResultLang("");
      setIsCompileSuccessLang(false);
    }
  };

  const handleClose = () => {
    setShowTestTemplateDefinition(false);
    setParamAcc("");
    setParamSubs("");

    if (templateDefinitionMode === "addDialog") {
      setTestResultDialog("");
      setIsCompileSuccessDialog(false);
    } else {
      setTestResultLang("");
      setIsCompileSuccessLang(false);
    }
  };

  return (
    <Dialog open={showTestTemplateDefinition} onOpenChange={setShowTestTemplateDefinition}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Template Definition Test - {templateDefinitionMode === "addDialog" ? "Default" : "Multi Language"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 p-5">
          <h2 className="font-medium text-black">Test</h2>

          <div className="flex flex-row gap-2 justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm w-32 flex flex-row items-center justify-between">
                ACC_NBR
                <Input type="checkbox" checked={true} className="w-4 h-4 rounded-md border border-gray-100" />
              </label>
              <Input
                type="text"
                className="w-96 h-8 text-sm"
                value={paramAcc}
                onChange={(e) => {
                  setParamAcc(e.target.value);
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm w-20">SUBS_ID</label>
              <Input type="checkbox" checked={true} className="w-4 h-4 rounded-md border border-gray-100" />

              <Input
                type="text"
                className="w-96 h-8 text-sm"
                value={paramSubs}
                onChange={(e) => {
                  setParamSubs(e.target.value);
                }}
              />
            </div>
          </div>

          {selectedMessageChannel === "EMAIL" && (
            <div className="flex flex-row items-center gap-2">
              <label className="text-sm w-32">Title</label>
              <Input type="text" className="flex-1 h-8" value={titleParam} disabled />
            </div>
          )}

          <div className="flex flex-row gap-2 relative">
            <label className="text-sm w-32">Template Definition</label>
            <Textarea className="border border-gray-300 rounded-md text-sm flex-1 min-h-[150px]" value={currentTemplate} disabled />
            <div className="absolute right-0 p-1">
              {/* {(selectedParamList.length > 0 || selectedMacroList.length > 0) && ( */}
              <DefaultTooltip title="Field param value">
                <Button className="" variant={"outline"} size={"sm"} onClick={() => setShowKeyValueParam(true)}>
                  <KeenIcon icon="notepad-edit" className="" />
                </Button>
              </DefaultTooltip>
              {/* )} */}
            </div>
          </div>

          <div className="flex flex-row gap-2">
            <label className="text-sm w-32">Test Result</label>
            <Textarea className={`border rounded-md text-sm min-h-[150px] flex-1 ${testResult && isCompileSuccess ? "border-green-500" : testResult && !isCompileSuccess ? "border-red-500" : "border-gray-300"}`} value={testResult} disabled />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          {selectedMessageChannel !== "EMAIL" && (
            <Button
              variant="default"
              className="text-sm px-3"
              onClick={() => {
                if (selectedMessageChannel === "EMAIL") {
                  handleCompileText();
                } else {
                  handleCompile();
                }
              }}
              disabled={compileLoading}
            >
              {compileLoading ? "Compiling..." : "Compile"}
            </Button>
          )}
          {selectedMessageChannel === "EMAIL" && (
            <Button
              variant="default"
              className="text-sm px-3"
              onClick={() => {
                if (selectedMessageChannel === "EMAIL") {
                  if (compileEmailMode === "text") {
                    handleCompileText();
                  } else {
                    handleCompileHTML();
                  }
                } else {
                  handleCompile();
                }
              }}
              disabled={beginTestLoading}
            >
              {beginTestLoading ? "Begin Test..." : "Begin Test"}
            </Button>
          )}
          <Button
            variant="outline"
            className="text-sm px-3"
            onClick={() => {
              handleClose();
              setParamListValue({});
            }}
          >
            Close Test
          </Button>
          <Button variant="outline" className="text-sm px-3" onClick={handleOk} disabled={!isCompileSuccess}>
            Ok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDefinitionTest;
