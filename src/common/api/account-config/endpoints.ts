import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";

const API_URL = apiConfig.service_price_plan;

type AcctItemTypeParams = PaginationParams & {
  acctItemTypeName?: string;
  spId?: number;
};

type AcctBalanceTypeParams = PaginationParams & {
  acctResName?: string;
};

export const AcctConfService = () => {
  const { GetData, PostData, PutData, DeleteData } = useCallApi();

  const GET_ACCT_ITEM_TYPE = async ({
    page = 1,
    size = 15,
    sortBy = "BAL_TYPE",
    sortDirection = "ASC",
    acctItemTypeName,
    search,
    spId = 0,
  }: AcctItemTypeParams) => {
    const response = await GetData(`${API_URL}/account-item-type/name/list`, {
      page,
      size,
      sortBy,
      sortDirection,
      acctItemTypeName,
      search,
      spId,
    });

    return response;
  };

  const GET_ACCT_BALANCE = async ({
    page = 1,
    size = 15,
    sortBy = "acctResId",
    sortDirection = "ASC",
    search,
    acctResName,
  }: AcctBalanceTypeParams) => {
    const response = await GetData(`${API_URL}/account-balance/type-list`, {
      page,
      size,
      sortBy,
      sortDirection,
      search,
      acctResName,
    });

    return response;
  };

  return {
    GET_ACCT_ITEM_TYPE,
    GET_ACCT_BALANCE,
  };
};
