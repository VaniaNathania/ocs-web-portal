import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import OfferAttribute from "../OfferAttribute";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import AttributeSalesOrganization from "../AttributeSalesOrganization";

interface ConditionFeatureProps {
  isOpen: boolean;
  onClose: () => void;
  featureChildren?: any;
  featureParent?: any;
  fetchData: () => void;
}

const API_URL_OFFER = apiConfigOffer.offer;

const ConditionFeature: React.FC<ConditionFeatureProps> = ({
  isOpen,
  onClose,
  featureChildren,
  featureParent,
  fetchData,
}) => {
  const [activeConditionFeatureTabs, setActiveConditionFeatureTabs] = useState(
    "attribute-sales-condition",
  );
  const { GetData } = useCallApi();
  const allTabs = [
    { id: "attribute-sales-condition", label: "Attribute Sales Condition" },
    { id: "attribute-sales-constraint", label: "Attribute Sales Constraint" },
    { id: "offer-attribute", label: "Offer Attribute (Customize)" },
  ];
  const [inputType, setInputType] = useState<string | undefined>();
  const [baseAttrId, setBaseAttrId] = useState<number | undefined>();
  const [attributeSalesDatas, setAttributeSalesDatas] = useState(null);

  useEffect(() => {
    const inputTypeData = featureChildren?.inputType;
    const baseAttrIdData = featureChildren?.attrId;
    setInputType(inputTypeData);
    setBaseAttrId(baseAttrIdData);
  }, [featureChildren]);

  const fetchAttrDetail = async () => {
    const payload = {
      baseAttrId: baseAttrId,
      spId: 0,
    };
    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/attr/qry-attr-detail`,
        payload,
      );

      if (response?.data) {
        return response?.data;
      } else {
        toast.error("Failed Fetch Detail");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error Fetching Data");
    }
  };

  const fetchAttrValueApplyOrg = async () => {
    const subsPlanOfferAttrId = featureChildren?.subsPlanOfferAttrId;
    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/attr/qry-subs-plan-attr-value-apply-org`,
        {
          subsPlanOfferAttrId,
          spId: 0,
        },
      );

      if (response.data) {
        setAttributeSalesDatas(response.data);
        return response.data;
      }
    } catch (err) {
      console.error(err);
      toast.error("Error Fetching Data");
    }
  };

  useEffect(() => {
    if (isOpen && baseAttrId) {
      //  console.log("DETAIL DATA", featureChildren);
      //  console.log("FINAL BASE ATTR ID", baseAttrId);
      //  console.log("FINAL INPUT TYPE", inputType);
      fetchAttrValueApplyOrg();
      fetchAttrDetail();
    }
  }, [isOpen, baseAttrId, inputType]);

  useEffect(() => {
    if (!isOpen) {
      setAttributeSalesDatas(null);
    }
  }, [isOpen]);

  const ConditionFeatureTabs = useMemo(() => {
    if (inputType === "4") {
      setActiveConditionFeatureTabs("attribute-sales-constraint");
      return allTabs.filter((tab) =>
        ["attribute-sales-constraint", "offer-attribute"].includes(tab.id),
      );
    }
    return allTabs;
  }, [inputType]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Products Configuration Conditions</DialogTitle>
        </DialogHeader>

        <DialogBody className="overflow-y-auto">
          <div className="mb-5 border-b-2">
            {ConditionFeatureTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveConditionFeatureTabs(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeConditionFeatureTabs === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-w-7xl w-full p-3 pt-5 overflow-hidden">
            {activeConditionFeatureTabs === "attribute-sales-condition" && (
              <AttributeSalesOrganization
                featureChildren={featureChildren}
                fetchData={fetchAttrValueApplyOrg}
                attributeSalesDatas={attributeSalesDatas}
              />
            )}
          </div>

          {activeConditionFeatureTabs === "offer-attribute" && (
            <OfferAttribute
              featureChildren={featureChildren}
              inputType={inputType}
              featureParent={featureParent}
              onClose={onClose}
              fetchData={fetchData}
            />
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default ConditionFeature;
