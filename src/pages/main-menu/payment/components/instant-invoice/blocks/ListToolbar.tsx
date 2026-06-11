import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayment } from "../../../hooks/PaymentContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

const ListToolbar = () => {
  const { selectedRow, webRechargeUseQuery } = usePayment();
  const [selectedServiceNumber, setSelectedServiceNumber] = useState<string>();
  const [querry, setQuerry] = useState<boolean>(false);
  const [includeAllInstallments, setIncludeAllInstallments] = useState<boolean>(false);

  const handleCheckbox = () => {
    setIncludeAllInstallments(!includeAllInstallments);
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-4 justify-center">
        <div className="flex flex-row gap-2 items-center">
          <Label>Account Number</Label>
          <Input value={selectedRow?.acctNbr} size={"sm"} readOnly />
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Label>Billing Cycle</Label>
          <Input value={selectedRow?.createdDate} size={"sm"} readOnly />
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Label>Service Number</Label>
          <Select
            value={selectedServiceNumber}
            onValueChange={(e) => {
              setSelectedServiceNumber(e);
            }}
          >
            <SelectTrigger className="flex-1" size={"sm"} disabled>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {webRechargeUseQuery?.data?.subsList.map((item, index) => (
                <SelectItem value={index.toString()} key={item.subsId}>
                  {item.accNbr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select></Select>
        </div>
        <div className="flex justify-end">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleCheckbox}>
            <Input type="checkbox" checked={includeAllInstallments} className="w-4 cursor-pointer" size="sm" />
            <Label className="w-full cursor-pointer">Include all installments</Label>
          </div>
        </div>
        <div className="flex flex-row gap-2 items-center justify-end">
          <Button className="hover:bg-blue-400" size={"sm"} disabled={querry === false}>
            Instant Invoice
          </Button>
          <Button variant="outline" size={"sm"} onClick={() => setQuerry(true)}>
            Query
          </Button>
        </div>
        <div className="flex flex-row gap-2 items-center justify-end">
          <Button className="hover:bg-blue-400" size={"sm"} disabled>
            Make Bill Data
          </Button>
          <Button variant="outline" size={"sm"}>
            Print Bill
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListToolbar;
