import React, { useState, useMemo, useCallback } from 'react';
import { X, Search, Plus } from 'lucide-react';
import {
  DataGridColumnHeader,
  DataGridProvider,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
// import { ListToolBarFeature } from './ListToolBarFeature'; // Commented out as it's not directly used in this component's logic
// import { ListToolBarFeature } from './ListToolBarFeature'; // Commented out as it's not directly used in this component's logic

export interface Feature {
  id: string;
  name: string;
  code: string;
  operation: string;
  selected: boolean;
}

interface AddVersionDialogProps { // Renamed to AddVersionDialogProps for consistency
  isOpen: boolean;
  onClose: () => void;
  // onAdd: (selectedFeatures: Feature[]) => void;
}

const ScriptRuleDialog: React.FC<AddVersionDialogProps> = ({ isOpen, onClose }) => {
  const [isPackage, setIsPackage] = useState("Yes"); // State for radio buttons, if still needed
  const [activeTab, setActiveTab] = useState('scriptRule'); // State to manage active tab

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Reduced max-w and height of dialog, but the image shows a larger dialog for the Script Rule */}
      {/* Adjust max-w and max-h as needed. For the script rule, a wider dialog is better. */}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl h-[90vh] overflow-hidden flex flex-col"> {/* Increased max-w and set a fixed height for better layout */}
        {/* Header */}
        <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Sales Script Rule</h2> {/* Changed title as per image */}
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'scriptRule'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('scriptRule')}
          >
            Script Rule
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'example'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('example')}
          >
            Example
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-4"> {/* Added padding to content area */}
          {activeTab === 'scriptRule' && (
            <div>
              {/* Content for Script Rule tab (e.g., a textarea for code) */}
              <textarea
                className="w-full h-80 p-2 border rounded-md resize-y font-mono text-sm"
                placeholder="Write your script rule here..."
                // You might want to bind this to a state variable
              ></textarea>
            </div>
          )}

          {activeTab === 'example' && (
            <div>
              {/* Content for Example tab */}
              <p className="text-gray-700">
                This is where you can see examples of script rules.
                <br /><br />
                For instance:
                <pre className="bg-gray-100 p-3 rounded-md mt-2 text-sm font-mono overflow-auto">
                  <code>
                    // Example Script<br/>
                    function calculateRebate(price, usage) {'{'}<br/>
                    &nbsp;&nbsp;if (usage &gt; 100) {'{'}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;return price * 0.05;<br/>
                    &nbsp;&nbsp;{'}'} else {'{'}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;return 0;<br/>
                    &nbsp;&nbsp;{'}'}<br/>
                    {'}'}
                  </code>
                </pre>
              </p>
            </div>
          )}

          {/* Moved original Rebate Setting form content here for reference,
              but based on the image, this dialog is *only* for the script rule.
              If you need the form fields AND the script rule, you'd need to
              restructure where RebateSettingDialog is used or how it operates.
              For now, I'm assuming this component becomes the "Sales Script Rule" dialog.
          */}
          {/*
          <div className="flex min-h-full flex-col">
            <div>
              <label className="text-sm font-medium"><span className='text-red-500'>*</span>Version</label>
              <select className="w-full border rounded px-2 py-1 text-sm mt-1">
                <option>--- Please Select ---</option>
              </select>
            </div>

            <div className='mt-2'>
              <label className="text-sm font-medium"><span className='text-red-500'>*</span>Rebate Type</label>
              <div className="flex space-x-4 mt-1">
                <label>
                  <input
                    type="radio"
                    name="isPackage"
                    value="Yes"
                    checked={isPackage === "Yes"}
                    onChange={() => setIsPackage("Yes")}
                  />{" "}
                  Rate
                </label>
                <label>
                  <input
                    type="radio"
                    name="isPackage"
                    value="No"
                    checked={isPackage === "No"}
                    onChange={() => setIsPackage("No")}
                  />{" "}
                  Amount
                </label>
              </div>
            </div>

            <div className='mt-2'>
              <label className="text-sm font-medium">
                <span className="text-red-500">*</span>Rebate Count
              </label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1 text-sm mt-1"
                placeholder="Development For Hybrid DPP"
              />
            </div>

            <div className='mt-2'>
              <label className="text-sm font-medium">
                Default Value
              </label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1 text-sm mt-1"
                placeholder="Development For Hybrid DPP"
              />
            </div>

          </div>
          */}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex justify-end items-center gap-2"> {/* Added gap-2 for button spacing */}
          <button
            // Add your compile logic here
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Compile
          </button>
          <button
            // Add your OK logic here
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            OK
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScriptRuleDialog;