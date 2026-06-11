import { apiConfig, apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { AccmTypeForm } from "../schema/accmType.schema";

const API_URL = apiConfigRef.ref;

type AccumulationTypeListParams = PaginationParams & {
  isAcctResNull: string;
  resourceId?: number;
  spId: number;
};

export const useAccumulationApi = () => {
  const { GetData, PostData, PutData, DeleteData } = useCallApi();

  const createAccumulationType = async (data: AccmTypeForm) => {
    const response = await PostData(`${API_URL}/api/accm-type/add`, data);
    return response;
  };

  const updateAccumulationType = async (data: AccmTypeForm) => {
    // const payload = {
    //   ...data,
    //   reAttr: data.reAttr
    // }
    const response = await PutData(`${API_URL}/api/accm-type/mod`,data);
    return response;
  };

  const getAccumulationTypeList = async ({
    page = 1,
    size = 15,
    sortBy = "resourceId",
    sortDirection,
    search,
    isAcctResNull = "Y",
    resourceId,
    spId = 0,
  }: AccumulationTypeListParams) => {
    const response = await GetData(
      `${API_URL}/api/accm-type/qry-ratable-resource`,
      {
        page,
        size,
        sortBy,
        sortDirection,
        search,
        isAcctResNull,
        resourceId,
        spId,
      }
    );
    return {
      data: response?.data || [],
      totalCount: response?.totalRows || 0,
    };
  };

  const getDetailTriggerAccumulation = async (resourceId: number) => {
    const response = await GetData(
      `${API_URL}/api/accm-type/qry-acm-trigger-ref-ratb-res`,
      {
        resourceId,
        spId: 0,
      }
    );
    return response;
  };

  const getDetailAccumulation = async (resourceId: number) => {
    const response = await GetData(
      `${API_URL}/api/accm-type/qry-acm-ref-ratb-res`,
      {
        resourceId,
        spId: 0,
      }
    );
    return response;
  };

  const getDetailAccumulationPrice = async (resourceId: number) => {
    const response = await GetData(
      `${API_URL}/api/accm-type/qry-acm-up-and-price`,
      {
        resourceId,
        spId: 0,
      }
    );
    return response;
  };

  const getDetailAccumulationCalculation = async (resourceId: number) => {
    const response = await GetData(
      `${API_URL}/api/accm-type/qry-acm-calc-and-price`,
      {
        resourceId,
        spId: 0,
      }
    );
    return response;
  };

  const deleteAccumulationType = async (resourceId: number) => {
    const response = await DeleteData(
      `${API_URL}/api/accm-type/del?resourceId=${resourceId}`,
      {}
    );
    return response;
  };

  const getAccumulationModeOption = async () => {
    const response = await GetData(
      `${API_URL}/api/accm-type/acm-type-list`,
      {}
    );
    return response;
  };

  return {
    createAccumulationType,
    updateAccumulationType,
    getAccumulationModeOption,
    getAccumulationTypeList,
    getDetailAccumulationCalculation,
    getDetailAccumulationPrice,
    getDetailAccumulation,
    getDetailTriggerAccumulation,
    deleteAccumulationType,
  };
};
