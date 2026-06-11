import { ArrowLeft } from "lucide-react";
import {
  DatasDetailSubsPlanProps,
  DetailSubsPlanCatgProps,
  DetailSubsPlanProps,
  formBundAutoContFlag,
  formBundDate,
  formBundTimeUnit,
  formBunProductLine,
  formEffTypeBund,
  formSaleFlagSubsPlan,
  initDetailSubsPlanProps,
  OfferBundParams,
  SubsPlanTabsBundle,
} from "../../types/BundleTypes";
import VersionSubsPlan from "../../../subscription-plan/components/DetailCategoryContent/VersionSubsPlan";
import SubsPlanVersionBund from "./DetailCategoryContentBundle/SubsPlanVersionBund";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import EditDetailSubsBundCatg from "./EditDetailSubsBundCatg";

const DetailSubsPlanBundleCatg: React.FC<DetailSubsPlanCatgProps> = ({
  isOpen,
  onBack,
  rowData,
  subCategory,
  onSuccess,
  onUpdatePlanInSidebar,
}) => {
  const [activeSubsPlanTabsItem, setActiveSubsPlanTabsItem] =
    useState("detail");
  const [editModeSubsPlan, setEditModeSubsPlan] = useState(false);
  const [subsPlanDetailBund, setSubsPlanDetailBund] =
    useState<DatasDetailSubsPlanProps | null>(null);
  const [titleDisp, setTitleDisp] = useState("");
  const [formDataDetailSubs, setFormDataDetailSubs] =
    useState<DetailSubsPlanProps>(initDetailSubsPlanProps);

  return (
    <div className="flex flex-col px-6 pt-0 mb-0">
      <div className="flex items-center gap-3 p-4 border-b">
        <button onClick={onBack} className="btn btn-sm btn-icon btn-light">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-semibold text-lg">{titleDisp || "-"}</span>
          </div>
          <div className="pl-2">
            <SubsPlanVersionBund />
          </div>
        </div>

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            className="text-white bg-blue-700 hover:bg-blue-500"
            //onClick={HandleOfferStatusManage}
          >
            Offer Status Manage
          </Button>
          <Button
            variant="outline"
            //onClick={() => setShowCompare(true)}
          >
            Compare
          </Button>
          <Button
            variant="outline"
            className="cursor-not-allowed"
            disabled
            //onClick={handleOfferStatueManage}
          >
            Publish
          </Button>
          {/* <CompareBundleSubsPlanModal/> */}
          {/* <OferStatusManageModal/> */}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {SubsPlanTabsBundle.map((tabs) => (
          <button
            key={tabs.id}
            onClick={() => setActiveSubsPlanTabsItem(tabs.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeSubsPlanTabsItem === tabs.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tabs.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {activeSubsPlanTabsItem === "detail" && (
          <div>
            {editModeSubsPlan ? (
              <EditDetailSubsBundCatg />
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                  <div className="space-y-4">
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="W-40 text-sm font-medium text-gray-700">
                        Plan Name
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formDataDetailSubs?.offerName || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="W-40 text-sm font-medium text-gray-700">
                        Lifecycle Type
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formDataDetailSubs?.offerName || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="W-40 text-sm font-medium text-gray-700">
                        Effective Date
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formDataDetailSubs?.offerName || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="W-40 text-sm font-medium text-gray-700">
                        Plan Code
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formDataDetailSubs?.offerName || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="W-40 text-sm font-medium text-gray-700">
                        Aggreement Effective Type
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formDataDetailSubs?.offerName || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="W-40 text-sm font-medium text-gray-700">
                        Remarks
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formDataDetailSubs?.offerName || "-"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="W-40 text-sm font-medium text-gray-700">
                        Sale Type
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formDataDetailSubs?.offerName || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="W-40 text-sm font-medium text-gray-700">
                        Aggreement Period
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formDataDetailSubs?.offerName || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="W-40 text-sm font-medium text-gray-700">
                        Expiry Date
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formDataDetailSubs?.offerName || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="W-40 text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formDataDetailSubs?.offerName || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="W-40 text-sm font-medium text-gray-700">
                        Renewal
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formDataDetailSubs?.offerName || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="W-40 text-sm font-medium text-gray-700">
                        Product Line
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formDataDetailSubs?.offerName || "-"}
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
          </div>
        )}

        {activeSubsPlanTabsItem === "offer-group" && "Offer Group"}
        {activeSubsPlanTabsItem === "feature" && "Feature"}
        {activeSubsPlanTabsItem === "relationship" && "relationship"}
        {activeSubsPlanTabsItem === "sales-condition" && "Sales Condition"}
        {activeSubsPlanTabsItem === "subscription-price" &&
          "Subscription Price"}
        {activeSubsPlanTabsItem === "bundle-member" && "Bundle Member"}
        {activeSubsPlanTabsItem === "script-rule" && ""}
      </div>
    </div>
  );
};

export default DetailSubsPlanBundleCatg;
