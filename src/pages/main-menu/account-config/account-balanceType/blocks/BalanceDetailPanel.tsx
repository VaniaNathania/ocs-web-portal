import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

const BalanceDetailPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 transition-transform duration-300 ease-in-out">
      {/* Header Bar */}
      <div
        className="flex items-center justify-between px-6 py-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        onClick={togglePanel}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
          </div>
          <span className="font-semibold text-gray-800">Detail</span>
        </div>
        <button className="p-1 hover:bg-gray-200 rounded transition-colors">
          {isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

      {/* Sliding Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="p-6 bg-white overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Column 1 */}
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Balance Type Name
                </label>
                <input
                  type="text"
                  placeholder="Main Balance"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Standard Code
                </label>
                <input
                  type="text"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Maximum Balance
                </label>
                <input
                  type="text"
                  placeholder="1,000,000.00000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Payment Force
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentForce"
                      value="yes"
                      className="mr-2"
                      defaultChecked
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentForce"
                      value="no"
                      className="mr-2"
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Transfer Rate
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Max Top Up Amount
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Balance Catalog
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Basic Balance</option>
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Debit Account Item Type
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Parent Balance Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>--- Please Select ---</option>
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Deduction value
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Priority
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Ratio Money
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Rechargeable
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Keep unique</option>
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Is Currency
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isCurrency"
                      value="yes"
                      className="mr-2"
                      defaultChecked
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isCurrency"
                      value="no"
                      className="mr-2"
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Is Free Unit
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isFreeUnit"
                      value="yes"
                      className="mr-2"
                      defaultChecked
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isFreeUnit"
                      value="no"
                      className="mr-2"
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  (Calculation Unit)Per
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Unit Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>0</option>
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Ratio Precision
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Additional Fields Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Reset to Zero
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>--- Please Select ---</option>
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Accumulate Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>--- Please Select ---</option>
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Ceil Limit
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Daily Floor Limit
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Max Expire Date(Day)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Store Unit
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>--- Please Select ---</option>
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Accumulate Unit
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>--- Please Select ---</option>
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Floor Limit
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Max Rollover
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Max Adjust Balance
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Accumulate Threshold
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Accumulate Amount
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Daily Ceil Limit
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Grace Period
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Daily Transfer Threshold
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceDetailPanel;
