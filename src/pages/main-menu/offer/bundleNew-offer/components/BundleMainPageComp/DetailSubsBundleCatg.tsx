import { ArrowLeft, X } from "lucide-react";
import { DetailSubOfferMainPageProps } from "../../types/BundleTypes";
import { useBundleOfferContext } from "../../hooks/useBundleOfferContext";
import { useEffect, useState } from "react";
import EditDetailSubsBundCatg from "./EditDetailSubsBundCatg";
import FeatureTabContentBund from "./DetailCategoryContentBundle/FeatureTabContentBund";
import RelationshipTabContent from "./DetailCategoryContentBundle/RelationshipTabContent";
import PrivateOfferGroupContentBund from "./DetailCategoryContentBundle/PrivateOfferGroupContentBund";
import OfferStatusManageModalBundCatg from "./DetailCategoryContentBundle/OfferStatusManageModalBundCatg";
import { MapDisplayData } from "../../../main-product/blocks/utils/MapDisplayData";

const DetailSubsBundleCatg: React.FC<DetailSubOfferMainPageProps> = ({
  isOpen,
  subCategory,
  onBack,
  onClose,
  rowData,
  openSource,
}) => {
  const {
    detailContentBundle,
    setDetailContentBundle,
    editModeBundDetail,
    setEditModeBundDetail,
  } = useBundleOfferContext();

  const [activeTabDetailSubs, setActiveTabDetailSubs] = useState("detail");

  const Tabs = [
    { id: "detail", label: "Detail" },
    { id: "feature", label: "Feature" },
    { id: "relationship", label: "Relationship" },
    { id: "private-offer-group", label: "Private-Offer-Group" },
  ];

  const formatDateDDMMYYYY = (dateTime: string): string => {
    if (!dateTime) return "";
    const [year, month, day] = dateTime.split("-");
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    //  console.log("ROWDATA", rowData);
  });

  return (
    <div className="flex flex-col px-6 pt-0 mb-0">
      <div className="flex items-center gap-3 p-4 border-b">
        <button className="btn btn-sm btn-icon btn-light">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
            {subCategory.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg">
              {detailContentBundle?.offerName || rowData?.offerName || "-"}
            </span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            //onClick=(handleOfferStatusManage)
            className="btn btn-sm btn-light hover:bg-gray-100 transition-colors px-3 py-1.5"
            title="Manage Offer Status"
          >
            Offer Status Manage
          </button>
          <button
            className="btn btn-sm btn-icon btn-light"
            //onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex border-b">
        {Tabs.map((tabs) => (
          <button
            key={tabs.id}
            onClick={() => setActiveTabDetailSubs(tabs.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTabDetailSubs === tabs.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tabs.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {activeTabDetailSubs === "detail" && (
          <div>
            {editModeBundDetail ? (
              <EditDetailSubsBundCatg />
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                  <div className="space-y-4">
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Effective Date
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {detailContentBundle?.effDate
                          ? formatDateDDMMYYYY(detailContentBundle.effDate)
                          : rowData?.effDate
                            ? formatDateDDMMYYYY(rowData.effDate)
                            : "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Bundle Code
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {detailContentBundle?.offerCode ||
                          rowData?.offerCode ||
                          "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Paid Flag
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-gray-900">
                        {MapDisplayData(detailContentBundle).paidFlagDisplay ||
                          "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Automatic Renewal
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {detailContentBundle?.automaticRenewal ||
                          rowData?.automaticRenewal ||
                          "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Remarks
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {detailContentBundle?.remarks ||
                          rowData?.remarks ||
                          "-"}
                      </span>
                    </div>
                  </div>
                  {/*  */}

                  <div className="space-y-4">
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Expired Date
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {detailContentBundle?.expDate
                          ? formatDateDDMMYYYY(detailContentBundle.expDate)
                          : rowData?.expDate
                            ? formatDateDDMMYYYY(rowData.expDate)
                            : "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start ">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Effective Type
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {MapDisplayData(detailContentBundle)
                          .effectiveTypeDisplay || "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start ">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Lifecycle Type
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {MapDisplayData(detailContentBundle)
                          .effectiveTypeDisplay || "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start ">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Agreement Period
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {detailContentBundle?.aggrementPeriod &&
                        detailContentBundle?.aggrementPeriodUnit
                          ? `${detailContentBundle?.aggrementPeriod} ${
                              detailContentBundle.aggrementPeriodUnit === "Y"
                                ? "Year"
                                : detailContentBundle.aggrementPeriodUnit ===
                                    "M"
                                  ? "Month"
                                  : detailContentBundle.aggrementPeriodUnit ===
                                      "W"
                                    ? "Week"
                                    : detailContentBundle.aggrementPeriodUnit ===
                                        "D"
                                      ? "Day"
                                      : detailContentBundle.aggrementPeriodUnit ===
                                          "H"
                                        ? "Hour"
                                        : detailContentBundle.aggrementPeriodUnit ===
                                            "C"
                                          ? "Billing Cycle"
                                          : ""
                            }
                                 ${detailContentBundle.aggrementPeriod > 1 ? "s" : ""}`
                          : "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Product Line
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-700">
                        {MapDisplayData(detailContentBundle)
                          .productLineDisplay || "-"}
                      </span>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-normal text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* BundleSection */}
          </div>
        )}
        {activeTabDetailSubs === "feature" && <FeatureTabContentBund />}
        {activeTabDetailSubs === "relationship" && <RelationshipTabContent />}
        {activeTabDetailSubs === "private-offer-group" && (
          <PrivateOfferGroupContentBund />
        )}
        <OfferStatusManageModalBundCatg />
      </div>
    </div>
  );
};

export default DetailSubsBundleCatg;
