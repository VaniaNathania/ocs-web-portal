import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useEffect, useState } from "react";
import { AvailableOffer } from "../blocks/AddPrivateOfferGroup";
import { toast } from "sonner";

const API_URL_OFFER = apiConfigOffer.offer;

export interface offerGroup {
  groupType: string;
  effDate: string;
  shareFlag: string;
  offerGroupId: string;
  offerGroupType: string;
  offerGroupName: string;
}

export interface ServiceType {
  servType: number;
  servTypeName: string;
  networkType: string;
  networkTypeName: string;
  catgType: string;
  comments: string | null;
  paidFlag: string | null;
  stdCode: string | null;
}

export const useOfferGroupHook = () => {
  const { GetData } = useCallApi();
  const [detailData, setDetailData] = useState({});
  const [depend, setDepend] = useState<AvailableOffer[]>([]);
  const [pricePlan, setPricePlan] = useState<AvailableOffer[]>([]);
  const [defaultPricePlan, setDefaultPricePlan] = useState<AvailableOffer[]>(
    []
  );
  const [goodOffer, setGoodOffer] = useState<AvailableOffer[]>([]);
  const [service, setService] = useState<ServiceType[]>();

  const fetchDepend = async () => {
    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/depend/qry-depend-prod-with-network-type`,
        {}
      );
      const responseData = response.data;
      // console.log(response);

      setDepend(responseData);
      return responseData;
    } catch (error) {
      console.error(error);

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
        {}
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
      console.error(error);

      setPricePlan([]);
      setDefaultPricePlan([]);
      setGoodOffer([]);
      return [];
    }
  };

  const fetchQryOfferGroupAndMember = async (
    type: "0" | "3" | "4" | "5" | "6",
    shareFlag: string
  ) => {
    try {
      const param = {
        offerGroupType: type === "0" ? null : type,
        shareFlag: shareFlag,
        state: "A",
      };
      const response = await GetData(
        `${API_URL_OFFER}/offer/common/qry-offer-group-and-member`,
        param
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
    offerVerId: number
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
        param
      );
      const responseData = response.data;
      // console.log(responseData);

      // setDepend(responseData);
      return responseData;
    } catch (error) {
      console.error(error);

      // setDepend([]);
      return [];
    }
  };

  const fetchServiceType = async () => {
    try {
      // console.log(serverType, "INIIIIII");

      const response = await GetData(`${API_URL_OFFER}/servType/qryServType`, {
        search: "",
        page: 1,
        size: 100,
        sortBy: "SERV_TYPE_NAME",
        catgType: "M",
        sortDirection: "asc",
      });
      if (response?.data) {
        return response.data;
      }
    } catch (error) {
      console.error(error);

      toast.error("Error GET Service Type data");
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const resp = await fetchServiceType();
        // console.log(resp);

        setService(resp);
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const findServiceType = async (
    query: number
  ): Promise<ServiceType | undefined> => {
    // Search by ID
    const data: ServiceType[] = await fetchServiceType();
    const resp = data?.find((item: ServiceType) => item.servType === query);
    // console.log(resp);

    return resp;
  };

  const fetchGroupSubsPlanVerChild = async (index: number) => {
    try {
      const param = {
        offerGroupId: index,
      };
      const response = await GetData(
        `${API_URL_OFFER}/offer/group/qry-offer-group-mem-list`,
        param
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
    findServiceType,
    fetchQryOfferGroupAndMember,
  };
};
