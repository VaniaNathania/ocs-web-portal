import React, { useCallback, useEffect, useState } from "react";
import PriceFormSection from "../../blocks/PriceFormSection";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { useOfferLayout } from "@/layouts/main-menu/offer";

export interface subsPlanPriceProps {
  offerVerId: number;
  priceType: string;
  goodsSaleAmount: number | null;
  goodsDiscountAmount: number | null;
  totalRebateAmount: number | null;
  rebateAmount: number | null;
  rebateCount: number | null;
  rentListPrice: number | null;
  comments: string;
  penalty: number | null;
  spId: number;
}

export const initialStateSubsPrice: subsPlanPriceProps = {
  offerVerId: 0,
  priceType: "1",
  goodsSaleAmount: null,
  goodsDiscountAmount: null,
  totalRebateAmount: null,
  rebateAmount: null,
  rebateCount: null,
  rentListPrice: null,
  comments: "",
  penalty: null,
  spId: 0,
};

const API_URL_OFFER = apiConfigOffer.offer;

type PriceType = "1" | "2";

const SubscriptionPriceContent: React.FC = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [subsPrice, setSubsPrice] = useState<
    Record<PriceType, subsPlanPriceProps>
  >({
    "1": { ...initialStateSubsPrice, priceType: "1" },
    "2": { ...initialStateSubsPrice, priceType: "2" },
  });
  const [loading, setLoading] = useState(false);
  const { GetData, PutData } = useCallApi();
  const { selectedVer } = useOfferLayout();
  const [detailData, setDetailData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const doGetListData = useCallback(
    async (offerVerId?: number, priceType?: string) => {
      if (!offerVerId || !priceType) return;

      setLoading(true);
      try {
        const response = await GetData(
          `${API_URL_OFFER}/offer/subs-plan/qry-subs-plan-price`,
          {
            offerVerId,
            priceType,
            spId: 0,
          }
        );

        if (response?.status) {
          const dataObject = Array.isArray(response.data)
            ? response.data[0] || {}
            : response.data || {};

          const mapped: subsPlanPriceProps = {
            offerVerId: dataObject.offerVerId ?? offerVerId,
            priceType: dataObject.priceType ?? priceType,
            goodsSaleAmount: dataObject.goodsSaleAmount ?? null,
            goodsDiscountAmount: dataObject.goodsDiscountAmount ?? null,
            totalRebateAmount: dataObject.totalRebateAmount ?? null,
            rebateAmount: dataObject.rebateAmount ?? null,
            rebateCount: dataObject.rebateCount ?? null,
            rentListPrice: dataObject.rentListPrice ?? null,
            comments: dataObject.comments ?? "",
            penalty: dataObject.penalty ?? null,
            spId: dataObject.spId ?? 0,
          };

          setSubsPrice((prev) => ({
            ...prev,
            [priceType]: mapped,
          }));
        }
      } catch (error) {
        toast.error(`Failed to fetch subs plan price for type ${priceType}`);
      } finally {
        setLoading(false);
      }
    },
    [GetData]
  );

  useEffect(() => {
    if (selectedVer?.offerVerId) {
      doGetListData(selectedVer?.offerVerId ?? 0, "1");
      doGetListData(selectedVer?.offerVerId ?? 0, "2");
    }
  }, [selectedVer, doGetListData]);

  const handleSubmit = useCallback(
    async (priceType: PriceType) => {
      try {
        setIsSubmitting(true);

        const current = subsPrice[priceType];

        const submitPayload: subsPlanPriceProps = {
          offerVerId: current.offerVerId,
          priceType: current.priceType,
          goodsSaleAmount: current.goodsSaleAmount ?? null,
          goodsDiscountAmount: current.goodsDiscountAmount ?? null,
          rentListPrice: current.rentListPrice ?? null,
          totalRebateAmount: current.totalRebateAmount ?? null,
          rebateAmount: current.rebateAmount ?? null,
          rebateCount: current.rebateCount ?? null,
          comments: current.comments ?? "",
          penalty: current.penalty ?? null,
          spId: current.spId ?? 0,
        };

        const response = await PutData(
          `${API_URL_OFFER}/offer/subs-plan/mod-subs-plan-price`,
          submitPayload
        );

        if (response?.status) {
          toast.success("Subscripition price updated successfully");
        } else {
          toast.error(
            response?.message || "Failed to update subscription price"
          );
        }
      } catch (error: any) {
        console.error("❌ Submit error:", error);
        toast.error("Failed to update subscription plan");
        setAlert({
          show: true,
          message: error?.message || "Failed to update subscription plan",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [subsPrice]
  );

  return (
    <div className="p-1">
      <PriceFormSection
        title="Newly Installed Price"
        data={subsPrice["1"]}
        onChange={(key, value) =>
          setSubsPrice((prev) => ({
            ...prev,
            "1": { ...prev["1"], [key]: value },
          }))
        }
        onSave={() => handleSubmit("1")}
      />

      <PriceFormSection
        title="Contract Extension Price"
        data={subsPrice["2"]}
        onChange={(key, value) =>
          setSubsPrice((prev) => ({
            ...prev,
            "2": { ...prev["2"], [key]: value },
          }))
        }
        onSave={() => handleSubmit("2")}
      />
    </div>
  );
};

export default SubscriptionPriceContent;
