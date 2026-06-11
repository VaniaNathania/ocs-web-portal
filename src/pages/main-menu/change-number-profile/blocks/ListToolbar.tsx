import { useState } from "react";
import { FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChangeNumberProfileContext } from "../hooks/useChangeNumberProfileContext";
import Organization, { OrgData } from "../../upload-simcard/blocks/Organization";
import { toast } from "sonner";

const ListToolbar = () => {
  const { numberStateList, numberTypeList, primaryNe, areaDetail, setQuery, setQueryTrigger, query, setIsReset, accNbrClassList, setSelectedItem } = useChangeNumberProfileContext();
  const [selectedPrefix, setSelectedPrefix] = useState<string>("670");
  const [selectedNumberType, setSelectedNumberType] = useState<number | undefined>(undefined);
  const [selectedNumberGrade, setSelectedNumberGrade] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedOrgId, setSelectedOrgId] = useState<number | undefined>(undefined);
  const [selectedAreaId, setSelectedAreaId] = useState<number | undefined>(undefined);
  const [selectedPrimaryNE, setSelectedPrimaryNE] = useState<number | undefined>(undefined);
  const [selectedIsBinding, setSelectedIsBinding] = useState<string | undefined>(undefined);
  const [serviceNumberFrom, setServiceNumberFrom] = useState<string | null>(null);
  const [serviceNumberTo, setServiceNumberTo] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleReset = () => {
    setSelectedItem(null);
    setSelectedPrefix("");
    setSelectedNumberType(undefined);
    setSelectedNumberGrade("");
    setSelectedState("");
    setSelectedCompany("");
    setSelectedOrgId(undefined);
    setSelectedAreaId(undefined);
    setSelectedPrimaryNE(undefined);
    setSelectedIsBinding("");
    setServiceNumberFrom("");
    setServiceNumberTo("");
    setQuery({
      prefix: undefined,
      spId: undefined,
      accNbrState: undefined,
      accNbrTypeId: undefined,
      accNbrClassId: undefined,
      orgId: undefined,
      hlrId: undefined,
      areaId: undefined,
      accNbrBegin: null,
      accNbrEnd: null,
      isBindingFlag: undefined,
    });

    setIsReset(true);
    setQueryTrigger((prev) => prev + 1);
  };

  const hasAditionalQuery = () => {
    return [selectedAreaId, selectedCompany, selectedIsBinding, selectedNumberGrade, selectedNumberType, selectedOrgId, selectedPrimaryNE, selectedState, serviceNumberFrom, serviceNumberTo].some(
      (val) => val !== null && val !== undefined && val !== "",
    );
  };

  const buildQuery = () => {
    const rawQuery = {
      prefix: selectedPrefix,
      accNbrState: selectedState,
      accNbrTypeId: selectedNumberType,
      hlrId: selectedPrimaryNE,
      orgId: selectedOrgId,
      areaId: selectedAreaId,
      accNbrBegin: serviceNumberFrom,
      accNbrEnd: serviceNumberTo,
      ...(selectedIsBinding === "Y" && { isBindingFlag: "Y" }),
      ...(selectedIsBinding === "N" && { isBindingFlagN: "N" }),
      spId: 0,
    };

    return Object.fromEntries(Object.entries(rawQuery).filter(([, v]) => v !== undefined && v !== null && v !== ""));
  };

  const handleQuery = () => {
    if (!selectedPrefix) {
      toast.info("Please Select PreFix!");
      return;
    }

    if (!hasAditionalQuery()) {
      toast.info("Please enter at least one query condition except PreFix!");
      return;
    }

    const finalQuery = buildQuery();

    setIsReset(false);
    setQuery(finalQuery);
    setQueryTrigger((prev) => prev + 1);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOrganization = (org: OrgData) => {
    setSelectedCompany(org.orgName);
    setSelectedOrgId(org.orgId);
  };

  return (
    <div className="flex-none w-full px-4 py-4">
      <div className="border rounded-lg shadow-sm w-full bg-white">
        <div className="p-6">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            {/* Prefix */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap w-24">Prefix</label>
              <Select
                onValueChange={(val) => {
                  setSelectedPrefix(val);
                }}
                value={selectedPrefix || ""}
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="---Please Select---" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="670">670</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Service Number */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap w-28">Service Number</label>
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="text"
                  className="h-9"
                  placeholder="from"
                  value={serviceNumberFrom ?? ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d.]/g, "");
                    setServiceNumberFrom(value);
                  }}
                  onBlur={(e) => {
                    const value = e.target.value.replace(/[^\d.]/g, "");
                    setServiceNumberFrom(value);
                    setServiceNumberTo(value);
                  }}
                />
                <span className="text-sm text-gray-500">-</span>
                <Input type="text" className="h-9" placeholder="to" value={serviceNumberTo ?? ""} onChange={(e) => setServiceNumberTo(e.target.value)} />
              </div>
            </div>

            {/* Number Type */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap w-28">Number Type</label>
              <Select
                onValueChange={(val) => {
                  setSelectedNumberType(Number(val));
                }}
                value={selectedNumberType ? String(selectedNumberType) : undefined}
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="---Please Select---" />
                </SelectTrigger>
                <SelectContent>
                  {numberTypeList.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.accNbrTypeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Number Grade */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap w-24">Number Grade</label>
              <Select
                onValueChange={(val) => {
                  setSelectedNumberGrade(val);
                }}
                value={selectedNumberGrade || ""}
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="---Please Select---" />
                </SelectTrigger>
                <SelectContent>
                  {accNbrClassList.length > 0 &&
                    accNbrClassList.map((item) => (
                      <SelectItem key={item.accNbrClassId} value={item.accNbrClassId}>
                        {item.accNbrClassName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* State */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap w-28">State</label>
              <Select
                onValueChange={(val) => {
                  setSelectedState(val);
                }}
                value={selectedState || ""}
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="---Please Select---" />
                </SelectTrigger>
                <SelectContent>
                  {numberStateList.map((state) => (
                    <SelectItem key={state.accNbrState} value={state.accNbrState}>
                      {state.accNbrStateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap w-28">Company</label>
              <div className="relative flex-1">
                <Input type="text" className="h-9 pr-10 border-gray-300" value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} readOnly placeholder="Select Company" />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" title="Select Company" type="button" onClick={handleOpenModal}>
                  <FileEdit className="h-[18px] w-[18px] stroke-[1.5]" />
                </button>
              </div>
            </div>

            {/* Telkom Region */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap w-24">Telkom Region</label>
              <Select
                onValueChange={(val) => {
                  setSelectedAreaId(Number(val));
                }}
                value={selectedAreaId ? String(selectedAreaId) : undefined}
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="---Please Select---" />
                </SelectTrigger>
                <SelectContent>
                  {areaDetail.map((area) => (
                    <SelectItem key={area.areaId} value={String(area.areaId)}>
                      {area.areaName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Primary NE */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap w-28">Primary NE</label>
              <Select
                onValueChange={(val) => {
                  setSelectedPrimaryNE(Number(val));
                }}
                value={selectedPrimaryNE ? String(selectedPrimaryNE) : undefined}
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="---Please Select---" />
                </SelectTrigger>
                <SelectContent>
                  {primaryNe.map((hlr) => (
                    <SelectItem key={hlr.hlrId} value={String(hlr.hlrId)}>
                      {hlr.hlrName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Is Binding */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap w-28">Is Binding</label>
              <Select onValueChange={(val) => setSelectedIsBinding(val)} value={selectedIsBinding || ""}>
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="---Please Select---" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Y">Yes</SelectItem>
                  <SelectItem value="N">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-6">
            <Button className="h-9 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleQuery} disabled={isQuerying}>
              Query
            </Button>
            <Button variant="outline" className="h-9 px-6" onClick={handleReset} disabled={isQuerying}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Organization Modal */}
      <Organization isOpen={isModalOpen} onClose={handleCloseModal} organizationData={handleOrganization} />
    </div>
  );
};

export default ListToolbar;
