import { useState, useEffect } from "react";
import { Inbox } from "lucide-react";
import { toast } from "sonner";

interface CompareSubsPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowData: any;
  versions: any[];
  loadingVersions: boolean;
  GetData: any;
  API_URL_OFFER: string;
}

const CompareSubsPlanModal: React.FC<CompareSubsPlanModalProps> = ({
  isOpen,
  onClose,
  rowData,
  versions,
  loadingVersions,
  GetData,
  API_URL_OFFER,
}) => {
  const [selectedVersionLeft, setSelectedVersionLeft] = useState<string>("");
  const [selectedVersionRight, setSelectedVersionRight] = useState<string>("");
  const [compareData, setCompareData] = useState({
    left: {
      offerGroups: [],
      features: [],
      prices: [],
    },
    right: {
      offerGroups: [],
      features: [],
      prices: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
      // Reset selections
      setSelectedVersionLeft("");
      setSelectedVersionRight("");

      // Reset compare data
      setCompareData({
        left: { offerGroups: [], features: [], prices: [] },
        right: { offerGroups: [], features: [], prices: [] },
      });
    }
  }, [isOpen, rowData?.offerId]);

  const handleCompare = async () => {
    if (!selectedVersionLeft || !selectedVersionRight) {
      toast.warning("Please select both versions");
      return;
    }

    try {
      const leftData = await GetData(
        `${API_URL_OFFER}/offer/subs-plan/qry-subs-plan-by-indep-prod-id`,
        { indepProdSpecId: Number(selectedVersionLeft) },
      );

      const rightData = await GetData(
        `${API_URL_OFFER}/offer/subs-plan/qry-subs-plan-by-indep-prod-id`,
        { indepProdSpecId: Number(selectedVersionRight) },
      );

      //  console.log("Left data:", leftData);
      //  console.log("Right data:", rightData);

      // DUMMY DATA sebagai fallback
      const dummyLeftData = {
        offerGroups: [
          { groupName: "Basic Package Group", isNecessary: "Yes" },
          { groupName: "Premium Features", isNecessary: "No" },
          { groupName: "Add-on Services", isNecessary: "Yes" },
        ],
        features: [
          {
            offerName: "Data Quota",
            featureValue: "50GB",
            defaultValue: "30GB",
          },
          {
            offerName: "Voice Minutes",
            featureValue: "500 mins",
            defaultValue: "300 mins",
          },
          {
            offerName: "SMS Count",
            featureValue: "Unlimited",
            defaultValue: "100",
          },
        ],
        prices: [
          {
            priceType: "Monthly",
            goodsSaleAmount: "150,000",
            goodsDiscountAmount: "15,000",
            totalRebateAmount: "10,000",
            rebateAmount: "5,000",
            rebateCount: "2",
            rentPrice: "125,000",
            penalty: "25,000",
          },
          {
            priceType: "Quarterly",
            goodsSaleAmount: "400,000",
            goodsDiscountAmount: "40,000",
            totalRebateAmount: "30,000",
            rebateAmount: "15,000",
            rebateCount: "2",
            rentPrice: "330,000",
            penalty: "50,000",
          },
        ],
      };

      const dummyRightData = {
        offerGroups: [
          { groupName: "Basic Package Group", isNecessary: "Yes" },
          { groupName: "Premium Features", isNecessary: "Yes" },
          { groupName: "Enterprise Support", isNecessary: "No" },
        ],
        features: [
          {
            offerName: "Data Quota",
            featureValue: "100GB",
            defaultValue: "50GB",
          },
          {
            offerName: "Voice Minutes",
            featureValue: "Unlimited",
            defaultValue: "500 mins",
          },
          {
            offerName: "SMS Count",
            featureValue: "Unlimited",
            defaultValue: "200",
          },
          {
            offerName: "Roaming",
            featureValue: "Available",
            defaultValue: "Not Available",
          },
        ],
        prices: [
          {
            priceType: "Monthly",
            goodsSaleAmount: "250,000",
            goodsDiscountAmount: "25,000",
            totalRebateAmount: "20,000",
            rebateAmount: "10,000",
            rebateCount: "2",
            rentPrice: "205,000",
            penalty: "35,000",
          },
          {
            priceType: "Quarterly",
            goodsSaleAmount: "650,000",
            goodsDiscountAmount: "65,000",
            totalRebateAmount: "50,000",
            rebateAmount: "25,000",
            rebateCount: "2",
            rentPrice: "560,000",
            penalty: "80,000",
          },
        ],
      };

      setCompareData({
        left: {
          offerGroups: leftData?.data?.offerGroups || dummyLeftData.offerGroups,
          features: leftData?.data?.features || dummyLeftData.features,
          prices: leftData?.data?.prices || dummyLeftData.prices,
        },
        right: {
          offerGroups:
            rightData?.data?.offerGroups || dummyRightData.offerGroups,
          features: rightData?.data?.features || dummyRightData.features,
          prices: rightData?.data?.prices || dummyRightData.prices,
        },
      });

      toast.success("Comparison loaded successfully!");
    } catch (error) {
      console.error("Error loading comparison:", error);
      toast.error("Failed to load comparison data");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[95vw] h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-semibold">
            Subscription Plan Comparison
          </h2>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            X
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Subscription Plan Selection */}
          <div className="mb-6">
            <div className="flex gap-4 items-center mb-3">
              <span className="font-medium">Subscription Plan:</span>
            </div>

            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={rowData?.offerName || "Default Name"}
                disabled
                className="w-1/3 border border-gray-300 px-3 py-2 rounded text-sm bg-gray-50 text-gray-500"
              />

              <div className="flex items-center gap-2">
                <span className="text-sm">Version:</span>
                <select
                  className="border px-3 py-2 rounded text-sm"
                  value={selectedVersionLeft}
                  onChange={(e) => setSelectedVersionLeft(e.target.value)}
                  disabled={loadingVersions}
                >
                  <option value="">
                    {loadingVersions ? "Loading..." : "---Please Select---"}
                  </option>
                  {versions.map((ver: any) => (
                    <option key={ver.offerId} value={ver.offerId}>
                      {ver.effDate}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select
                  className="border px-3 py-2 rounded text-sm"
                  value={selectedVersionRight}
                  onChange={(e) => setSelectedVersionRight(e.target.value)}
                  disabled={loadingVersions}
                >
                  <option value="">
                    {loadingVersions ? "Loading..." : "---Please Select---"}
                  </option>
                  {versions.map((ver: any) => (
                    <option key={ver.offerId} value={ver.offerId}>
                      {ver.effDate}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm disabled:opacity-50"
                onClick={handleCompare}
                disabled={!selectedVersionLeft || !selectedVersionRight}
              >
                Compare
              </button>
            </div>
          </div>

          {/* Main Content - 2 Column Grid Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              {/* Offer Group - Left */}
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h3 className="font-medium text-sm">Offer Group</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 text-xs font-medium border-b">
                    <span>Offer Group Name</span>
                    <span>Is Necessary</span>
                  </div>
                  {compareData.left.offerGroups.length > 0 ? (
                    compareData.left.offerGroups.map(
                      (group: any, idx: number) => (
                        <div
                          key={idx}
                          className="grid grid-cols-2 gap-4 p-3 text-xs border-b hover:bg-gray-50"
                        >
                          <span>{group.groupName}</span>
                          <span>{group.isNecessary}</span>
                        </div>
                      ),
                    )
                  ) : (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      <div className="flex flex-col items-center justify-center">
                        <Inbox className="w-8 h-8 mb-2 opacity-50" />
                        No record to view
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Feature - Left */}
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h3 className="font-medium text-sm">Feature</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 text-xs font-medium border-b">
                    <span>Offer Name</span>
                    <span>Feature Value</span>
                    <span>Default Value</span>
                  </div>
                  {compareData.left.features.length > 0 ? (
                    compareData.left.features.map(
                      (feature: any, idx: number) => (
                        <div
                          key={idx}
                          className="grid grid-cols-3 gap-2 p-3 text-xs border-b hover:bg-gray-50"
                        >
                          <span>{feature.offerName}</span>
                          <span>{feature.featureValue}</span>
                          <span>{feature.defaultValue}</span>
                        </div>
                      ),
                    )
                  ) : (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      <div className="flex flex-col items-center justify-center">
                        <Inbox className="w-8 h-8 mb-2 opacity-50" />
                        No record to view
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              {/* Offer Group - Right */}
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h3 className="font-medium text-sm">Offer Group</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 text-xs font-medium border-b">
                    <span>Offer Group Name</span>
                    <span>Is Necessary</span>
                  </div>
                  {compareData.right.offerGroups.length > 0 ? (
                    compareData.right.offerGroups.map(
                      (group: any, idx: number) => (
                        <div
                          key={idx}
                          className="grid grid-cols-2 gap-4 p-3 text-xs border-b hover:bg-gray-50"
                        >
                          <span>{group.groupName}</span>
                          <span>{group.isNecessary}</span>
                        </div>
                      ),
                    )
                  ) : (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      <div className="flex flex-col items-center justify-center">
                        <Inbox className="w-8 h-8 mb-2 opacity-50" />
                        No record to view
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Feature - Right */}
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h3 className="font-medium text-sm">Feature</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 text-xs font-medium border-b">
                    <span>Offer Name</span>
                    <span>Feature Value</span>
                    <span>Default Value</span>
                  </div>
                  {compareData.right.features.length > 0 ? (
                    compareData.right.features.map(
                      (feature: any, idx: number) => (
                        <div
                          key={idx}
                          className="grid grid-cols-3 gap-2 p-3 text-xs border-b hover:bg-gray-50"
                        >
                          <span>{feature.offerName}</span>
                          <span>{feature.featureValue}</span>
                          <span>{feature.defaultValue}</span>
                        </div>
                      ),
                    )
                  ) : (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      <div className="flex flex-col items-center justify-center">
                        <Inbox className="w-8 h-8 mb-2 opacity-50" />
                        No record to view
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Price Left Container */}
            <div className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h3 className="font-medium text-sm">Price</h3>
              </div>
              <div className="bg-white overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-1.5 border-r text-center font-medium whitespace-nowrap">
                        Price Type
                      </th>
                      <th className="px-4 py-1.5 border-r text-center font-medium whitespace-nowrap">
                        Goods Sale Amount
                      </th>
                      <th className="px-4 py-1.5 border-r text-center font-medium whitespace-nowrap">
                        Goods Discount Amount
                      </th>
                      <th className="px-4 py-1.5 border-r text-center font-medium whitespace-nowrap">
                        Total Rebate Amount
                      </th>
                      <th className="px-4 py-1.5 border-r text-center font-medium whitespace-nowrap">
                        Rebate Amount
                      </th>
                      <th className="px-4 py-1.5 border-r text-center font-medium whitespace-nowrap">
                        Rebate Count
                      </th>
                      <th className="px-4 py-1.5 border-r text-center font-medium whitespace-nowrap">
                        Rent Price
                      </th>
                      <th className="px-4 py-1.5 text-center font-medium whitespace-nowrap">
                        Penalty
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareData.left.prices.length > 0 ? (
                      compareData.left.prices.map((price: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-1.5 border-r text-center">
                            {price.priceType}
                          </td>
                          <td className="px-4 py-1.5 border-r text-right">
                            {price.goodsSaleAmount}
                          </td>
                          <td className="px-4 py-1.5 border-r text-right">
                            {price.goodsDiscountAmount}
                          </td>
                          <td className="px-4 py-1.5 border-r text-right">
                            {price.totalRebateAmount}
                          </td>
                          <td className="px-4 py-1.5 border-r text-right">
                            {price.rebateAmount}
                          </td>
                          <td className="px-4 py-1.5 border-r text-center">
                            {price.rebateCount}
                          </td>
                          <td className="px-4 py-1.5 border-r text-right">
                            {price.rentPrice}
                          </td>
                          <td className="px-4 py-1.5 text-right">
                            {price.penalty}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="p-6 text-center text-gray-500 text-sm"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <Inbox className="w-8 h-8 mb-2 opacity-50" />
                            No record to view
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price Right Container */}
            <div className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h3 className="font-medium text-sm">Price</h3>
              </div>
              <div className="bg-white overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-1.5 border-r text-center font-medium whitespace-nowrap">
                        Price Type
                      </th>
                      <th className="px-4 py-1.5 border-r text-center font-medium whitespace-nowrap">
                        Goods Sale Amount
                      </th>
                      <th className="px-4 py-1.5 border-r text-center font-medium whitespace-nowrap">
                        Goods Discount Amount
                      </th>
                      <th className="px-4 py-1.5 border-r text-center font-medium whitespace-nowrap">
                        Total Rebate Amount
                      </th>
                      <th className="px-4 py-1.5 border-r text-center font-medium whitespace-nowrap">
                        Rebate Amount
                      </th>
                      <th className="px-4 py-1.5 border-r text-center font-medium whitespace-nowrap">
                        Rebate Count
                      </th>
                      <th className="px-4 py-1.5 border-r text-center font-medium whitespace-nowrap">
                        Rent Price
                      </th>
                      <th className="px-4 py-1.5 text-center font-medium whitespace-nowrap">
                        Penalty
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareData.right.prices.length > 0 ? (
                      compareData.right.prices.map(
                        (price: any, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-1.5 border-r text-center">
                              {price.priceType}
                            </td>
                            <td className="px-4 py-1.5 border-r text-right">
                              {price.goodsSaleAmount}
                            </td>
                            <td className="px-4 py-1.5 border-r text-right">
                              {price.goodsDiscountAmount}
                            </td>
                            <td className="px-4 py-1.5 border-r text-right">
                              {price.totalRebateAmount}
                            </td>
                            <td className="px-4 py-1.5 border-r text-right">
                              {price.rebateAmount}
                            </td>
                            <td className="px-4 py-1.5 border-r text-center">
                              {price.rebateCount}
                            </td>
                            <td className="px-4 py-1.5 border-r text-right">
                              {price.rentPrice}
                            </td>
                            <td className="px-4 py-1.5 text-right">
                              {price.penalty}
                            </td>
                          </tr>
                        ),
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="p-6 text-center text-gray-500 text-sm"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <Inbox className="w-8 h-8 mb-2 opacity-50" />
                            No record to view
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareSubsPlanModal;
