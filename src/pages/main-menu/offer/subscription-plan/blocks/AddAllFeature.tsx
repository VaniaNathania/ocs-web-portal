import React, { useState } from "react";

const AddAllFeature = () => {
  const [formData, setFormData] = useState({
    attrName: "",
    attrType: "",
    attrCode: "",
    attrCatg: "Main Product",
    attrChannel: "",
    csrVisible: "Yes",
    configVisible: "Yes",
    instantiatable: "Yes",
    editable: "Yes",
    valueNullable: "Yes",
    ownerMessage: "",
    inputType: "Please Select",
    valueScript: "",
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    //  console.log('Form submitted:', formData);
    // Handle form submission logic here
  };

  const handleCancel = () => {
    //  console.log('Form cancelled');
    // Handle cancel logic here
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Feature Name</h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Feature Type */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 w-24">Feature Type</span>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="featureType"
                  value="basic"
                  className="mr-2"
                  defaultChecked
                />
                <span className="text-sm">Basic Feature</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="featureType"
                  value="object"
                  className="mr-2"
                />
                <span className="text-sm">Object Feature</span>
              </label>
            </div>
          </div>

          {/* Feature Name */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 w-24">* Feature Name</span>
            <input
              type="text"
              name="featureName"
              value={formData.attrName}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Contact Channel */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 w-24">Contact Channel</span>
            <input
              type="text"
              name="contactChannel"
              value={formData.attrChannel}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Project Visible */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 w-24">Project Visible</span>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="projectVisible"
                  value="Yes"
                  checked={formData.configVisible === "Yes"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="projectVisible"
                  value="No"
                  checked={formData.configVisible === "No"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm">No</span>
              </label>
            </div>
          </div>

          {/* Editable */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 w-24">Editable</span>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="editable"
                  value="Yes"
                  checked={formData.editable === "Yes"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="editable"
                  value="No"
                  checked={formData.editable === "No"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm">No</span>
              </label>
            </div>
          </div>

          {/* Owner Message */}
          <div className="flex items-start space-x-4">
            <span className="text-sm text-gray-700 w-24 mt-2">
              Owner Message
            </span>
            <textarea
              name="ownerMessage"
              value={formData.ownerMessage}
              onChange={handleInputChange}
              rows={3}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Input Type */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 w-24">* Input Type</span>
            <select
              name="inputType"
              value={formData.inputType}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Please Select">Please Select</option>
              <option value="Text">Text</option>
              <option value="Number">Number</option>
              <option value="Date">Date</option>
              <option value="Boolean">Boolean</option>
            </select>
          </div>

          {/* Value Script */}
          <div className="flex items-start space-x-4">
            <span className="text-sm text-gray-700 w-24 mt-2">
              Value Script
            </span>
            <textarea
              name="valueScript"
              value={formData.valueScript}
              onChange={handleInputChange}
              rows={3}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Feature Code */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 w-24">Feature Code</span>
            <input
              type="text"
              name="featureCode"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Feature Category */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 w-24">Feature Category</span>
            <select
              name="featureCategory"
              value={formData.attrCatg}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
            >
              <option value="Main Product">Main Product</option>
              <option value="Additional Feature">Additional Feature</option>
              <option value="Optional">Optional</option>
            </select>
          </div>

          {/* CRM Vendor */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 w-24">CSR Visible</span>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="crmVendor"
                  value="Yes"
                  checked={formData.csrVisible === "Yes"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="crmVendor"
                  value="No"
                  checked={formData.csrVisible === "No"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm">No</span>
              </label>
            </div>
          </div>

          {/* Internalisation */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 w-24">Instantiation</span>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="internalisation"
                  value="Yes"
                  checked={formData.instantiatable === "Yes"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="internalisation"
                  value="No"
                  checked={formData.instantiatable === "No"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm">No</span>
              </label>
            </div>
          </div>

          {/* Value Nullable */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 w-24">Value Nullable</span>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="valueNullable"
                  value="Yes"
                  checked={formData.valueNullable === "Yes"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="valueNullable"
                  value="No"
                  checked={formData.valueNullable === "No"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm">No</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-8">
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default AddAllFeature;
