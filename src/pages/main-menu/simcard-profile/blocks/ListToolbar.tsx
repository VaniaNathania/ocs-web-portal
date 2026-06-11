import { useState } from "react";
import { FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Organization, { OrgData } from "../../upload-simcard/blocks/Organization";
import { toast } from "sonner";
import { useSimcardProfileContext } from "../hooks/SimcardProfileContext";
import { SimStateDatas } from "../mockDatas/mockDatas";

const ListToolbar = () => {
  const { primaryNe, areaDetail, simType, setSelectedRow } = useSimcardProfileContext();
  const [imsiFrom, setImsiFrom] = useState<string | null>(null);
  const [imsiTo, setImsiTo] = useState<string | null>(null);
  const [esnFrom, setEsnFrom] = useState<string | null>(null);
  const [esnTo, setEsnTo] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedSimType, setSelectedSimType] = useState<number | undefined>(undefined);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedOrgId, setSelectedOrgId] = useState<number | undefined>(undefined);
  const [selectedAreaId, setSelectedAreaId] = useState<number | undefined>(undefined);
  const [selectedPrimaryNE, setSelectedPrimaryNE] = useState<number | undefined>(undefined);
  const [selectedIsBinding, setSelectedIsBinding] = useState<string | undefined>(undefined);
  const [iccidFrom, setIccidFrom] = useState<string | null>(null);
  const [iccidTo, setIccidTo] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleReset = () => {
    setSelectedRow(undefined);
    setImsiFrom(null);
    setImsiTo(null);
    setEsnFrom(null);
    setEsnTo(null);
    setSelectedState("");
    setSelectedSimType(undefined);
    setSelectedCompany("");
    setSelectedOrgId(undefined);
    setSelectedAreaId(undefined);
    setSelectedPrimaryNE(undefined);
    setSelectedIsBinding("");
    setIccidFrom(null);
    setIccidTo(null);
    // setQuery({
    //   prefix: undefined,
    //   spId: undefined,
    //   accNbrState: undefined,
    //   accNbrTypeId: undefined,
    //   accNbrClassId: undefined,
    //   orgId: undefined,
    //   hlrId: undefined,
    //   areaId: undefined,
    //   accNbrBegin: null,
    //   accNbrEnd: null,
    //   isBindingFlag: undefined,
    // });

    // setIsReset(true);
    // setQueryTrigger((prev) => prev + 1);
  };

  const hasAditionalQuery = () => {
    return [selectedAreaId, selectedCompany, selectedSimType, selectedIsBinding, esnFrom, esnTo, imsiFrom, imsiTo, selectedOrgId, selectedPrimaryNE, selectedState, iccidFrom, iccidTo].some(
      (val) => val !== null && val !== undefined && val !== "",
    );
  };

  const buildQuery = () => {
    const rawQuery = {
      esnBegin: esnFrom,
      esnEnd: esnTo,
      imsiBegin: imsiFrom,
      imsiEnd: imsiTo,
      accNbrTypeId: selectedSimType,
      accNbrState: selectedState,
      hlrId: selectedPrimaryNE,
      orgId: selectedOrgId,
      areaId: selectedAreaId,
      iccidBegin: iccidFrom,
      iccidEnd: iccidTo,
      ...(selectedIsBinding === "Y" && { isBindingFlag: "Y" }),
      ...(selectedIsBinding === "N" && { isBindingFlagN: "N" }),
      spId: 0,
    };

    return Object.fromEntries(Object.entries(rawQuery).filter(([, v]) => v !== undefined && v !== null && v !== ""));
  };

  const handleQuery = () => {
    if (!hasAditionalQuery()) {
      toast.info("Please enter at least one query condition!");
      return;
    }

    const finalQuery = buildQuery();

    // setIsReset(false);
    // setQuery(finalQuery);
    // setQueryTrigger((prev) => prev + 1);
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
            {/* ICCID */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap w-28">ICCID</label>
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="text"
                  className="h-9"
                  placeholder="from"
                  value={iccidFrom ?? ""}
                  onChange={(e) => {
                    // const value = e.target.value.replace(/[^\d.]/g, "");
                    const value = e.target.value;
                    setIccidFrom(value);
                  }}
                  onBlur={(e) => {
                    // const value = e.target.value.replace(/[^\d.]/g, "");
                    const value = e.target.value;
                    setIccidFrom(value);
                    setIccidTo(value);
                  }}
                />
                <span className="text-sm text-gray-500">-</span>
                <Input type="text" className="h-9" placeholder="to" value={iccidTo ?? ""} onChange={(e) => setIccidTo(e.target.value)} />
              </div>
            </div>

            {/* SIMCARD TYPE */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap w-28">Sim Card Type</label>
              <Select
                onValueChange={(val) => {
                  setSelectedSimType(Number(val));
                }}
                value={selectedSimType ? String(selectedSimType) : ""}
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="---Please Select---" />
                </SelectTrigger>
                <SelectContent>
                  {simType.map((item) => (
                    <SelectItem key={item.simTypeId} value={String(item.simTypeId)}>
                      {item.simTypeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* TELECOM REGION */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap w-28">Telecom Region</label>
              <Select
                onValueChange={(val) => {
                  setSelectedAreaId(Number(val));
                }}
                value={selectedAreaId ? String(selectedAreaId) : ""}
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="---Please Select---" />
                </SelectTrigger>
                <SelectContent>
                  {areaDetail.map((item) => (
                    <SelectItem key={item.areaId} value={String(item.areaId)}>
                      {item.areaName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* IMSI */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap w-28">IMSI</label>
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="text"
                  className="h-9"
                  placeholder="from"
                  value={imsiFrom ?? ""}
                  onChange={(e) => {
                    // const value = e.target.value.replace(/[^\d.]/g, "");
                    const value = e.target.value;
                    setImsiFrom(value);
                  }}
                  onBlur={(e) => {
                    // const value = e.target.value.replace(/[^\d.]/g, "");
                    const value = e.target.value;
                    setImsiFrom(value);
                    setImsiTo(value);
                  }}
                />
                <span className="text-sm text-gray-500">-</span>
                <Input type="text" className="h-9" placeholder="to" value={imsiTo ?? ""} onChange={(e) => setImsiTo(e.target.value)} />
              </div>
            </div>

            {/* SIMCARD STATE */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap w-28">Sim Card State</label>
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
                  {SimStateDatas.map((item) => (
                    <SelectItem key={item.simState} value={item.simState}>
                      {item.simStateName}
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
                value={selectedPrimaryNE ? String(selectedPrimaryNE) : ""}
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

            {/* ESN */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap w-28">ESN</label>
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="text"
                  className="h-9"
                  placeholder="from"
                  value={esnFrom ?? ""}
                  onChange={(e) => {
                    // const value = e.target.value.replace(/[^\d.]/g, "");
                    const value = e.target.value;
                    setEsnFrom(value);
                  }}
                  onBlur={(e) => {
                    // const value = e.target.value.replace(/[^\d.]/g, "");
                    const value = e.target.value;
                    setEsnFrom(value);
                    setEsnTo(value);
                  }}
                />
                <span className="text-sm text-gray-500">-</span>
                <Input type="text" className="h-9" placeholder="to" value={esnTo ?? ""} onChange={(e) => setEsnTo(e.target.value)} />
              </div>
            </div>

            {/* Organization */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap w-28">Organization</label>
              <div className="relative flex-1" onClick={handleOpenModal}>
                <Input type="text" className="h-9 pr-10 border-gray-300" value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} readOnly placeholder="Select Organization" />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" title="Select Organization" type="button">
                  <FileEdit className="h-[18px] w-[18px] stroke-[1.5]" />
                </button>
              </div>
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
