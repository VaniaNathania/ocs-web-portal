import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import ModifySubscriberSuccess from "./ModifySubscriberSuccess";
import { useSubscriberListContext } from "../hooks";
import { ModSubsServiceChild } from "./mockModSubs";

interface ModifySubscriberDetailStepTwoProps {
  onBack: () => void;
}

const ModifySubscriberDetailStepTwo: React.FC<
  ModifySubscriberDetailStepTwoProps
> = ({ onBack }) => {
  const { ownedOffer, selectedSubs } = useSubscriberListContext();
  const [step, setStep] = useState(2);
  const [service, setService] = useState<ModSubsServiceChild[]>([]);
  const init = () => {
    try {
      // const temp: ModSubsServiceChild[] = ownedOffer.flatMap(
      //   (item) => item.children ?? []
      // );
      // setService(temp);
    } catch (error) {
    } finally {
    }
  };

  useEffect(() => {
    init();
  }, []);

  const services = [
    {
      name: "Incoming SMS",
      effectiveType: "2025-09-26 16:28:29",
      effectiveDuration: "Forever",
      features: [],
    },
    {
      name: "Outgoing SMS",
      effectiveType: "2025-09-26 16:28:29",
      effectiveDuration: "Forever",
      features: [],
    },
    {
      name: "Voice Service",
      effectiveType: "2025-09-26 16:28:29",
      effectiveDuration: "Forever",
      features: [],
    },
    {
      name: "Data Service",
      effectiveType: "2025-09-26 16:28:29",
      effectiveDuration: "Forever",
      features: [],
    },
    {
      name: "RAPIDO Socmed 100MB",
      effectiveType: "2025-10-20 13:11:16",
      effectiveDuration: "2025-10-27 12:50:11",
      features: [
        {
          actionType: "X",
          parameterName: "",
          newValue: "AR Inactive",
          oldValue: "0",
        },
      ],
    },
    {
      name: "RAPIDO Socmed 75MB",
      effectiveType: "2025-10-22 11:15:30",
      effectiveDuration: "2025-10-23 11:11:44",
      features: [
        {
          actionType: "X",
          parameterName: "",
          newValue: "AR Inactive",
          oldValue: "0",
        },
      ],
    },
  ];

  return (
    <>
      {step == 3 ? (
        <ModifySubscriberSuccess onBack={onBack} />
      ) : (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-800">
                {selectedSubs?.offerName}
              </h1>
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Service Info */}
            <div className="flex gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📱</span>
                <span>Service Number: 73007362</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📋</span>
                <span>Offer Name: Telkomcel Prepaid Channel</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📊</span>
                <span>Subscription Plan Name: SC_1000_Prepaid_Reguler</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 pb-24">
            {/* Offer Information */}
            <div className="bg-white rounded-lg shadow-sm mb-4">
              <div className="border-l-4 border-blue-500 px-6 py-3">
                <h2 className="text-base font-semibold text-gray-800">
                  Offer Information
                </h2>
              </div>

              <div className="px-6 py-4">
                <div className="grid grid-cols-3 gap-6 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Subscription Plan
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border rounded text-sm text-gray-700">
                      {selectedSubs?.subsPlanId}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Order Number
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border rounded text-sm text-gray-700">
                      20251022211774477
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Service Number
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border rounded text-sm text-gray-700">
                      {selectedSubs?.accNbr}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Payment Account
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border rounded text-sm text-gray-700">
                      930255000
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Services List */}
            <div className="bg-white rounded-lg shadow-sm mb-4">
              <div className="border-l-4 border-blue-500 px-6 py-3">
                <h2 className="text-base font-semibold text-gray-800">
                  Services List
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-y">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">
                        Operation Type
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">
                        Offer Name
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">
                        Effective Type/Effective Date
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">
                        Effective Duration/Expire Date
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">
                        Feature Information
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {service.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-yellow-400 rounded"></div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.offerName}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {item.effType}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {item.effType}
                        </td>
                        <td className="px-4 py-3">
                          {/* {item.features.length > 0 && (
                            <div className="space-y-1">
                              <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 font-medium">
                                <div>Action Type</div>
                                <div>Parameter Name</div>
                                <div>New Value</div>
                                <div>Old Value</div>
                              </div>
                              {item.features.map((feature, fIdx) => (
                                <div
                                  key={fIdx}
                                  className="grid grid-cols-4 gap-2 text-xs text-gray-700"
                                >
                                  <div>{feature.actionType}</div>
                                  <div>{feature.parameterName}</div>
                                  <div>{feature.newValue}</div>
                                  <div>{feature.oldValue}</div>
                                </div>
                              ))}
                            </div>
                          )} */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-l-4 border-blue-500 px-6 py-3">
                <h2 className="text-base font-semibold text-gray-800">
                  Order Information
                </h2>
              </div>

              <div className="px-6 py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Reservation Time
                    </label>
                    <input
                      type="text"
                      placeholder="Format: yyyy-mm-dd hh:ss"
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Remarks
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-4">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
              <Button variant="outline" onClick={onBack}>
                Previous
              </Button>
              <div className="flex gap-3">
                <Button variant="outline">Cancel</Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={() => setStep(3)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModifySubscriberDetailStepTwo;
