import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DefaultTooltip, KeenIcon } from "@/components";
import QuantityLimitField from "./group-mode-subs-plan/QuantityLimitFields";
import EffectiveTimeField from "./group-mode-subs-plan/EffectiveTimeFields";
import AgreementFieldsDropdown from "./group-mode-subs-plan/AgreementFieldsDropdown";
import {
  AvailableOffer,
  OfferGroupMem,
  submit,
} from "./AddPrivateOfferGroupSubsPlan";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { useOfferGroupHook } from "../hooks/useOfferGroupHooks";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { boolean } from "yup";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { apiConfigOffer } from "@/config/api.config";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { Item } from "@radix-ui/react-select";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface DealOfferGroupSubsPlanProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  group?: any;
}
const API_URL_OFFER = apiConfigOffer.offer;

const DealOfferGroupSubsPlan: React.FC<DealOfferGroupSubsPlanProps> = ({
  isOpen,
  onClose,
  onSubmit,
  group,
}) => {
  const hooks = useOfferGroupHook();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const { PutData } = useCallApi();

  const [selectedOffers, setSelectedOffers] = useState<AvailableOffer[]>([]);

  const [availableOffers, setAvailableOffers] = useState<AvailableOffer[]>([]);
  const { servType, menuPrivAccess } = useOfferLayout();

  const [filterBy, setFilterBy] = useState<string>(
    `${parseInt(group?.offerGroupType) - 2}`,
  );

  // const [filterBy, setFilterBy] = useState<string>("1");

  const filterOption = [
    { value: "1", label: "Related Product" },
    { value: "2", label: "Price Plan" },
    { value: "3", label: "Goods Product" },
    { value: "4", label: "Default Price Plan" },
  ];

  const selectLabel =
    filterOption.find((opt) => opt.value === filterBy)?.label ?? "";

  const [formData, setFormData] = useState<submit>({
    offerGroupId: group?.offerGroupId,
    offerGroupType: group?.offerGroupType,
    groupType: group?.groupType,
    networkType: servType?.networkType,
    offerGroupMemRequestDto: group?.child?.map(
      (item: OfferGroupMem) =>
        (item = {
          ...item,
          defaultFlag: item.defaultFlag === "Y" ? "Y" : "N",
          hideFlag: item.hideFlag === "Y" ? "Y" : "N",
          agreementEffType: item.agreementEffType ?? undefined,
          agreementPeriod: item.agreementPeriod ?? 0,
          timeUnit: item.timeUnit ?? undefined,
        }),
    ),
    parentOfferGroupId: 0,
    offerGroupDto: {
      offerGroupId: group?.offerGroupId,
      offerGroupName: group?.offerGroupName,
      offerGroupCode: group?.offerGroupCode,
      offerGroupType: group?.offerGroupType,
      groupType: group?.groupType,
      upperLimit: group?.upperLimit,
      lowerLimit: group?.LowerLimit,
      effDate: group?.effDate,
      expDate: group?.expDate,
      createdDate: group?.createdDate,
      state: group?.state,
      stateDate: group?.stateDate,
      shareFlag: group?.shareFlag,
      indepProdSpecId: group?.indepProdSpecId,
      comments: group?.comments,
      spId: 0,
      offerVerId: group?.offerVerId,
      networkType: servType?.networkType,
    },
  });

  const setFormInit = () => {
    setFormData({
      offerGroupId: group?.offerGroupId,
      offerGroupType: group?.offerGroupType,
      groupType: group?.groupType,
      networkType: servType?.networkType,
      offerGroupMemRequestDto: group?.child?.map(
        (item: OfferGroupMem) =>
          (item = {
            ...item,
            defaultFlag: item.defaultFlag === "Y" ? "Y" : "N",
            hideFlag: item.hideFlag === "Y" ? "Y" : "N",
            agreementEffType: item.agreementEffType ?? undefined,
            agreementPeriod: item.agreementPeriod ?? 0,
            timeUnit: item.timeUnit ?? undefined,
          }),
      ),
      parentOfferGroupId: 0,
      offerGroupDto: {
        offerGroupId: group?.offerGroupId,
        offerGroupName: group?.offerGroupName,
        offerGroupCode: group?.offerGroupCode,
        offerGroupType: group?.offerGroupType,
        groupType: group?.groupType,
        upperLimit: group?.upperLimit,
        lowerLimit: group?.LowerLimit,
        effDate: group?.effDate,
        expDate: group?.expDate,
        createdDate: group?.createdDate,
        state: group?.state,
        stateDate: group?.stateDate,
        shareFlag: group?.shareFlag,
        indepProdSpecId: group?.indepProdSpecId,
        comments: group?.comments,
        spId: 0,
        offerVerId: group?.offerVerId,
        networkType: servType?.networkType,
      },
    });
  };

  const initialize = async (newset: boolean) => {
    setIsLoading(true);
    // console.log(group);

    try {
      setFormInit();
      let data: any[] = [];
      const childIds = new Set(
        newset
          ? group?.child?.map((c: any) => c.offerId ?? c.dependProdSpecId)
          : [],
      );

      //  console.log(childIds);

      switch (filterBy) {
        case "1": {
          // fetch if empty, else reuse
          data = hooks.depend?.length
            ? hooks.depend
            : await hooks.fetchType("1");

          // console.log(childIds);

          setAvailableOffers(
            data
              .filter((item) => {
                const now = new Date();

                const effDate = item.offerEffDate
                  ? new Date(item.offerEffDate)
                  : null;
                const expDate = item.offerExpDate
                  ? new Date(item.offerExpDate)
                  : null;

                const isEffValid = !effDate || effDate <= now;
                const isExpValid = !expDate || expDate >= now;
                // console.log(
                //   item,
                //   !childIds.has(item.dependProdSpecId) &&
                //     isEffValid &&
                //     isExpValid,
                // );

                if (childIds.has(item.dependProdSpecId)) return false;

                return isEffValid && isExpValid;
              })
              .map((item) => ({
                ...item,
                id: item.dependProdSpecId ?? 0,
                name: item.offerName ?? "",
                // selected: false,
                // hidden: false,
                // agreement: "",
              })),
          );
          // console.log("related", data);
          break;
        }

        case "2": {
          data = hooks.pricePlan?.length
            ? hooks.pricePlan
            : await hooks.fetchType("2");

          setAvailableOffers(
            data
              .filter((item) => {
                const now = new Date();

                const effDate = item.offerEffDate
                  ? new Date(item.offerEffDate)
                  : null;
                const expDate = item.offerExpDate
                  ? new Date(item.offerExpDate)
                  : null;

                const isEffValid = !effDate || effDate <= now;
                const isExpValid = !expDate || expDate >= now;

                if (childIds.has(item.offerId ?? item.dependProdSpecId))
                  return false;

                return isEffValid && isExpValid;
              })
              .map((item) => ({
                ...item,
                id: item.offerId ?? 0,
                name: item.offerName ?? "",
                // selected: false,
                // hidden: false,
                // agreement: "",
              })),
          );
          // console.log("pricePlan", data);
          break;
        }

        case "3": {
          data = hooks.goodOffer?.length
            ? hooks.goodOffer
            : await hooks.fetchType("3");

          setAvailableOffers(
            data
              .filter((item) => {
                const now = new Date();

                const effDate = item.offerEffDate
                  ? new Date(item.offerEffDate)
                  : null;
                const expDate = item.offerExpDate
                  ? new Date(item.offerExpDate)
                  : null;

                const isEffValid = !effDate || effDate <= now;
                const isExpValid = !expDate || expDate >= now;

                if (childIds.has(item.offerId ?? item.dependProdSpecId))
                  return false;

                return isEffValid && isExpValid;
              })
              .map((item) => ({
                ...item,
                id: item.offerId ?? 0,
                name: item.offerName ?? "",
                // selected: false,
                // hidden: false,
                // agreement: "",
              })),
          );
          // console.log("goodOffer", data);
          break;
        }

        case "4": {
          data = hooks.defaultPricePlan?.length
            ? hooks.defaultPricePlan
            : await hooks.fetchType("4");

          setAvailableOffers(
            data
              .filter((item) => {
                const now = new Date();

                const effDate = item.offerEffDate
                  ? new Date(item.offerEffDate)
                  : null;
                const expDate = item.offerExpDate
                  ? new Date(item.offerExpDate)
                  : null;

                const isEffValid = !effDate || effDate <= now;
                const isExpValid = !expDate || expDate >= now;

                if (childIds.has(item.offerId ?? item.dependProdSpecId))
                  return false;

                return isEffValid && isExpValid;
              })
              .map((item) => ({
                ...item,
                id: item.offerId ?? 0,
                name: item.offerName ?? "",
                // selected: false,
                // hidden: false,
                // agreement: "",
              })),
          );
          // console.log("defaultPricePlan", data);
          break;
        }

        default:
          break;
      }

      // console.log(data);

      if (!newset) {
        return setSelectedOffers([]);
      }
      // always reset after each run
      const transformedSelectedOffers = group?.child?.map(
        (item: AvailableOffer) => {
          setAvailableOffers((prev) =>
            prev.filter((ava) => ava.id !== item.id),
          );

          return {
            ...item,
            id: item.offerId ?? item.dependProdSpecId,
            name: item.offerName ?? "",
            defaultFlag: item.defaultFlag === "Y" ? "Y" : "N",
            hideFlag: item.hideFlag === "Y" ? "Y" : "N",
            agreementEffType: item.agreementEffType ?? "",
            agreementPeriod: item.agreementPeriod ?? 0,
            timeUnit: item.timeUnit ?? "",
          };
        },
      );

      setSelectedOffers(transformedSelectedOffers);
    } catch (error) {
      //  console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    // console.log(
    //   {
    //     offerGroupId: group?.offerGroupId,
    //     offerGroupType: group?.offerGroupType,
    //     groupType: group?.groupType,
    //     networkType: servType?.networkType,
    //     offerGroupMemRequestDto: group?.child?.map(
    //       (item: AvailableOffer) =>
    //         (item = {
    //           ...item,
    //           defaultFlag: item.defaultFlag === "Y" ? "Y" : "N",
    //           hideFlag: item.hideFlag === "Y" ? "Y" : "N",
    //           agreementEffType: item.agreementEffType ?? "",
    //           agreementPeriod: item.agreementPeriod ?? 0,
    //           timeUnit: item.timeUnit ?? "",
    //         })
    //     ),
    //     parentOfferGroupId: 0,
    //     offerGroupDto: {
    //       offerGroupId: group?.offerGroupId,
    //       offerGroupName: group?.offerGroupName,
    //       offerGroupCode: group?.offerGroupCode,
    //       offerGroupType: group?.offerGroupType,
    //       groupType: group?.groupType,
    //       upperLimit: group?.upperLimit,
    //       lowerLimit: group?.LowerLimit,
    //       effDate: group?.effDate,
    //       expDate: group?.expDate,
    //       createdDate: group?.createdDate,
    //       state: group?.state,
    //       stateDate: group?.stateDate,
    //       shareFlag: group?.shareFlag,
    //       indepProdSpecId: group?.indepProdSpecId,
    //       comments: group?.comments,
    //       spId: 0,
    //       offerVerId: group?.offerVerId,
    //       networkType: servType?.networkType,
    //     },
    //   },
    //   "ini formData"
    // );
    // console.log(formData, "ini form");
    // setFormData({
    //   offerGroupId: group?.offerGroupId,
    //   offerGroupType: group?.offerGroupType,
    //   groupType: group?.groupType,
    //   networkType: servType?.networkType,
    //   offerGroupMemRequestDto: group?.child,
    //   parentOfferGroupId: 0,
    //   offerGroupDto: {
    //     offerGroupId: group?.offerGroupId,
    //     offerGroupName: group?.offerGroupName,
    //     offerGroupCode: group?.offerGroupCode,
    //     offerGroupType: group?.offerGroupType,
    //     groupType: group?.groupType,
    //     upperLimit: group?.upperLimit,
    //     lowerLimit: group?.LowerLimit,
    //     effDate: group?.effDate,
    //     expDate: group?.expDate,
    //     createdDate: group?.createdDate,
    //     state: group?.state,
    //     stateDate: group?.stateDate,
    //     shareFlag: group?.shareFlag,
    //     indepProdSpecId: group?.indepProdSpecId,
    //     comments: group?.comments,
    //     spId: 0,
    //     offerVerId: group?.offerVerId,
    //     networkType: servType?.networkType,
    //   },
    // });
    // console.log(group);
    setFilterBy(`${parseInt(group?.offerGroupType) - 2}`);

    if (isOpen) initialize(true);
  }, [isOpen, group]);

  useEffect(() => {
    initialize(false);
  }, [filterBy]);

  const [searchValue, setSearchValue] = useState<string>("");

  const moveToSelected = (offer: AvailableOffer) => {
    setAvailableOffers((prev) => prev.filter((item) => item.id !== offer.id));
    setSelectedOffers((prev) => [
      ...prev,
      {
        ...offer,
        defaultFlag: "N",
      },
    ]);
  };

  const moveToAvailable = (offer: AvailableOffer) => {
    if (offer.dependProdSpecId) {
      setSelectedOffers((prev) =>
        prev.filter((item) => item.dependProdSpecId !== offer.dependProdSpecId),
      );
    }
    if (offer.offerId) {
      setSelectedOffers((prev) =>
        prev.filter((item) => item.offerId !== offer.offerId),
      );
    }
    setAvailableOffers((prev) => [
      ...prev,
      {
        ...offer,
      },
    ]);
  };

  const moveAllToSelected = () => {
    setSelectedOffers((prev) => [...prev, ...availableOffers]);
    setAvailableOffers([]);
  };

  const moveAllToAvailable = () => {
    setAvailableOffers((prev) => [...prev, ...selectedOffers]);
    setSelectedOffers([]);
  };

  const toggleOfferSelection = (
    id: number,
    field: keyof Pick<AvailableOffer, "defaultFlag" | "hideFlag">,
  ) => {
    setSelectedOffers((prev) =>
      prev.map((offer) =>
        offer.id === id
          ? {
              ...offer,
              [field]: offer[field] === "Y" ? "N" : "Y",
            }
          : offer,
      ),
    );
  };

  const onConfirm = async () => {
    try {
      if (!formData.offerGroupDto.offerGroupName) {
        return toast.error("Offer Group Name must be filled");
      }
      if (formData.offerGroupDto.offerGroupName.length > 30) {
        return toast.error(
          `Offer Group Name to long (${formData.offerGroupDto.offerGroupName.length} character), maximum of 30 characters`,
        );
      }
      if (
        formData.offerGroupDto.offerGroupCode?.length &&
        formData.offerGroupDto.offerGroupCode?.length > 30
      ) {
        // console.log((formData.offerGroupDto.offerGroupCode?.length ?? 0) > 30);

        return toast.error(
          `Offer Group Code to long (${formData.offerGroupDto.offerGroupCode?.length ?? 0} character), maximum of 30 characters`,
        );
      }
      if (!formData.offerGroupDto.effDate) {
        return toast.error("Offer Group effective date must be filled");
      }
      if (!formData.offerGroupDto.groupType) {
        return toast.error("Offer Group Mode must be selected");
      }
      if (formData.offerGroupDto.expDate) {
        const startDate = new Date(formData.offerGroupDto.effDate ?? "");
        const endDate = new Date(formData.offerGroupDto.expDate ?? "");
        if (startDate > endDate)
          return toast.error("Expired date can't be before effective date");
      }

      const submitData: submit = {
        ...formData,
        offerGroupMemRequestDto: selectedOffers?.map(
          (item: AvailableOffer, index) =>
            (item = {
              // ...item,
              networkType: formData.networkType,
              offerGroupId: formData.offerGroupId,
              // offerGroupMemId: item.offerId ?? item.dependProdSpecId,
              offerId: item.offerId ?? item.dependProdSpecId,
              seq: index + 1,
              spId: 0,
              agreementPeriod: item.agreementPeriod,
              timeUnit: item.timeUnit,
              defaultFlag: item.defaultFlag ?? "N",
              hideFlag: item.hideFlag,
              agreementEffType: item.agreementEffType,
              upperLimit: item.upperLimit,
              lowerLimit: item.lowerLimit,
              defaultNum: item.defaultNum,
            }),
        ),
        offerGroupDto: {
          ...formData.offerGroupDto,
          groupType: formData.groupType,
        },
      };
      const resp = await PutData(
        `${API_URL_OFFER}/offer/group/mod-offer-group`,
        submitData,
      );

      if (resp?.status) {
        toast.success(resp.message);
        onClose();
      } else toast.error(resp?.message || "Failed to Add Data");
      // console.log(resp,);
    } catch (error) {
      //  console.log(error);

      toast.error("Failed to add data");
    } finally {
      setShowConfirm(false);
      // onClose();
    }
  };

  const handleSubmit = () => {
    setShowConfirm(true);
    // toast.success("test");
  };

  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSelect = (row: AvailableOffer) => {
    setSearchValue("");
    setShowSuggestions(false);
    moveToSelected(row);
    // handleExpand(row);
    // console.log(row);
  };

  const suggestions = useMemo(() => {
    if (!searchValue) return [];
    return availableOffers.filter((p) =>
      p.offerName?.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [searchValue, availableOffers]);

  const [showSuggestionsDel, setShowSuggestionsDel] = useState(false);
  const [searchDel, setSearchDel] = useState<string>();

  const handleDelete = (row: AvailableOffer) => {
    setSearchDel("");
    setShowSuggestionsDel(false);
    moveToAvailable(row);
    // handleExpand(row);
    // console.log(row);
  };

  const suggestionsDel = useMemo(() => {
    if (!searchDel) return [];
    return selectedOffers.filter((p) =>
      p.offerName?.toLowerCase().includes(searchDel.toLowerCase()),
    );
  }, [searchDel, selectedOffers]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        aria-describedby=""
      >
        <DialogHeader className="flex justify-between items-center border-b bg-gray-100 px-4 py-3">
          <DialogTitle>Deal Offer Group</DialogTitle>
        </DialogHeader>
        {isLoading && <Loading />}
        <PopUpDialog
          isOpen={showConfirm}
          handleDialog={setShowConfirm}
          onConfirm={onConfirm}
          bgOn={false}
        />

        <div className="space-y-6 overflow-auto p-3">
          {/* Offer Group Information */}
          <h2 className="text-lg font-semibold mb-4">
            Offer Group Information
          </h2>
          <div className="border-b pb-6">
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <span className="text-red-500">*</span> Group Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData?.offerGroupDto?.offerGroupName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      offerGroupDto: {
                        ...prev.offerGroupDto,
                        offerGroupName: e.target.value,
                      },
                    }))
                  }
                  // disabled={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Group Code
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  // value={formData?.offerGroupDto?.offerGroupCode}
                  value={formData?.offerGroupDto?.offerGroupCode ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      offerGroupDto: {
                        ...prev.offerGroupDto,
                        offerGroupCode: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Group Mode
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center text-sm">
                    <input
                      type="radio"
                      name="groupType"
                      value="B"
                      checked={formData.groupType === "B"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          groupType: e.target.value,
                        }))
                      }
                      className="mr-2"
                    />
                    Single Select
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="radio"
                      name="groupType"
                      value="C"
                      checked={formData.groupType === "C"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          groupType: e.target.value,
                        }))
                      }
                      className="mr-2"
                    />
                    Multi Select
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="radio"
                      name="groupType"
                      value="A"
                      checked={formData.groupType === "A"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          groupType: e.target.value,
                        }))
                      }
                      className="mr-2"
                    />
                    Select All
                  </label>
                </div>
              </div>

              {/* if group mode !C - render quantity time & effective time*/}
              {formData.groupType === "C" ? (
                <QuantityLimitField
                  lower={formData.offerGroupDto?.lowerLimit}
                  upper={formData.offerGroupDto?.upperLimit}
                  onChange={(field, value) =>
                    setFormData((prev) => ({
                      ...prev,
                      offerGroupDto: { ...prev.offerGroupDto, [field]: value },
                    }))
                  }
                />
              ) : (
                <EffectiveTimeField
                  start={formData.offerGroupDto?.effDate}
                  end={formData.offerGroupDto?.expDate || ""}
                  onChange={(field, value) =>
                    setFormData((prev) => ({
                      ...prev,
                      offerGroupDto: { ...prev.offerGroupDto, [field]: value },
                    }))
                  }
                />
              )}
            </div>

            {/* if group mode multi select - render effective time*/}
            {formData.groupType === "C" && (
              <div className="grid grid-cols-2 gap-6 mb-4">
                <EffectiveTimeField
                  start={formData.offerGroupDto?.effDate}
                  end={formData.offerGroupDto?.expDate || ""}
                  onChange={(field, value) =>
                    setFormData((prev) => ({
                      ...prev,
                      offerGroupDto: { ...prev.offerGroupDto, [field]: value },
                    }))
                  }
                />
              </div>
            )}
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-6 relative">
            {/* {isLoading && <Loading />} */}
            {/* Title */}
            <div className="col-span-3 mb-2">
              <h2 className="text-lg font-semibold">Offer Information</h2>
            </div>

            <div className="col-span-3 flex flex-row">
              {/* Kiri */}
              <div className="flex flex-col w-[45%]">
                {/* Header kiri */}
                <div className="grid grid-cols-[auto_1fr] items-center gap-3 mb-2">
                  <Select
                    value={filterBy}
                    onValueChange={(val) => setFilterBy(val)}
                    disabled={selectedOffers?.length > 0}
                  >
                    <SelectTrigger className="w-32 px-2 py-1 text-xs h-8">
                      <SelectValue placeholder={`Search ${selectLabel}..`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Related Product</SelectItem>
                      <SelectItem value="2">Price Plan</SelectItem>
                      <SelectItem value="3">Goods Product</SelectItem>
                      <SelectItem value="4">Default Price Plan</SelectItem>
                    </SelectContent>
                  </Select>

                  <label className="input input-sm w-full flex items-center relative">
                    <div className="flex flex-row gap-2">
                      <KeenIcon icon="magnifier" />
                      <input
                        type="text"
                        value={searchValue}
                        onChange={(event) => {
                          setSearchValue(event.target.value);
                          setShowSuggestions(true);
                        }}
                        className="w-full"
                        placeholder={`Search ${selectLabel}..`}
                        onBlur={() =>
                          setTimeout(() => setShowSuggestions(false), 150)
                        } // delay so click still works
                        onFocus={() => searchValue && setShowSuggestions(true)}
                      />
                    </div>

                    {showSuggestions && suggestions.length > 0 && (
                      <ul className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-md z-50 max-h-40 overflow-auto">
                        {suggestions.map((p, idx) => (
                          <li
                            key={idx}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                            onMouseDown={() => handleSelect(p)} // use onMouseDown so blur doesn’t hide it first
                          >
                            <DefaultTooltip
                              title={`Add ${p.offerName}`}
                              placement="top"
                            >
                              <div>{p.offerName}</div>
                            </DefaultTooltip>
                          </li>
                        ))}
                      </ul>
                    )}
                  </label>
                </div>

                {/* List kiri */}
                <div className="border rounded-lg flex-1">
                  <div className="max-h-64 overflow-y-auto">
                    {availableOffers.map((offer) => (
                      <div
                        key={offer.id}
                        className="group flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-2">
                          <span>{offer.name}</span>
                        </div>
                        <button
                          onClick={() => moveToSelected(offer)}
                          className="p-1 hover:bg-gray-200 rounded hidden group-hover:block"
                        >
                          <KeenIcon icon="plus" className="text-green-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Move All arrows */}
              <div className="flex flex-col items-center justify-center space-y-4 pt-10 flex-1">
                <button
                  onClick={() => moveAllToSelected()}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={availableOffers.length === 0}
                >
                  <KeenIcon icon="right" />
                </button>
                <button
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => moveAllToAvailable()}
                  disabled={selectedOffers?.length === 0}
                >
                  <KeenIcon icon="left" />
                </button>
              </div>

              {/* Kanan */}
              <div className="flex flex-col w-[45%]">
                {/* Header kanan */}
                <div className="grid grid-cols-[auto_1fr] items-center gap-3 mb-2">
                  <div className="h-8 flex items-center">
                    <span className="text-sm font-medium whitespace-nowrap">
                      Your Selected {selectedOffers?.length} Offer
                    </span>
                  </div>

                  <label className="input input-sm w-full flex items-center relative">
                    <div className="flex flex-row gap-2">
                      <KeenIcon icon="magnifier" />
                      <input
                        type="text"
                        value={searchDel}
                        onChange={(event) => {
                          setSearchDel(event.target.value);
                          setShowSuggestionsDel(true);
                        }}
                        className="w-full"
                        placeholder={`Search ${selectLabel}..`}
                        onBlur={() =>
                          setTimeout(() => setShowSuggestionsDel(false), 150)
                        } // delay so click still works
                        onFocus={() => searchDel && setShowSuggestionsDel(true)}
                      />
                    </div>

                    {showSuggestionsDel && suggestionsDel.length > 0 && (
                      <ul className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-md z-50 max-h-40 overflow-auto">
                        {suggestionsDel.map((p, idx) => (
                          <li
                            key={idx}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                            onMouseDown={() => handleDelete(p)} // use onMouseDown so blur doesn’t hide it first
                          >
                            <DefaultTooltip
                              title={`Add ${p.offerName}`}
                              placement="top"
                            >
                              <div>{p.offerName}</div>
                            </DefaultTooltip>
                          </li>
                        ))}
                      </ul>
                    )}
                  </label>
                </div>

                {/* List kanan */}
                <div className="border rounded-lg overflow-hidden flex-1">
                  <div className="max-h-64 overflow-y-auto">
                    {selectedOffers?.map((offer, index) => (
                      <div
                        key={index}
                        className="group p-3 border-b last:border-b-0"
                      >
                        <div className="font-medium mb-2">
                          {offer.offerName ?? ""}
                        </div>
                        <div className="grid grid-cols-4 gap-4 items-center">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={offer?.defaultFlag === "Y"}
                              onChange={() =>
                                toggleOfferSelection(
                                  offer?.id ?? 0,
                                  "defaultFlag",
                                )
                              }
                              className="mr-1"
                            />
                            Select
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={offer?.hideFlag === "Y"}
                              onChange={() =>
                                toggleOfferSelection(offer.id ?? 0, "hideFlag")
                              }
                              className="mr-1"
                            />
                            Hidden
                          </label>

                          {/* Agreement Dropdown */}
                          <AgreementFieldsDropdown
                            offer={offer}
                            setSelectedOffers={setSelectedOffers}
                          />

                          <button
                            onClick={() => moveToAvailable(offer)}
                            className="p-1 hover:bg-gray-200 rounded ml-auto hidden group-hover:block"
                          >
                            <KeenIcon icon="minus" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="justify-end space-x-3 pr-7">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            OK
          </button>
                        </AccessWrapper>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DealOfferGroupSubsPlan;
