import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useEffect, useState } from "react";
import { AvailableOffer } from "../blocks/AddPrivateOfferGroupSubsPlan";
import { toast } from "sonner";

const API_URL_OFFER = apiConfigOffer.offer;

interface AttrValueList {
  attrValueId: number;
  baseAttrId: number;
  valueMark: string | null;
  parentAttrId: number;
  spId: number;
  value: string | null;
  parentAttrValueId: number;
  seq: string;
}

interface BaseAttr {
  comments: "";
  nullable: "N";
  defaultValue: "0";
  baseAttrId: "400001";
  promptMsg: "";
  valueScript: "";
  inputType: "1";
  dataSourceService: "";
  spId: "";
  forceSelection: "";
  mask: "";
}

interface Children {
  attrCode: "TECL_USER_TYPE";
  offerAttrValueList: "";
  nullable: "N";
  defaultValue: "0";
  excludeFlag: "N";
  attrType: "1";
  instantiatable: "N";
  defaultValueMark: "";
  subsPlanOfferAttrId: "816";
  inputType: "1";
  attrName: "User Type";
  exceptionMessage: "";
  attrCatg: "";
  mask: "";
  comments: "";
  csrVisible: "Y";
  attrValueIds: ["1"];
  attrChannel: "";
  spId: "0";
  operationTypes: "";
  attrId: "400001";
  objAttrId: "";
  valueIds: "1";
  baseAttr: BaseAttr;
  offerId: "4";
  offerAttrId: "4400001";
  valueScript: "";
  attrValueList: AttrValueList[];
  dispOrder: "1";
}

interface ParentFeature {
  cycleQuantity: "";
  saleListPrice: "";
  expDate: "";
  expTimeUnit: "";
  offerType: "2";
  effDate: "";
  children: Children[];
  effType: "";
  agreementEffType: "";
  salePriceGstType: "";
  state: "";
  timeUnit: "";
  comments: "";
  offerName: "Telkomcel Prepaid Channel";
  prodType: "";
  spId: "";
  rentPriceGstType: "";
  rentListPrice: "";
  createdDate: "";
  offerCode: "MP_1000";
  autoContinueFlag: "";
  offerId: "4";
  duplicateFlag: "";
  expOff: "";
  stateDate: "";
  specTime: "";
}

export const useFeatureHooks = () => {
  const { GetData } = useCallApi();
  const [detailData, setDetailData] = useState({});
  const [depend, setDepend] = useState<AvailableOffer[]>([]);
  const [pricePlan, setPricePlan] = useState<AvailableOffer[]>([]);
  const [defaultPricePlan, setDefaultPricePlan] = useState<AvailableOffer[]>(
    [],
  );
  const [goodOffer, setGoodOffer] = useState<AvailableOffer[]>([]);
  const [isSubmiting, setIsSubmiting] = useState(false);

  const fetchDepend = async () => {
    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/depend/qry-depend-prod-with-network-type`,
        {},
      );
      const responseData = response.data;
      // console.log(response);

      setDepend(responseData);
      return responseData;
    } catch (error) {
      //  console.log(error);

      setDepend([]);
      return [];
    }
  };
  const fetchType = async (type: "1" | "2" | "3" | "4") => {
    if (type === "1") return (await fetchDepend()) || [];
    else return (await fetchQryByOfferType(type)) || [];
  };

  const fetchQryByOfferType = async (type: "2" | "3" | "4") => {
    try {
      const offerType = type === "3" ? "5" : "4";
      let pricePlanTypes: string[] = [];
      if (type != "3") {
        pricePlanTypes = type == "2" ? ["2"] : ["3", "5", "7", "8"];
      }

      const param = {
        offerType: offerType,
        pricePlanTypes: pricePlanTypes,
      };
      const response = await GetData(
        `${API_URL_OFFER}/offer/qry-offer-by-type?offerType=${offerType}&pricePlanTypes=${pricePlanTypes.join("&pricePlanTypes=")}`,
        {},
      );
      const responseData = response.data;
      // console.log(responseData);

      // setDepend(responseData);
      switch (type) {
        case "2":
          await setPricePlan(responseData);
          break;
        case "3":
          setGoodOffer(responseData);
          break;
        case "4":
          setDefaultPricePlan(responseData);
          break;

        default:
          break;
      }
      return responseData;
    } catch (error) {
      //  console.log(error);

      setPricePlan([]);
      setDefaultPricePlan([]);
      setGoodOffer([]);
      return [];
    }
  };

  const fetchQryOfferGroupAndMember = async (
    type: "0" | "3" | "4" | "5" | "6",
    shareFlag: string,
  ) => {
    try {
      const param = {
        offerGroupType: type === "0" ? null : type,
        shareFlag: shareFlag,
        state: "A",
      };
      const response = await GetData(
        `${API_URL_OFFER}/offer/common/qry-offer-group-and-member`,
        param,
      );
      const responseData = response.data;
      // console.log(responseData);

      // setDepend(responseData);
      return responseData;
    } catch (error) {
      return [];
    }
  };

  const fetchAll = () => {
    try {
      fetchDepend();
      fetchQryByOfferType("2");
      fetchQryByOfferType("3");
      fetchQryByOfferType("4");

      return;
    } catch (error) {
      return;
    }
  };

  const fetchGroupSubsPlanVer = async (
    indepProdSpecId: number,
    networkType: string,
    offerGroupType: string,
    offerVerId: number,
  ) => {
    try {
      const param = {
        indepProdSpecId: indepProdSpecId,
        networkType: networkType,
        offerGroupType: offerGroupType,
        offerVerId: offerVerId,
        spId: 0,
      };
      const response = await GetData(
        `${API_URL_OFFER}/offer/subs-plan/qry-offer-group-for-subs-plan-ver`,
        param,
      );
      const responseData = response.data;
      // console.log(responseData);

      // setDepend(responseData);
      return responseData;
    } catch (error) {
      //  console.log(error);

      // setDepend([]);
      return [];
    }
  };

  const fetchGroupSubsPlanVerChild = async (index: number) => {
    try {
      const param = {
        offerGroupId: index,
      };
      const response = await GetData(
        `${API_URL_OFFER}/offer/group/qry-offer-group-mem-list`,
        param,
      );

      const responseData = response.data;

      return responseData;
    } catch (error) {
      return [];
    }
  };

  return {
    fetchDepend,
    depend,
    fetchAll,
    fetchType,
    pricePlan,
    goodOffer,
    defaultPricePlan,
    fetchGroupSubsPlanVer,
    fetchGroupSubsPlanVerChild,
    detailData,
    setDetailData,
    fetchQryOfferGroupAndMember,
    isSubmiting,
    setIsSubmiting,
  };
};
