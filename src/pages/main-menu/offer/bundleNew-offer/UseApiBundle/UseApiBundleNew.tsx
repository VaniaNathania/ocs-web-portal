import { useCallApi } from "@/hooks";
import {
  AddSideBarParamsApi,
  BundleQueryParentParams,
  FormDataApiParams,
  FormDataOfferBundle,
  FormDatasAddBundDetail,
  OfferQueryParams,
} from "../types/BundleTypes";
import { apiConfigOffer } from "@/config/api.config";
import { useCallback } from "react";
import { useBundleOfferContext } from "../hooks/useBundleOfferContext";

const useApiBundleNew = () => {
  const { DeleteData, GetData, PostData, PutData } = useCallApi();

  const { selectCategorySideId, filter } = useBundleOfferContext();

  const API_URL_OFFER = apiConfigOffer.offer;

  const getOfferCategory = async (params: OfferQueryParams) => {
    const response = await GetData(
      `${API_URL_OFFER}/offer/category/qry-indep-prod-catg-mem-and-cnt`,
      params,
    );
    return response;
  };

  const getOfferCategorySideParent = async (
    params: BundleQueryParentParams,
  ) => {
    const response = await GetData(
      `
        ${API_URL_OFFER}/offer/category/qry-indep-prod-catg-mem-and-cnt`,
      params,
    );
    return response;
  };

  const getBundleSubsPlanGrandChild = async (indepProdSpecId: string) => {
    const response = await GetData(
      `${API_URL_OFFER}/offer/subs-plan/qry-subs-plan-by-indep-prod-id`,
      {
        indepProdSpecId,
      },
    );
    return response;
  };

  const getListFormDataOffer = async () => {
    const param = {
      offerCatgId: selectCategorySideId || "1",
      page: 1,
      size: 100,
      sortBy: "SEQ",
      sortDirection: "ASC",
      search: "",
    };

    const response = await GetData(
      `
        ${API_URL_OFFER}/offer/indep/qry-indep-offer-list-by-catg-id`,
      param,
    );
    if (!response?.status) {
      throw new Error(response?.message || "Failed to fetch offer data");
    }
    return {
      data: response?.data?.list ?? response?.data ?? [],
      totalCount: response?.totalRows || 0,
    };
  };

  const createAddSideBarBund = async (data: AddSideBarParamsApi) => {
    const response = await PostData(
      `${API_URL_OFFER}/offer/category/add-offer-catg`,
      data,
    );

    return response;
  };

  const createBundDetailAdd = async (data: FormDatasAddBundDetail) => {
    const response = await PostData(
      `${API_URL_OFFER}/offer/indep/add-indep-prod-spec`,
      data,
    );

    return response;
  };

  const getLifeCycleTypeService = async (spId: number) => {
    const response = await GetData(
      `${API_URL_OFFER}/offer/common/qry-lifecycle-type`,
      {
        lifecycleType: "",
        spId: spId,
      },
    );

    return response;
  };

  const getServiceTypeAddDetail = async (page: number, size: number) => {
    const response = await GetData(`${API_URL_OFFER}/servType/qryServType`, {
      search: "",
      page: 1,
      size: 100,
      sortBy: "SERV_TYPE_NAME",
      catgType: "M",
      sortDirection: "asc",
    });
    return response;
  };

  const getSearchByName = async (value: string) => {
    const response = await GetData(`${API_URL_OFFER}/offer/qry-offer-by-name`, {
      offerName: value,
      offerType: filter,
      spId: 0,
      isBundleFlagN: "N",
    });
    return response;
  };

  return {
    getOfferCategory,
    getOfferCategorySideParent,
    getBundleSubsPlanGrandChild,
    getListFormDataOffer,
    createAddSideBarBund,
    createBundDetailAdd,
    getLifeCycleTypeService,
    getServiceTypeAddDetail,
    getSearchByName,
  };
};

export default useApiBundleNew;
