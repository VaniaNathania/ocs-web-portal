import { ChevronDown, MoveLeft } from "lucide-react";
import { useSubscriberListContext } from "../../../hooks";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { useBrandShifting } from "../hooks/brandShiftingContext";
import { useState } from "react";
import OfferServiceDialog from "../components/OfferService";

const BrandShiftingForm = ({ children }: { children?: React.ReactNode }) => {
  const { selectedSubs, selectedOperation, setSelectedOperation } =
    useSubscriberListContext();
  const { selectedUser } = useOrder();
  const { openOfferService, showOfferService } = useBrandShifting();

  return (
    <>
      {showOfferService && <OfferServiceDialog />}
      <div className="w-full bg-white">
        {/* Header */}
        <div className="border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedOperation(undefined)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoveLeft className="w-5 h-5 text-gray-600" size={16} />
            </button>
            <span className="text-gray-600">
              {selectedOperation?.displayName ?? selectedOperation?.eventName}
            </span>
            <span className="text-gray-400">/</span>
            <span className="font-medium">{selectedSubs?.subsPlanName}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white text-sm">
              {selectedUser?.custName?.charAt(0)}
            </div>
            <span className="text-sm text-gray-700">
              {selectedUser?.custName}
            </span>
          </div>
        </div>

        <div className="px-6 py-4">
          <a
            href="#"
            className="text-blue-600 hover:underline text-sm mb-4 inline-block"
          >
            {selectedSubs?.subsPlanName}
          </a>

          {/* Change Subscription Plan Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 border-l-4 border-blue-600 pl-3">
              Change Subscription Plan
            </h2>

            <div className="grid grid-cols-3 gap-6 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Service Number
                </label>
                <div className="text-sm text-gray-900">
                  {selectedSubs?.acctNbr}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Offer Name
                </label>
                <div className="text-sm text-gray-900">
                  {selectedSubs?.offerName}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Old Subscription Plan
                </label>
                <div className="text-sm text-gray-900">
                  {selectedSubs?.subsPlanName}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* <div>
              <label className="block text-sm text-gray-700 mb-1">
                *New Subscription Plan
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Select plan"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                  📝
                </button>
              </div>
            </div> */}
              <BuildFormRow label="New Subscription Plan" isRequired>
                <Input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Select plan"
                />
              </BuildFormRow>
              <div>
                <label className="block text-sm text-gray-600 mb-1">ERF</label>
                <Input
                  type="text"
                  value="0.00000"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                />
              </div>
              <BuildFormRow label="User Type" isRequired>
                <Select value={"prepaid"}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Price Plan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prepaid">Prepaid</SelectItem>
                  </SelectContent>
                </Select>
              </BuildFormRow>
            </div>
          </div>

          {/* Select Service Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold border-l-4 border-blue-600 pl-3">
                Select Service
              </h2>
              <button
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                onClick={() => openOfferService(true)}
              >
                <span className="text-lg">+</span> Add
              </button>
            </div>

            {children}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button className="px-6 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
              Previous
            </button>
            <button className="px-6 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
              Cancel
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrandShiftingForm;
