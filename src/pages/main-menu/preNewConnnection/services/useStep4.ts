import { apiConfigOrder } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePreNew } from "../hooks/context";
import dayjs from "dayjs";

const API_URL = apiConfigOrder.order;
const useStep4 = () => {
  const { GetData } = useCallApi();
  const { form, setForm, resourceType } = usePreNew();
  const [showDialogSuccess, setShowDialogSuccess] = useState<boolean>(false);

  useEffect(() => {
    const now = dayjs();

    if (form.reqDate && dayjs(form.reqDate).isBefore(now)) {
      toast.error("Run time cannot be earlier than the current time!");
      setForm((prev) => ({ ...prev, reqDate: "" }));
    }
  }, [form.reqDate]);

  useEffect(() => {
    const fetchQryDefLanguage = async () => {
      try {
        setForm((prev) => ({
          ...prev,
          isLoading: true,
        }));
        const response = await GetData(`${API_URL}/api/order-entry/def-lang/qry-def-language`, {});

        if (response?.status) {
          setForm((prev) => ({
            ...prev,
            defLanguage: response?.data,
          }));
        }
      } catch (err) {
        toast.error("Failed GetData!");
      } finally {
        setForm((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    };
    const fetchQryAreaDetail = async () => {
      try {
        setForm((prev) => ({
          ...prev,
          isLoading: true,
        }));
        const response = await GetData(`${API_URL}/api/order-entry/bfm-area/qry-area-detail`, {
          spId: 0,
        });

        if (response?.status) {
          setForm((prev) => ({
            ...prev,
            areaDetail: response?.data,
          }));
        }
      } catch (err) {
        toast.error("Failed GetData!");
      } finally {
        setForm((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    };
    const fetchQryOrgList = async () => {
      try {
        setForm((prev) => ({
          ...prev,
          isLoading: true,
        }));
        const response = await GetData(`${API_URL}/api/order-entry/bfm-org/qry-org-list`, {
          state: "A",
        });

        if (response?.status) {
          setForm((prev) => ({
            ...prev,
            orgData: response?.data,
          }));
        }
      } catch (err) {
        toast.error("Failed GetData!");
      } finally {
        setForm((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    fetchQryAreaDetail();
    fetchQryDefLanguage();
    fetchQryOrgList();
  }, []);

  const handleCustSearch = () => {
    setForm((prev) => ({
      ...prev,
      showDialog: true,
    }));
  };

  const getDetail = (type: "SERVICE" | "PRICEPLAN" | "RESOURCETYPE") => {
    if (type === "RESOURCETYPE") {
      return resourceType.find((item) => item.key === form.resourceType)?.label ?? "";
    }

    const filterSelectItem = form.selectItems.filter((item) => (type === "SERVICE" ? item.defaultFlag === "Y" : item.defaultFlag !== "Y"));

    return filterSelectItem.map((item) => item.name).join(", ");
  };

  return {
    handleCustSearch,
    getDetail,
    showDialogSuccess,
    setShowDialogSuccess,
  };
};

export default useStep4;
