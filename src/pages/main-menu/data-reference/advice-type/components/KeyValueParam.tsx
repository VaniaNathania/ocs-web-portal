import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdviceTypeContext } from "../hooks/useAdviceTypeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { DefaultTooltip } from "@/components";
import { macroExtraParamMap } from "./TemplateDefinitionTest";
import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";

const keyValueParam = () => {
  const { showKeyValueParam, setShowKeyValueParam, selectedParamList, selectedMacroList, dynamicParams, paramListValue, setParamListValue, macroListValue, setMacroListValue } = useAdviceTypeContext();

  return (
    <DialogWrapper isOpen={showKeyValueParam} handleDialog={setShowKeyValueParam} title="Key Value Param" size={{ width: "", height: "" }}>
      <div className="flex flex-col gap-3 p-4 max-h-[300px] overflow-y-auto">
        {selectedParamList.length > 0 &&
          selectedParamList.map((param) => (
            <div key={param} className="flex flex-row items-center gap-2">
              <DefaultTooltip title={param}>
                <label className="text-sm w-24 shrink-0 truncate">{param}</label>
              </DefaultTooltip>
              <Input
                type="text"
                className="flex-1 h-8"
                value={paramListValue[param] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setParamListValue((prev) => ({
                    ...prev,
                    [param]: val,
                  }));
                }}
              />
            </div>
          ))}

        {selectedMacroList.map((macro) => {
          const extraParams = macroExtraParamMap[macro] || [];

          return extraParams.map((p) => (
            <div key={p} className="flex flex-row items-center gap-2">
              <DefaultTooltip title={macro}>
                <label className="text-sm w-24 shrink-0 truncate">{macro}</label>
              </DefaultTooltip>

              <Input
                type="text"
                className="flex-1 h-8"
                value={paramListValue[p] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setParamListValue((prev) => ({
                    ...prev,
                    [p]: val,
                  }));
                }}
              />
            </div>
          ));
        })}

        {dynamicParams
          .filter((param) => !selectedParamList.includes(param) && !selectedMacroList.includes(param))
          .map((param) => (
            <div key={param} className="flex flex-row items-center gap-2">
              <DefaultTooltip title={param}>
                <label className="text-sm w-24 shrink-0 truncate">{param}</label>
              </DefaultTooltip>

              <Input
                type="text"
                className="flex-1 h-8"
                value={paramListValue[param] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setParamListValue((prev) => ({
                    ...prev,
                    [param]: val,
                  }));
                }}
              />
            </div>
          ))}
      </div>

      <DialogFooter className="flex justify-end gap-2">
        <Button className="text-sm" size={"sm"} onClick={() => setShowKeyValueParam(false)}>
          Add
        </Button>
      </DialogFooter>
    </DialogWrapper>
  );
};

export default keyValueParam;
