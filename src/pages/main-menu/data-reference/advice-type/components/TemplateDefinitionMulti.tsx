import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdviceTypeContext } from "../hooks/useAdviceTypeContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import AdviceTypeAction from "../action/AdviceTypeAction";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { TemplateItemType } from "./TemplateDefinitionAdviceType";

const TemplateDefinitionMulti = () => {
  const { showTemplateMulti, setShowTemplateMulti, selectedContent, selectedMacroList, setSelectedMacroList, setMessageTemplateLang, messageTemplateLang, setShowTestTemplateDefinition, setTemplateDefinitionMode, selectedLangData, setSelectedLangData, adviceTypeLangList, selectedLangId, setSelectedLangId, templateDefinitionLang, setTemplateDefinitionLang, selectedParamList, setSelectedParamList } = useAdviceTypeContext();
  const { lang, fetchingLang, macroList, fetchMacroList, macroListLoading } = AdviceTypeAction();
  const [macroListOpen, setMacroListOpen] = useState(false);
  const [paramListOpen, setParamListOpen] = useState(false);

  const [errors, setErrors] = useState({
    language: "",
    templateDefinition: "",
  });

  const extractTemplateItemType = (template: string, type: TemplateItemType): string[] => {
    const regex = type === "macro" ? /Macro\.get\(['"]([^'"]+)['"]\)/g : /Param\.get\(['"]([^'"]+)['"]\)/g;
    const matches = [...template.matchAll(regex)];
    return matches.map((match) => match[1]);
  };

  useEffect(() => {
    if (!showTemplateMulti) return;

    fetchingLang();
    setErrors({ language: "", templateDefinition: "" });

    if (!selectedLangData) {
      setSelectedLangId("");
      setTemplateDefinitionLang("");
      setSelectedMacroList([]);
      setSelectedParamList([]);
      return;
    }
    // setSelectedLangId(String(selectedLangData?.defLangId));

    const existingData = adviceTypeLangList.find((item) => item.defLangId === selectedLangData?.defLangId);
    if (existingData?.msgDefine) {
      setTemplateDefinitionLang(existingData.msgDefine);
      const macros = extractTemplateItemType(existingData.msgDefine, "macro");
      const params = extractTemplateItemType(existingData.msgDefine, "param");
      setSelectedMacroList(macros);
      setSelectedParamList(params);
    } else {
      setTemplateDefinitionLang("");
      setSelectedMacroList([]);
      setSelectedParamList([]);
    }
  }, [showTemplateMulti, adviceTypeLangList]);

  const validateForm = () => {
    const newErrors = {
      language: "",
      templateDefinition: "",
    };

    let isValid = true;

    // Validasi Language
    if (!selectedLangId || selectedLangId.trim() === "") {
      newErrors.language = "Language is required";
      isValid = false;
    }

    // Validasi Template Definition
    if (!templateDefinitionLang || templateDefinitionLang.trim() === "") {
      newErrors.templateDefinition = "Template Definition is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleTest = () => {
    if (!validateForm()) return;
    setMessageTemplateLang(templateDefinitionLang);
    setShowTestTemplateDefinition(true);
    setTemplateDefinitionMode("addLang");
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLangId(value);
    const selected = lang.find((item) => item.defLangId === Number(value));
    if (selected) {
      setSelectedLangData({
        defLangId: Number(value),
        defLangName: selected.defLangName,
      });
    }

    if (errors.language) {
      setErrors((prev) => ({ ...prev, language: "" }));
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTemplate = e.target.value;
    setTemplateDefinitionLang(newTemplate);

    const macros = extractTemplateItemType(newTemplate, "macro");
    const params = extractTemplateItemType(newTemplate, "param");
    setSelectedMacroList(macros);
    setSelectedParamList(params);

    if (errors.templateDefinition) {
      setErrors((prev) => ({ ...prev, templateDefinition: "" }));
    }
  };

  const buildAutoTemplate = (macros: string[], params: string[]) => {
    const parts: string[] = [];

    macros.forEach((m) => {
      parts.push(`Macro.get('${m}')`);
    });

    params.forEach((p) => {
      parts.push(`Param.get('${p}')`);
    });

    if (parts.length === 0) return "";

    // return `strMsg = ${parts.join(" + ' ' + ")}`;
    return parts.join(",");
  };

  const toggleTemplateItem = (type: "macro" | "param", code: string) => {
    if (type === "macro") {
      setSelectedMacroList((prev) => {
        const newList = prev.includes(code) ? prev.filter((i) => i !== code) : [...prev, code];

        const autoTemplate = buildAutoTemplate(newList, selectedParamList);
        if (autoTemplate) setTemplateDefinitionLang(autoTemplate);

        return newList;
      });
    } else {
      setSelectedParamList((prev) => {
        const newList = prev.includes(code) ? prev.filter((i) => i !== code) : [...prev, code];

        const autoTemplate = buildAutoTemplate(selectedMacroList, newList);
        if (autoTemplate) setTemplateDefinitionLang(autoTemplate);

        return newList;
      });
    }
  };

  return (
    <Dialog open={showTemplateMulti} onOpenChange={setShowTemplateMulti}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Template Definition Multi</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-3">
          <div className="flex flex-row items-center justify-between px-3">
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2">
                <label className="text-sm w-40">
                  <span className="text-red-500">*</span>Language
                </label>
                <Select value={selectedLangId} onValueChange={handleLanguageChange}>
                  <SelectTrigger className={`h-8 w-96 ${errors.language ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {lang.map((item) => (
                      <SelectItem key={item.defLangId} value={String(item.defLangId)}>
                        {item.defLangName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.language && (
                <div className="flex items-center gap-2">
                  <div className="w-40"></div>
                  <p className="text-xs text-red-500">{errors.language}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm w-40">Message Template</label>
              <Input type="text" className="w-96 h-8 text-sm" value={selectedContent?.adviceTypeName || ""} disabled />
            </div>
          </div>

          <div className="flex flex-row gap-2 justify-between items-center px-3">
            <div className="flex items-center gap-2">
              <label className="text-sm w-40">Macro List</label>
              <Popover
                open={macroListOpen}
                onOpenChange={(open) => {
                  setMacroListOpen(open);
                  if (open && macroList.length === 0 && !macroListLoading) {
                    fetchMacroList();
                  }
                }}
              >
                <PopoverTrigger asChild className="h-8 w-96">
                  <Button variant={"outline"} className="flex justify-between">
                    {selectedMacroList.length === 0 && "Select Macro List"}
                    {selectedMacroList.length > 0 && `${selectedMacroList.length} items selected`}
                    <ChevronDown className="w-4 h-4 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" onWheel={(e) => e.stopPropagation()}>
                  <Command>
                    <CommandList className="max-h-[300px] overflow-y-auto">
                      <CommandEmpty>No macro list found.</CommandEmpty>
                      <CommandGroup>
                        {macroList.map((item) => {
                          const isSelected = selectedMacroList.includes(item.macroCode);

                          return (
                            <CommandItem key={item.macroCode} onSelect={() => toggleTemplateItem("macro", item.macroCode)} className="flex items-center justify-between cursor-pointer">
                              <span>{item.macroCode}</span>
                              {isSelected && <Check className="w-4 h-4 text-green-600" />}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm w-40">Parameter List</label>
              <Popover open={paramListOpen} onOpenChange={setParamListOpen}>
                <PopoverTrigger asChild className="h-8 w-96">
                  <Button variant="outline" className="flex justify-between">
                    {selectedParamList.length === 0 && "Select Param List"}
                    {selectedParamList.length > 0 && `${selectedParamList.length} items selected`}
                    <ChevronDown className="w-4 h-4 opacity-70" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" onWheel={(e) => e.stopPropagation()}>
                  <Command>
                    <CommandList className="max-h-[300px] overflow-y-auto">
                      <CommandEmpty>No param found.</CommandEmpty>

                      <CommandGroup>
                        {["ACC_NBR", "SUBS_ID"].map((param) => {
                          const isSelected = selectedParamList.includes(param);

                          return (
                            <CommandItem key={param} onSelect={() => toggleTemplateItem("param", param)} className="flex items-center justify-between cursor-pointer">
                              <span>{param}</span>
                              {isSelected && <Check className="w-4 h-4 text-green-600" />}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-row items-center justify-between px-3">
            <div className="flex items-center gap-1 flex-1">
              <label className="text-sm w-48">Sample</label>
              <Input type="text" className="h-8 text-sm" placeholder="Testing...Param test = ${test} Macro test = ${Macro.get('sydate')}" disabled />
            </div>
          </div>

          <div className="flex flex-col gap-1 px-3">
            <div className="flex flex-row gap-2">
              <label className="text-sm w-40">
                <span className="text-red-500">*</span>Template Definition
              </label>
              <Textarea className={`rounded-md text-sm flex-1 min-h-[300px] border ${errors.templateDefinition ? "border-red-500" : "border-gray-300"}`} placeholder="Input message template" value={templateDefinitionLang} onChange={handleTemplateChange} />
            </div>
            {errors.templateDefinition && (
              <div className="flex flex-row gap-2">
                <div className="w-40"></div>
                <p className="text-xs text-red-500">{errors.templateDefinition}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-3">
          <Button variant="default" className="text-sm" onClick={handleTest}>
            Test
          </Button>
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => {
              setShowTemplateMulti(false);
              setSelectedParamList([]);
              setSelectedMacroList([]);
            }}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDefinitionMulti;
