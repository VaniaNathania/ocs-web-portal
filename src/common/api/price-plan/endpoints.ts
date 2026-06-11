import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";

const API_URL = apiConfig.service_price_plan;

export const PricePlanService = () => {
  const { GetData } = useCallApi();

  const GET_REATTR = async () => {
    const response = await GetData(
      `${API_URL}/price-version/reattr-price/list`,
      {}
    );
    return response;
  };

  const GET_UNIT_TYPE = async () => {
    const response = await GetData(`${API_URL}/unitType/list`, {});
    return response;
  };

  return {
    GET_REATTR,
    GET_UNIT_TYPE,
  };
};
