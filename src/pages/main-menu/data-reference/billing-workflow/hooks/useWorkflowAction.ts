import { useState } from "react";
import { toast } from "sonner";
import { CreateStepNodePayload } from "./stepForm";
import { useBillingWorkflowApi } from "../api/useBillingWorkflowAPI";
import { BillingWorkflowNodeParams, StepNodeParams } from "../api/type";
import { CreateMainNodePayload } from "./mainForm";
import { BackendMainNode } from "../utils/workflow.data";
import { mapBackendConnectionsToCanvas } from "../utils/workflow.mapper";

export const useWorkflowAction = () => {
  const { GetWorkflowNode, GetStepNode, CreateMainNode, CreateStepNode } =
    useBillingWorkflowApi();

  const fetchWorkflowCanvas = async (workflowId: number) => {
    const [mainRes, stepRes] = await Promise.all([
      getMainNodes({ workflowId }),
      getStepNodes({ workflowId }),
    ]);

    if (!mainRes?.status || !stepRes?.status) {
      throw new Error("Failed to fetch workflow");
    }

    return mapBackendConnectionsToCanvas(mainRes.data, stepRes.data);
  };

  const getMainNodes = async (params: BillingWorkflowNodeParams) => {
    try {
      return await GetWorkflowNode(params);
    } catch (error: any) {
      toast.error(error.message);
      return null;
    }
  };

  const getStepNodes = async (params: StepNodeParams) => {
    try {
      return await GetStepNode(params);
    } catch (error: any) {
      toast.error(error.message);
      return null;
    }
  };

  const createMainNode = async (data: CreateMainNodePayload) => {
    try {
      return await CreateMainNode(data);
    } catch (error: any) {
      toast.error(error.message);
      return;
    }
  };

  const createStepNode = async (data: CreateStepNodePayload) => {
    try {
      return await CreateStepNode(data);
    } catch (error: any) {
      toast.error(error.message);
      return;
    }
  };

  return {
    fetchWorkflowCanvas,
    getMainNodes,
    getStepNodes,
    createMainNode,
    createStepNode,
  };
};
