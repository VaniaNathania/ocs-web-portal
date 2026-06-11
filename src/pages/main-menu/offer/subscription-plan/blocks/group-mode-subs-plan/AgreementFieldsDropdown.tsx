import React, { useState } from "react";
import { KeenIcon } from "@/components";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

interface AgreementFieldsDropdownProps {
  offer: any;
  setSelectedOffers: React.Dispatch<React.SetStateAction<any[]>>;
}

const AgreementFieldsDropdown: React.FC<AgreementFieldsDropdownProps> = ({
  offer,
  setSelectedOffers,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900">
          Agreement
          <KeenIcon icon="down" className="ml-1" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] p-4 space-y-4">
        {/* Agreement Period */}
        <div>
          <label className="block text-sm mb-1">Agreement Period</label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder=""
              value={offer.agreementPeriod || ""}
              onChange={(e) =>
                setSelectedOffers((prev) =>
                  prev.map((o) =>
                    o.id === offer.id
                      ? { ...o, agreementPeriod: parseInt(e.target.value) }
                      : o
                  )
                )
              }
              className="border rounded p-1 w-full"
            />
            <select
              className="border rounded p-1 w-full"
              value={offer.timeUnit || ""}
              onChange={(e) =>
                setSelectedOffers((prev) =>
                  prev.map((o) =>
                    o.id === offer.id ? { ...o, timeUnit: e.target.value } : o
                  )
                )
              }
            >
              <option value=""></option>
              <option value="D">Day</option>
              <option value="M">Month</option>
              <option value="W">Week</option>
              <option value="Y">Year</option>
            </select>
          </div>
        </div>

        {/* Effective Type */}
        <div>
          <label className="block text-sm mb-1">Effective Type</label>
          <select
            className="border rounded p-1 w-full"
            value={offer.agreementEffType || ""}
            onChange={(e) =>
              setSelectedOffers((prev) =>
                prev.map((o) =>
                  o.id === offer.id
                    ? { ...o, agreementEffType: e.target.value }
                    : o
                )
              )
            }
          >
            <option value=""></option>
            <option value="1">Next Day</option>
            <option value="2">Next Month</option>
            <option value="3">Next Billing Cycle</option>
            <option value="4">Today 0:00</option>
          </select>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AgreementFieldsDropdown;
