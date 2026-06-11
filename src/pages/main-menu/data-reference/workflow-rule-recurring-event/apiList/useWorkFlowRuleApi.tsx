import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { DetailWorkFlowList } from "../types/type";

const API_URL = apiConfigRef.ref;

type WorkFlowListParams = PaginationParams & {
  spId: number;
};

export const useWorkFlowRuleApi = () => {
  const { GetData, PostData, DeleteData, PutData } = useCallApi();

  const getDetailRecurringProc = async ({
    page = 1,
    size = 15,
    sortBy = "RE_ID",
    sortDirection,
    search,
    spId = 0,
  }: WorkFlowListParams) => {
    const response = await GetData(
      `${API_URL}/api/workflow-rule/qry-sort-recurring`,
      {
        page,
        size,
        sortDirection,
        search,
        sortBy,
        spId,
      }
    );
    return {
      data: response?.data || [],
      totalCount: response?.totalRows || 0,
    };
  };

  const getRatableEventName = async (spId: number) => {
    const response = await GetData(
      `${API_URL}/api/workflow-rule/qry-recurring-list`,
      {
        spId,
      }
    );
    return response;
  };

  const deleteWorkFlowType = async (id: number) => {
    const response = await DeleteData(
      `${API_URL}/api/workflow-rule/del-sort-recurring?id=${id}`,
      {}
    );
    return response;
  };

  const getWorkFlowByType = async (workflowType: string, spId: number) => {
    const response = await GetData(
      `${API_URL}/api/billing-workflow/qry-bwf-workflow`,
      {
        workflowType,
        spId,
      }
    );

    if (response?.data) {
      response.data = response.data.map((item: DetailWorkFlowList) => ({
        ...item,
        workflowId: item.id,
      }));
    }

    return response;
  };

  const getWorkFlowTypeE = async (spId: number) => {
    return await getWorkFlowByType("E", spId);
  };
  const getWorkFlowTypeD = async (spId: number) => {
    return await getWorkFlowByType("D", spId);
  };
  const getWorkFlowTypeC = async (spId: number) => {
    return await getWorkFlowByType("C", spId);
  };

  const createWorkFlowRule = async (data: createWorkFlow) => {
    const response = await PostData(
      `${API_URL}/api/workflow-rule/add-sort-recurring`,
      data
    );
    return response;
  };

  const updateWorkFlowRule = async (data: createWorkFlow) => {
    const response = await PutData(
      `${API_URL}/api/workflow-rule/mod-sort-recurring`,
      data
    );
    return response;
  };

  return {
    createWorkFlowRule,
    updateWorkFlowRule,
    deleteWorkFlowType,
    getDetailRecurringProc,
    getRatableEventName,
    getWorkFlowTypeD,
    getWorkFlowTypeE,
    getWorkFlowByType,
    getWorkFlowTypeC,
  };
};
