import { apiConfig, apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { CreateStepNodePayload } from "../hooks/stepForm";
import { FunctionList, IWorkflowType } from "../utils/workflow.data";
import {
  BillingWorkflowNodeParams,
  StepNodeParams,
  WorkflowTypeParams,
} from "./type";
import { CreateMainNodePayload } from "../hooks/mainForm";
import { useCallback } from "react";
import { WorkflowPayload } from "../hooks/workflowForm";

const API_URL = apiConfigRef.ref;
const API_SVC_PRICEPLAN = apiConfig.service_price_plan;

export const useBillingWorkflowApi = () => {
  const { GetData, PostData, PutData, DeleteData } = useCallApi();

  const GetWorkflowNode = async (params: BillingWorkflowNodeParams) => {
    const response = await GetData(
      `${API_URL}/api/billing-workflow/qry-bwf-node`,
      {
        ...params,
      }
    );
    return response;
  };

  const GetStepNode = async (params: StepNodeParams) => {
    const response = await GetData(
      `${API_URL}/api/billing-workflow/qry-bwf-step-by-workflow`,
      {
        ...params,
      }
    );
    return response;
  };

  const GetDetailStepNode = async (stepId: number) => {
    const response = await GetData(
      `${API_URL}/api/billing-workflow/qry-bwf-step-detail/${stepId}`,
      {}
    );
    return response;
  };

  const CreateWorkflow = async (data: WorkflowPayload) => {
    const response = await PostData(
      `${API_URL}/api/billing-workflow/add-bwf-workflow`,
      data
    );
    return response;
  };

  const UpdateWorkflow = async (data: WorkflowPayload) => {
    const response = await PutData(
      `${API_URL}/api/billing-workflow/mod-bwf-workflow`,
      data
    );
    return response;
  };

  const DeleteWorkflow = async (workflowId: number) => {
    const response = await DeleteData(
      `${API_URL}/api/billing-workflow/del-bwf-workflow/${workflowId}`,
      {}
    );
    return response;
  };

  const CreateStepNode = async (data: CreateStepNodePayload) => {
    const response = await PostData(
      `${API_URL}/api/billing-workflow/add-bwf-step`,
      data
    );
    return response;
  };

  const DeleteStepNode = async (stepId: number) => {
    const response = await DeleteData(
      `${API_URL}/api/billing-workflow/del-bwf-step/${stepId}`,
      {}
    );
    return response;
  };

  const CreateMainNode = async (data: CreateMainNodePayload) => {
    const response = await PostData(
      `${API_URL}/api/billing-workflow/add-bwf-node`,
      data
    );
    return response;
  };

  const UpdateStepNode = async (data: CreateStepNodePayload) => {
    const response = await PutData(
      `${API_URL}/api/billing-workflow/mod-bwf-step`,
      data
    );
    return response;
  };

  const UpdateMainNode = async (data: CreateMainNodePayload) => {
    const response = await PutData(
      `${API_URL}/api/billing-workflow/mod-bwf-node`,
      data
    );
    return response;
  };

  const DeleteMainNode = async (nodeId: number) => {
    const response = await DeleteData(
      `${API_URL}/api/billing-workflow/del-bwf-node/${nodeId}`,
      {}
    );
    return response;
  };

  const CopyStepNode = async (data: CreateStepNodePayload) => {
    const response = await PostData(
      `${API_URL}/api/billing-workflow/copy-bwf-step`,
      data
    );
    return response;
  };

  const CopyMainNode = async (data: CreateMainNodePayload) => {
    const response = await PostData(
      `${API_URL}/api/billing-workflow/copy-bwf-node`,
      data
    );
    return response;
  };

  return {
    GetWorkflowNode,
    GetStepNode,
    GetDetailStepNode,
    CreateWorkflow,
    UpdateWorkflow,
    DeleteWorkflow,
    CreateStepNode,
    UpdateStepNode,
    DeleteStepNode,
    CreateMainNode,
    UpdateMainNode,
    DeleteMainNode,
    CopyStepNode,
    CopyMainNode,
  };
};

export const useWorkflowAdditionalApi = () => {
  const { GetData, PostData, PutData, DeleteData } = useCallApi();

  const WorkflowRuleList = async (
    params: WorkflowTypeParams
  ): Promise<IWorkflowType[]> => {
    const response = await GetData(
      `${API_URL}/api/billing-workflow/qry-bwf-workflow`,
      params
    );

    return response.data;
  };

  const GetShortOperator = useCallback(async (): Promise<
    SortOperatorList[]
  > => {
    const response = await GetData(
      `${API_SVC_PRICEPLAN}/trigger/advance-rule/bwf/sortoperator/list`,
      {}
    );
    return response.data;
  }, [GetData]);

  const GetFunctionCondition = useCallback(async (): Promise<
    FunctionList[]
  > => {
    const response = await GetData(
      `${API_SVC_PRICEPLAN}/trigger/advance-rule/bwf/sortfunction/list `,
      {}
    );
    return response.data;
  }, [GetData]);

  const GetRatableEvent = useCallback(async (): Promise<RatableEventList[]> => {
    const response = await GetData(
      `${API_SVC_PRICEPLAN}/trigger/advance-rule/bwf/reattr/list`,
      {}
    );
    return response.data;
  }, [GetData]);

  const GetZoneMap = useCallback(async (): Promise<ZoneMap[]> => {
    const response = await GetData(
      `${API_SVC_PRICEPLAN}/mapping/zone-map-all/list`,
      {}
    );
    return response.data;
  }, [GetData]);

  return {
    WorkflowRuleList,
    GetShortOperator,
    GetFunctionCondition,
    GetRatableEvent,
    GetZoneMap,
  };
};
