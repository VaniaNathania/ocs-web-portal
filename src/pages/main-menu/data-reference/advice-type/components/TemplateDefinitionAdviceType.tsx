import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdviceTypeContext } from "../hooks/useAdviceTypeContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import AdviceTypeAction from "../action/AdviceTypeAction";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";
import { validate } from "uuid";

export type TemplateItemType = "macro" | "param";

export const htmlToPlainText = (html: string) => {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.innerText || "";
};

const TemplateDefinition = () => {
  const { showTemplateDefinition, setShowTemplateDefinition, setFormData, setShowTestTemplateDefinition, titleParam, setTitleParam, emailContent, setEmailContent, setParamListValue, setDynamicParams, selectedMacroList, setSelectedMacroList, selectedParamList, setSelectedParamList, selectedMessageChannel, messageTemplate, setMessageTemplate, formData, setTemplateDefinitionMode, setCompileEmailMode } = useAdviceTypeContext();
  const { macroList, macroListLoading, fetchMacroList } = AdviceTypeAction();
  const [macroListOpen, setMacroListOpen] = useState(false);
  const [paramListOpen, setParamListOpen] = useState(false);
  const [templateDefinition, setTemplateDefinition] = useState("");
  const [error, setError] = useState<Record<string, string>>({});

  // fungsi untuk extract macro dari template
  const extractTemplateItemType = (template: string, type: TemplateItemType): string[] => {
    const regex = type === "macro" ? /Macro\.get\(['"]([^'"]+)['"]\)/g : /Param\.get\(['"]([^'"]+)['"]\)/g;
    const matches = [...template.matchAll(regex)];
    return matches.map((match) => match[1]);
  };

  const extractEmailTemplateItem = (template: string) => {
    const regex = /\$\{([^}]+)\}/g;
    const matches = [...template.matchAll(regex)];
    return matches.map((m) => m[1]);
  };

  useEffect(() => {
    const regex = /\$\{([^}]+)\}/g;
    const matches = [...emailContent.matchAll(regex)];

    const keys = matches.map((m) => m[1]);

    const uniqueKeys = Array.from(new Set(keys));

    setDynamicParams(uniqueKeys);

    setParamListValue((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (!uniqueKeys.includes(key)) {
          delete next[key];
        }
      });
      return next;
    });
  }, [emailContent]);

  useEffect(() => {
    if (selectedMessageChannel !== "EMAIL") return;

    const items = extractEmailTemplateItem(emailContent);

    const macros = items.filter((i) => macroList.some((m) => m.macroCode === i));

    const params = items.filter((i) => ["ACC_NBR", "SUBS_ID"].includes(i));

    setSelectedMacroList(macros);
    setSelectedParamList(params);
  }, [emailContent]);

  useEffect(() => {
    if (showTemplateDefinition) {
      if (formData.msgDefine) {
        setTemplateDefinition(formData.msgDefine);
        const macros = extractTemplateItemType(formData.msgDefine, "macro");
        const param = extractTemplateItemType(formData.msgDefine, "param");
        setSelectedMacroList(macros);
        setSelectedParamList(param);
      } else {
        setTemplateDefinition("");
        setSelectedMacroList([]);
        setSelectedParamList([]);
      }
    }
  }, [showTemplateDefinition, formData.msgDefine]);

  useEffect(() => {
    if (showTemplateDefinition) {
      if (selectedMessageChannel === "EMAIL") {
        setEmailContent(formData.msgDefine || "");
      } else {
        setTemplateDefinition(formData.msgDefine || "");
      }
    }
  }, [showTemplateDefinition, selectedMessageChannel]);

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

  const buildAutoTemplateEmail = (macros: string[], params: string[]) => {
    const parts: string[] = [];

    macros.forEach((m) => {
      parts.push(`\${${m}}`);
    });

    params.forEach((p) => {
      parts.push(`\${${p}}`);
    });

    if (parts.length === 0) return "";

    // return `strMsg = ${parts.join(" + ' ' + ")}`;
    return parts.join(",");
  };

  const toggleTemplateItem = (type: "macro" | "param", code: string) => {
    if (type === "macro") {
      setSelectedMacroList((prevMacro) => {
        const newMacroList = prevMacro.includes(code) ? prevMacro.filter((i) => i !== code) : [...prevMacro, code];

        const autoTemplate = selectedMessageChannel === "EMAIL" ? buildAutoTemplateEmail(newMacroList, selectedParamList) : buildAutoTemplate(newMacroList, selectedParamList);

        setTemplateDefinition(autoTemplate);
        setEmailContent(autoTemplate);

        return newMacroList;
      });
    } else {
      setSelectedParamList((prevParam) => {
        const newParamList = prevParam.includes(code) ? prevParam.filter((i) => i !== code) : [...prevParam, code];

        const autoTemplate = selectedMessageChannel === "EMAIL" ? buildAutoTemplateEmail(selectedMacroList, newParamList) : buildAutoTemplate(selectedMacroList, newParamList);

        setTemplateDefinition(autoTemplate);
        setEmailContent(autoTemplate);

        return newParamList;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (selectedMessageChannel === "EMAIL") {
      if (!titleParam.trim()) {
        newErrors.titleParam = "Title cannot be empty";
        toast.error("Title cannot be empty");
      }

      if (!emailContent.trim()) {
        newErrors.emailContent = "Email content cannot be empty";
        toast.error("Email content cannot be empty");
      }
    } else {
      if (!templateDefinition.trim()) {
        newErrors.templateDefinition = "Template Definition cannot be empty";
        toast.error("Template Definition cannot be empty");
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return false;
    }

    setError({});
    return true;
  };

  return (
    <Dialog open={showTemplateDefinition} onOpenChange={setShowTemplateDefinition}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Template Definition</DialogTitle>
        </DialogHeader>

        {selectedMessageChannel === "EMAIL" ? (
          <>
            <div className="flex flex-col gap-3 py-3">
              <div className="flex flex-row items-center justify-between px-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm w-32">Title</label>
                  <Input type="text" className={`w-96 h-8 text-sm ${error.titleParam ? "border-red-500" : ""}`} placeholder="Input title" value={titleParam} onChange={(e) => setTitleParam(e.target.value)} />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm w-40">Sample</label>
                  <Input type="text" className="w-96 h-8 text-sm" placeholder="Testing... Parameter test = ${test} Macro test = ${Macro.get('sysdate')}" readOnly />
                </div>
              </div>

              <div className="flex flex-row items-center justify-between px-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm w-32">Macro List</label>
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
                                <CommandItem
                                  key={item.macroCode}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    toggleTemplateItem("macro", item.macroCode);
                                  }}
                                  className="flex items-center justify-between cursor-pointer"
                                >
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
                  <label className="text-sm w-40">Param List</label>

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
                                <CommandItem
                                  key={param}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    toggleTemplateItem("param", param);
                                  }}
                                  className="flex items-center justify-between cursor-pointer"
                                >
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

              <div className="flex flex-row items-center px-3 gap-3">
                <label className="text-sm w-32">Template Definition</label>
                <Input type="text" className={`flex-1 h-8 text-sm`} />
              </div>

              <div className="w-full px-3 pb-12">
                <ReactQuill theme="snow" className={`bg-white rounded-md border border-gray-300 h-[200px] ${error.emailContent ? "border-red-500" : ""}`} value={emailContent} onChange={(val) => setEmailContent(val)} />
              </div>

              <div className="flex flex-row gap-2 px-3 items-center">
                <label className="text-sm">Attachment</label>
                <Input type="file" className="w-full max-w-md" />
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="default"
                className="text-sm px-2"
                onClick={() => {
                  const isValid = validateForm();
                  if (!isValid) return;
                  const plainText = htmlToPlainText(emailContent);
                  setTemplateDefinitionMode("addDialog");
                  setCompileEmailMode("text");
                  setMessageTemplate(plainText);
                  setShowTestTemplateDefinition(true);
                }}
              >
                Test as Text
              </Button>
              <Button
                variant="outline"
                className="text-sm px-2"
                onClick={() => {
                  const isValid = validateForm();
                  if (!isValid) return;
                  setMessageTemplate(emailContent);
                  setTemplateDefinitionMode("addDialog");
                  setCompileEmailMode("html");
                  setShowTestTemplateDefinition(true);
                }}
              >
                Test as HTML
              </Button>
              <Button
                variant="outline"
                className="text-sm px-2"
                onClick={() => {
                  const plainText = htmlToPlainText(emailContent);
                  setFormData({
                    ...formData,
                    msgDefine: plainText,
                  });
                  setShowTemplateDefinition(false);
                }}
              >
                Save as Text
              </Button>

              <Button
                variant="outline"
                className="text-sm px-2"
                onClick={() => {
                  setFormData({
                    ...formData,
                    msgDefine: emailContent,
                  });
                  setShowTemplateDefinition(false);
                }}
              >
                Save as HTML
              </Button>
              <Button
                variant="outline"
                className="text-sm px-2"
                onClick={() => {
                  setShowTemplateDefinition(false);
                  setTitleParam("");
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-3 py-3">
              <div className="flex flex-row items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm w-40">Message Template</label>
                  <Input type="text" className="w-96 h-8 text-sm" value={String(formData.adviceTypeName)} disabled />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm w-40">Sample</label>
                  <Input type="text" className="w-96 h-8 text-sm" placeholder="Testing...Param test = ${test} Macro test = ${Macro.get('sydate')}" disabled />
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
                  <label className="text-sm w-40">Param List</label>

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

              <div className="flex flex-row gap-2 px-3">
                <label className="text-sm w-40">
                  <span className="text-red-500">*</span>Message Template
                </label>
                <Textarea
                  value={templateDefinition}
                  onChange={(e) => {
                    const newTemplate = e.target.value;
                    setTemplateDefinition(newTemplate);
                    const macros = extractTemplateItemType(newTemplate, "macro");
                    const param = extractTemplateItemType(newTemplate, "param");
                    setSelectedMacroList(macros);
                    setSelectedParamList(param);
                  }}
                  className={`rounded-md text-sm flex-1 min-h-[300px] border ${error.templateDefinition ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Input message template"
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-3">
              <Button
                variant="default"
                className="text-sm"
                onClick={() => {
                  const isValid = validateForm();
                  if (!isValid) return;
                  setMessageTemplate(templateDefinition);
                  setShowTestTemplateDefinition(true);
                  setTemplateDefinitionMode("addDialog");
                }}
              >
                Test
              </Button>
              <Button
                variant="outline"
                className="text-sm"
                onClick={() => {
                  setShowTemplateDefinition(false);
                  setSelectedMacroList([]);
                  setSelectedParamList([]);
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDefinition;
