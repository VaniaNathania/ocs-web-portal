import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useState, useCallback } from "react";

const API_URL_OFFER = apiConfigOffer.offer;

export interface ServiceTypeProps {
  servType: number;
  networkType: string;
  servTypeName: string;
  networkTypeName: string;
}

const initialStateServiceType = {
  servType: 0,
  servTypeName: "",
  networkType: "",
};

export interface LifecycleTypeProps {
  lifecycleType: number;
  lifecycleTypeName: string;
  spId: string;
}

const initialStateLifecycle = {
  lifecycleType: 0,
  spId: 0,
};

// Hook untuk mengambil data service type
const PricePlanAction = () => {
  const [serviceType, setServiceType] = useState<ServiceTypeProps[]>([]);
  const [lifecycleType, setLifecycleType] = useState<LifecycleTypeProps[]>([]);
  const [formServiceType, setFormServiceType] = useState(initialStateServiceType);
  const [formLifecycleType, setFormLifecycleType] = useState(initialStateLifecycle);
  const [contentList, setContentList] = useState<any[]>([]); // For storing the main content list
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { GetData, PostData, PutData } = useCallApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const fetchLifecycleType = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await GetData(`${API_URL_OFFER}/offer/common/qry-lifecycle-type`, {
        lifecycleType: null,
        spId: null,
      });

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch lifecycle type data");
      }

      const list = response?.data?.list ?? response?.data ?? response ?? [];

      setLifecycleType(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error("❌ Error fetching service type:", err);
    } finally {
      setLoading(false);
    }
  }, [GetData]);

  const fetchServiceTypeList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await GetData(`${API_URL_OFFER}/servType/qryServType`, {
        search: "",
        page: 1,
        size: 500,
        sortBy: "SERV_TYPE_NAME",
        sortDirection: "asc",
      });

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch service type data");
      }

      const list = response?.data?.list ?? response?.data ?? response ?? [];

      setServiceType(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error("❌ Error fetching service type:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [GetData]);

  return {
    serviceType,
    lifecycleType,
    fetchServiceTypeList,
    fetchLifecycleType,
    formServiceType,
    setFormServiceType,
    formLifecycleType,
    setFormLifecycleType,
    contentList,
    loading,
    error,
    isSubmitting,
    errors,
    alert,
    setAlert,
    refreshData: () => Promise.all([fetchServiceTypeList()]),
  };
};

export default PricePlanAction;
