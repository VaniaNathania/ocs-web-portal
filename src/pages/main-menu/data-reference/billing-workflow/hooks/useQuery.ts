import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useBillingWorkflowApi,
  useWorkflowAdditionalApi,
} from "../api/useBillingWorkflowAPI";
import { FunctionList, IWorkflowType } from "../utils/workflow.data";
import { useWorkflowAction } from "./useWorkflowAction";
import { CreateMainNodePayload } from "./mainForm";
import { CreateStepNodePayload } from "./stepForm";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import { WorkflowPayload } from "./workflowForm";
import { WorkflowTypeParams } from "../api/type";
import { useBillingWorkflowStore } from "../stores/billingWorkflow.store";

const API_URL = apiConfigRef.ref;

export const useRatableEventList = () => {
  const { GetRatableEvent } = useWorkflowAdditionalApi();
  return useQuery<RatableEventList[]>({
    queryKey: ["ratableEvents"],
    queryFn: GetRatableEvent,
  });
};

export const useSortOperatorList = () => {
  const { GetShortOperator } = useWorkflowAdditionalApi();
  return useQuery<SortOperatorList[]>({
    queryKey: ["sortOperators"],
    queryFn: GetShortOperator,
  });
};

export const useZoneMapList = () => {
  const { GetZoneMap } = useWorkflowAdditionalApi();
  return useQuery<ZoneMap[]>({
    queryKey: ["zoneMaps"],
    queryFn: GetZoneMap,
  });
};

export const useFunctionList = () => {
  const { GetFunctionCondition } = useWorkflowAdditionalApi();
  return useQuery<FunctionList[]>({
    queryKey: ["functions"],
    queryFn: GetFunctionCondition,
  });
};

export const useWorkflowList = (params: WorkflowTypeParams) => {
  const { WorkflowRuleList } = useWorkflowAdditionalApi();

  return useQuery<IWorkflowType[]>({
    queryKey: ["workflows", params],
    queryFn: () => WorkflowRuleList(params),
    staleTime: 1000 * 60 * 5, // 5 menit
  });
};

export const useWorkflowCanvas = (workflowId?: number) => {
  const { fetchWorkflowCanvas } = useWorkflowAction();
  return useQuery({
    queryKey: ["workflow-canvas", workflowId],
    queryFn: () => fetchWorkflowCanvas(workflowId!),
    enabled: !!workflowId,
    staleTime: 1000 * 60 * 5, // 5 menit
  });
};

export const useCreateWorkflow = () => {
  const { CreateWorkflow } = useBillingWorkflowApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WorkflowPayload) => {
      const response = await CreateWorkflow(data);

      if (!response?.status) {
        throw new Error(response?.message || "Create workflow failed");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Workflow successfully created");
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
    onError: (error: any) => {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    },
  });
};

export const useUpdateWorkflow = () => {
  const { UpdateWorkflow } = useBillingWorkflowApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WorkflowPayload) => {
      const response = await UpdateWorkflow(data);

      if (!response?.status) {
        throw new Error(response?.message || "Update workflow failed");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Workflow successfully updated");
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
    onError: (error: any) => {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    },
  });
};

export const useDeleteWorkflow = () => {
  const { DeleteWorkflow } = useBillingWorkflowApi();
  const { setSelectedWorkflow } = useBillingWorkflowStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflowId: number) => {
      const response = await DeleteWorkflow(workflowId);

      if (!response?.status) {
        throw new Error(response?.message || "Delete workflow failed");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Workflow successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      setSelectedWorkflow(null);
    },
    onError: (error: any) => {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    },
  });
};

export const useCreateMainNode = (workflowId: number | null) => {
  const { CreateMainNode } = useBillingWorkflowApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMainNodePayload) => {
      if (!workflowId) {
        throw new Error("Workflow ID is required");
      }

      const response = await CreateMainNode(data);

      if (!response?.status) {
        throw new Error(response?.message || "Create main node failed");
      }

      return response.data;
    },

    onSuccess: () => {
      toast.success("Main node successfully created");
      queryClient.invalidateQueries({
        queryKey: ["workflow-canvas", workflowId],
      });
    },
    onError: (error: any) => {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    },
  });
};

export const useUpdateMainNode = (workflowId: number | null) => {
  const { UpdateMainNode } = useBillingWorkflowApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMainNodePayload) => {
      if (!workflowId) {
        throw new Error("Workflow ID is required");
      }

      const response = await UpdateMainNode(data);

      if (!response?.status) {
        throw new Error(response?.message || "Update main node failed");
      }

      return response.data;
    },

    onSuccess: () => {
      toast.success("Main node successfully updated");
      queryClient.invalidateQueries({
        queryKey: ["workflow-canvas", workflowId],
      });
    },
    onError: (error: any) => {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    },
  });
};

export const useDeleteMainNode = (workflowId: number | null) => {
  const { DeleteMainNode } = useBillingWorkflowApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nodeId: number) => {
      if (!workflowId) {
        throw new Error("Workflow ID is required");
      }

      const response = await DeleteMainNode(nodeId);

      if (!response?.status) {
        throw new Error(response?.message || "Delete main node failed");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Main node successfully deleted");
      queryClient.invalidateQueries({
        queryKey: ["workflow-canvas", workflowId],
      });
    },
    onError: (error: any) => {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    },
  });
};

export const useUpdateStepNode = (workflowId: number | null) => {
  const { UpdateStepNode } = useBillingWorkflowApi(); 
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStepNodePayload) => {
      if (!workflowId) throw new Error("Workflow ID is required");
      
      const response = await UpdateStepNode(data);

      if (!response?.status) {
        throw new Error(response?.message || "Update step node failed");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Step node successfully updated");
      queryClient.invalidateQueries({
        queryKey: ["workflow-canvas", workflowId],
      });
    },
    onError: (error: any) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    },
  });
};

export const useCreateStepNode = (workflowId: number | null) => {
  const { CreateStepNode } = useBillingWorkflowApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStepNodePayload) => {
      if (!workflowId) {
        throw new Error("Workflow ID is required");
      }

      const response = await CreateStepNode(data);

      if (!response?.status) {
        throw new Error(response?.message || "Create step node failed");
      }

      return response.data;
    },

    onSuccess: () => {
      toast.success("Step node successfully created");
      queryClient.invalidateQueries({
        queryKey: ["workflow-canvas", workflowId],
      });
    },
    onError: (error: any) => {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    },
  });
};

export const useDeleteStepNode = (workflowId: number | null) => {
  const { DeleteStepNode } = useBillingWorkflowApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stepId: number) => {
      if (!workflowId) {
        throw new Error("Workflow ID is required");
      }

      const response = await DeleteStepNode(stepId);

      if (!response?.status) {
        throw new Error(response?.message || "Delete step node failed");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Step node successfully deleted");
      queryClient.invalidateQueries({
        queryKey: ["workflow-canvas", workflowId],
      });
    },
    onError: (error: any) => {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    },
  });
};

export const useCopyStepNode = (workflowId: number | null) => {
  const { CopyStepNode } = useBillingWorkflowApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStepNodePayload) => {
      if (!workflowId) {
        throw new Error("Workflow ID is required");
      }

      const response = await CopyStepNode(data);

      if (!response?.status) {
        throw new Error(response?.message || "Copy step node failed");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Step node successfully copied");
      queryClient.invalidateQueries({
        queryKey: ["workflow-canvas", workflowId],
      });
    },
    onError: (error: any) => {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    },
  });
};

export const useCopyMainNode = (workflowId: number | null) => {
  const { CopyMainNode } = useBillingWorkflowApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMainNodePayload) => {
      if (!workflowId) {
        throw new Error("Workflow ID is required");
      }

      const response = await CopyMainNode(data);

      if (!response?.status) {
        throw new Error(response?.message || "Copy main node failed");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Main node successfully copied");
      queryClient.invalidateQueries({
        queryKey: ["workflow-canvas", workflowId],
      });
    },
    onError: (error: any) => {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    },
  });
};
