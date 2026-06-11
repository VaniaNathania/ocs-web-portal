import { AcctConfService } from "@/common/api/account-config/endpoints";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";

const API_URL = apiConfig.service_price_plan;

const DiscountAPI = () => {
  const { GetData } = useCallApi();
  const { GET_ACCT_ITEM_TYPE } = AcctConfService();
  async function GetDiscountTypeList() {
    try {
      const response = await GetData(`${API_URL}/discount/tabDpType/list`, {});

      return response;
    } catch (error) {
      toast.error("Something went wrong while fetching discount type list.");
      throw error;
    }
  }

  async function GetDistributeMethod() {
    try {
      const response = await GetData(
        `${API_URL}/discount/distributeMethod/list`,
        {}
      );

      return response;
    } catch (error) {
      toast.error(
        "Something went wrong while fetching distribute method list."
      );
      throw error;
    }
  }

  async function GetAcctItemTypeList(search: string) {
    try {
      const response = await GET_ACCT_ITEM_TYPE({
        acctItemTypeName: search,
        page: 1,
        size: 250,
        sortBy: "BAL_TYPE",
        sortDirection: "ASC",
      });

      return response;
      // return response.data.map((item: any) => ({
      //   label: item.acctItemTypeName,
      //   value: item.id,
      // }));
    } catch (error) {
      toast.error(
        "Something went wrong while fetching account item type list."
      );
      throw error;
    }
  }

  async function GetDiscountMethodList() {
    try {
      const response = await GetData(
        `${API_URL}/discount/qry-disct-calc-method`,
        {}
      );

      return response;
    } catch (error) {
      toast.error("Something went wrong while fetching discount method list.");
      throw error;
    }
  }

  async function GetObjectTypeList() {
    try {
      const response = await GetData(
        `${API_URL}/discount/qry-disct-obj-type`,
        {}
      );

      return response;
    } catch (error) {
      toast.error("Something went wrong while fetching object type list.");
      throw error;
    }
  }

  async function GetMemberAliasList() {
    try {
      const response = await GetData(
        `${API_URL}/discount/qry-member-alias`,
        {}
      );

      return response;
    } catch (error) {
      toast.error("Something went wrong while fetching member alias list.");
      throw error;
    }
  }

  async function GetDetailDiscount(discountType: string, discountId: number) {
    try {
      if (discountType === "E") {
        const response = await GetData(`${API_URL}/discount/qry-dp-by-pk`, {
          dpId: discountId,
          spId: 0,
        });

        return response;
      }
    } catch (error) {
      toast.error("Something went wrong while fetching discount detail.");
      throw error;
    }
  }
  async function GetReferenceCondition() {
    try {
      const response = await GetData(`${API_URL}/discount/dpRefCond/list`, {});

      return response;
    } catch (error) {
      toast.error(
        "Something went wrong while fetching reference condition type list."
      );
      throw error;
    }
  }

  async function GetParameterCondition() {
    try {
      const response = await GetData(
        `${API_URL}/discount/qry-offer-attr-for-disct-obj`,
        {}
      );

      return response;
    } catch (error) {
      toast.error(
        "Something went wrong while fetching parameter condition type list."
      );
      throw error;
    }
  }

  async function GetOperatorCondition() {
    try {
      const response = await GetData(
        `${API_URL}/discount/qry-sort-operator`,
        {}
      );

      return response;
    } catch (error) {
      toast.error("Something went wrong while fetching operator type list");
      throw error;
    }
  }

  return {
    GetDiscountTypeList,
    GetDistributeMethod,
    GetAcctItemTypeList,
    GetDiscountMethodList,
    GetObjectTypeList,
    GetDetailDiscount,
    GetMemberAliasList,
    GetReferenceCondition,
    GetParameterCondition,
    GetOperatorCondition,
  };
};

export default DiscountAPI;
