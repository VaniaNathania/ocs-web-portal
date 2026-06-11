import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogWrapper } from "../../role-management/generalUseComp";
import { Dispatch, SetStateAction } from "react";
import { DatasProps } from "../interface/interface";
import { accNbrDetail } from "../mockDatas/mockDatas";

interface ServiceNbrDetailProps {
  isOpenServiceNbrDetail: boolean;
  setIsOpenServiceNbrDetail: Dispatch<SetStateAction<boolean>>;
  selectedRow: DatasProps | undefined;
}

const ServiceNbrDetail = ({ isOpenServiceNbrDetail, setIsOpenServiceNbrDetail, selectedRow }: ServiceNbrDetailProps) => {
  const data = accNbrDetail.find((item) => item.accNbrId === selectedRow?.simCardId) ?? null;

  return (
    <DialogWrapper size={{ width: "5xl" }} isOpen={isOpenServiceNbrDetail} handleDialog={setIsOpenServiceNbrDetail} title="Service Number Detail">
      <div className="grid grid-cols-2 p-6 space-y-2 gap-x-6">
        <div className="grid grid-cols-3 items-center">
          <Label>Service Number</Label>
          <Input className="h-9 col-span-2" value={data?.accNbr} disabled />
        </div>

        <div className="grid grid-cols-3 items-center">
          <Label>State</Label>
          <Input className="h-9 col-span-2" value={data?.accNbrStateName} disabled />
        </div>

        <div className="grid grid-cols-3 items-center">
          <Label>Number Type</Label>
          <Input className="h-9 col-span-2" value={data?.accNbrTypeName} disabled />
        </div>

        <div className="grid grid-cols-3 items-center">
          <Label>Number Grade</Label>
          <Input className="h-9 col-span-2" disabled />
        </div>

        <div className="grid grid-cols-3 items-center">
          <Label>Company</Label>
          <Input className="h-9 col-span-2" value={data?.orgName} disabled />
        </div>

        <div className="grid grid-cols-3 items-center">
          <Label>Telecom Region</Label>
          <Input className="h-9 col-span-2" disabled />
        </div>

        <div className="grid grid-cols-3 items-center">
          <Label>Primary NE</Label>
          <Input className="h-9 col-span-2" disabled />
        </div>

        <div className="grid grid-cols-3 items-center">
          <Label>Remarks</Label>
          <Input className="h-9 col-span-2" disabled />
        </div>
      </div>
    </DialogWrapper>
  );
};

export default ServiceNbrDetail;
