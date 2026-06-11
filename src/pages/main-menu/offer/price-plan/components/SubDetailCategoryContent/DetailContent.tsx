import React, { useState, useEffect, useCallback, useRef } from "react";
// import FeatureContent from "./FeatureContent";
import RelationshipTabContent from "../../../main-product/components/DetailCategoryContent/RelationShipTabContent";
import SalesConditionTabContent from "../../../related-product/components/DetailCategoryContent/SalesConditionTabContent";
import VersionContent from "./VersionContent";
import { Button } from "@/components/ui/button";
import OfferStatusManageDialog from "../../blocks/OfferStatusManageDialog";
import BelongInPackage from "./BelongInPackage";
import BelongInOfferGroup from "./BelongInOfferGroup";
import BelongInSubscriptionPlan from "./BelongInSubscriptionPlan";
import Rebate from "./Rebate";
import ScriptRule from "./ScriptRule";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import { apiConfig } from "@/config/api.config";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Checkbox } from "@/components/ui/checkbox";
import moment from "moment";
import { ArrowLeft, X } from "lucide-react";
import Swal from "sweetalert2";
import FeatureTabContent from "../../../main-product/components/DetailCategoryContent/FeatureTabContent";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useOfferLayout } from "@/layouts/main-menu/offer";

interface DetailProps {
  onBack: () => void;
  offerid: any;
  catgid: any;
  onReload: () => void;
  rowData: any;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  fetchOfferData: () => void;
  onOpenPortal?: (offerVerId: number, dataPricePlan: any) => void;
}

interface CreatePricePlanParams {
  priceplanname: string | null;
  priceplancode: string | null;
  servicetype?: any;
  validperiodstart: string | null;
  validperiodend: string | null;
  applylevel: string | null;
  priceplantype: any;
  ispackage?: string | null;
  packagemode?: string | null;
  quantitylimitupper?: any;
  quantitylimitlower?: any;
  saleprice?: any;
  rentprice?: any;
  duplicateorder?: string | null;
  effectivetype: string | null;
  ordertimelimitinput?: string | null;
  ordertimelimitselect?: string | null;
  automaticrenewal?: string | null;
  agreementperiodinput?: string | null;
  agreementperiodselect?: string | null;
  agreementaffectiveinput?: string | null;
  agreementaffectiveselect?: string | null;
  remarks?: string | null;
}

const API_URL_OFFER = apiConfigOffer.offer;
const API_URL_8080 = apiConfig.service_price_plan;

const DetailContent: React.FC<DetailProps> = ({ onBack, offerid, catgid, onReload, rowData, isEditing, setIsEditing, fetchOfferData, onOpenPortal }) => {
  const { menuPrivAccess } = useOfferLayout();
  const [activeTab, setActiveTab] = useState("detail");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRenewal, setIsRenewal] = useState("");
  const [efftype, setEffType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setIsLoading] = useState(false);
  const [isPackage, setIsPackage] = useState("Yes");
  // const [autoRenewal, setAutoRenewal] = useState("Yes");
  const [detailContent, setDetailContent] = useState<any>(null);
  const [offername, setOfferName] = useState("");
  const [serviceType, setServiceType] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  // const [isOpen2, setIsOpen] = useState(false);
  // const [page, setPage] = useState(1);
  // const [size] = useState(10);
  // const [totalRows, setTotalRows] = useState(0);
  const [pricePlanType, setPricePlanType] = useState<any[]>([]);
  const [effTypeOpen, setEffTypeOpen] = useState(false);
  const [selectedEffType, setSelectedEffType] = useState<string[]>([]);
  const [applyLevelDisabled, setApplyLevelDisabled] = useState("");
  const [effTypeDisabled, setEffTypeDisabled] = useState("");
  const [packageModeOldValue, setPackageModeOldValue] = useState("");
  const [quantitylimitlowerOldValue, setQuantitylimitlowerOldValue] = useState("");
  const [quantitylimitupperOldValue, setQuantitylimitupperOldValue] = useState("");
  const [search, setSearch] = useState("");
  const [isOpenServiceType, setIsOpenServiceType] = useState(false);
  const [lengthBelongInOfferGroup, setLengthBelongInOfferGroup] = useState(0);
  const [lengthBelongInPackage, setLengthBelongInPackage] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasFetched = useRef(false);

  const fetchServiceType = async () => {
    if (hasFetched.current) return; // ✅ kalau sudah pernah fetch, langsung keluar

    setIsLoading(true);
    try {
      const response = await GetData(`${API_URL_OFFER}/servType/qryServType`, {
        page: 1,
        size: 9999,
        sortBy: "SERV_TYPE_NAME",
        sortDirection: "asc",
        search: "",
      });

      // const total = response.totalRows || 0;
      // setTotalRows(total);

      const dataArray = Array.isArray(response.data) ? response.data : [response.data];
      // console.log(dataArray);
      setServiceType(dataArray);

      hasFetched.current = true; // ✅ tandai sudah fetch
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceType();
  }, []);

  const [formField, setFormField] = useState<CreatePricePlanParams>({
    priceplanname: "",
    priceplancode: "",
    servicetype: "",
    validperiodstart: moment().format("YYYY-MM-DD"),
    validperiodend: moment().format("YYYY-MM-DD"),
    applylevel: "",
    priceplantype: "",
    ispackage: "",
    packagemode: "",
    quantitylimitupper: "",
    quantitylimitlower: "",
    saleprice: "",
    rentprice: "",
    duplicateorder: "",
    effectivetype: "",
    ordertimelimitinput: "",
    ordertimelimitselect: "",
    automaticrenewal: "",
    agreementperiodinput: "",
    agreementperiodselect: "",
    agreementaffectiveinput: "",
    agreementaffectiveselect: "",
    remarks: "",
  });
  const [formTemp, setFormTemp] = useState<CreatePricePlanParams>({
    priceplanname: "",
    priceplancode: "",
    servicetype: "",
    validperiodstart: moment().format("YYYY-MM-DD"),
    validperiodend: moment().format("YYYY-MM-DD"),
    applylevel: "",
    priceplantype: "",
    ispackage: "",
    packagemode: "",
    quantitylimitupper: "",
    quantitylimitlower: "",
    saleprice: "",
    rentprice: "",
    duplicateorder: "",
    effectivetype: "",
    ordertimelimitinput: "",
    ordertimelimitselect: "",
    automaticrenewal: "",
    agreementperiodinput: "",
    agreementperiodselect: "",
    agreementaffectiveinput: "",
    agreementaffectiveselect: "",
    remarks: "",
  });

  const effectiveType = [
    { label: "Special Day", value: "A" },
    { label: "Instant", value: "B" },
    { label: "Next Day", value: "C" },
    { label: "Next Week", value: "D" },
    { label: "Next Month", value: "E" },
    { label: "Next Billing Cycle", value: "F" },
    { label: "The Cycle After Next Cycle", value: "G" },
    { label: "Special Time", value: "H" },
  ];

  useEffect(() => {
    const joinedEffType = selectedEffType.join("|");
    setFormField((prev) => ({
      ...prev,
      effectivetype: joinedEffType,
    }));
  }, [selectedEffType]);

  useEffect(() => {
    if (formField.ispackage !== "Y") {
      setFormField((prev) => ({
        ...prev,
        packagemode: packageModeOldValue,
      }));
    }
  }, [formField.ispackage]);

  useEffect(() => {
    if (formField.packagemode !== "B") {
      setFormField((prev) => ({
        ...prev,
        quantitylimitlower: quantitylimitlowerOldValue,
        quantitylimitupper: quantitylimitupperOldValue,
      }));
    }
  }, [formField.packagemode]);

  const { GetData, PutData } = useCallApi();
  const fetchDetailCategoryContent = async (offerId: any) => {
    if (!offerId) {
      console.error("OfferId is required");
      return;
    }

    // setIsLoading(true);
    // setError(null);

    const params = {
      pricePlanId: offerId,
      spId: 0,
    };

    try {
      const response = await GetData(`${API_URL_OFFER}/offer/price-plan/qry-price-plan-by-id`, params);

      // console.log("✅ Response from API:", response.data);

      if (response?.data?.applyLevel == "A") setApplyLevelDisabled("Account Price Plan");
      else if (response?.data?.applyLevel == "S") setApplyLevelDisabled("Subscription Price Plan");

      const mapEffType: Record<string, string> = {
        A: "Special Day",
        B: "Instant",
        C: "Next Day",
        D: "Next Week",
        E: "Next Month",
        F: "Next Billing Cycle",
        G: "The Cycle After Next Cycle",
        H: "Special Time",
      };

      if (!response?.data?.effType) setEffTypeDisabled("");
      else {
        const effTypes = response.data.effType.split("|");
        const effTypeLabels = effTypes.map((type: string) => mapEffType[type] || type);
        setEffTypeDisabled(effTypeLabels.join(" | "));
      }

      if (response?.status && response?.data) {
        let dataObject;
        if (Array.isArray(response.data)) {
          dataObject = response.data[0] || {};
        } else {
          dataObject = response.data;
        }

        setDetailContent(dataObject);
        setQuantitylimitlowerOldValue(dataObject.lowerLimit);
        setQuantitylimitupperOldValue(dataObject.upperLimit);
        setPackageModeOldValue(dataObject.groupType);
        setIsPackage(dataObject.isPackage);
        setIsRenewal(dataObject.autoContinueFlag);
        setOfferName(dataObject.offerName);
        return dataObject;
      } else {
        throw new Error("Data tidak ditemukan atau response tidak valid");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal fetch detail content";
      console.error("❌ Error fetching detail:", err);
      setError(errorMessage);
      toast.error(`Failed to fetch detail: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailCategoryContent(offerid);
  }, [offerid]);

  const fetchPricePlanType = async () => {
    try {
      const response = await GetData(`${API_URL_8080}/priceplan/all-type/list`, {});

      if (response?.status) {
        let dataArray: any[] = [];

        if (Array.isArray(response.data)) {
          dataArray = response.data; // langsung pakai array
        } else if (response.data) {
          dataArray = [response.data]; // bungkus jadi array
        }

        setPricePlanType(dataArray);
        return dataArray;
      } else {
        throw new Error("Data tidak ditemukan atau response tidak valid");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal fetch detail content";
      console.error("❌ Error fetching detail:", err);
      setError(errorMessage);
      toast.error(`${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPricePlanType();
  }, []);

  const countBelongInOfferGroup = async () => {
    try {
      const response = await GetData(`${API_URL_OFFER}/offer/common/qry-offer-group-mem-by-offer-id`, {
        offerId: offerid,
      });

      if (response?.status) {
        const result = response?.data;
        setLengthBelongInOfferGroup(result.length);
      } else {
        throw new Error("Data tidak ditemukan atau response tidak valid");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal fetch detail content";
      console.error("❌ Error fetching detail:", err);
      setError(errorMessage);
      toast.error(`${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    setAlert({ show: false, message: "" });

    // if (selectedEffType.length === 0) {
    //   newErrors["effectivetype"] = "Effective Type is required";
    //   isValid = false;
    // }

    if (!formField.priceplanname || formField.priceplanname.trim() === "") {
      newErrors["priceplanname"] = "Price Plan Name is required";
      isValid = false;
    }

    if (!formField.priceplancode || formField.priceplancode.trim() === "") {
      newErrors["priceplancode"] = "Price Plan Code is required";
      isValid = false;
    }

    // if (!formField.validperiodstart) {
    //   newErrors["validperiodstart"] = "Valid Period Start is required";
    //   isValid = false;
    // }

    // if (!formField.applylevel) {
    //   newErrors["applylevel"] = "Apply Level is required";
    //   isValid = false;
    // }

    // if (!formField.priceplantype) {
    //   newErrors["priceplantype"] = "Price Plan Type is required";
    //   isValid = false;
    // }

    setErrors(newErrors);

    if (!isValid) {
      toast.error("Please fill in all required fields");
    }

    return isValid;
  };

  useEffect(() => {
    countBelongInOfferGroup();
  }, []);

  const countBelongInPackage = async () => {
    const currentOfferId = offerid;

    if (!currentOfferId) {
      console.warn("❗ No offerId provided, skipping existing belongs load");
      return;
    }

    try {
      const response = await GetData(`${API_URL_OFFER}/offer/price-plan/qry-price-plan-join-package`, {
        pricePlanId: offerid,
      });

      setLengthBelongInPackage(response?.data?.length || 0);
    } catch (err) {
      console.error("❌ Error loading existing belongs:", err);
    }
  };

  useEffect(() => {
    if (offerid) {
      countBelongInPackage();
    }
  }, [offerid]);

  const handleAddFeature = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  useEffect(() => {
    if (detailContent) {
      setFormField({
        ...formField,
        priceplanname: detailContent.offerName ?? null,
        priceplancode: detailContent.offerCode ?? null,
        servicetype: detailContent.servType ?? null,
        validperiodstart: detailContent.effDate ?? null,
        validperiodend: detailContent.expDate ?? null,
        applylevel: detailContent.applyLevel ?? null,
        priceplantype: detailContent.pricePlanType ?? null,
        ispackage: detailContent.isPackage ?? null,
        packagemode: detailContent.groupType ?? null,
        quantitylimitlower: detailContent?.lowerLimit || null,
        quantitylimitupper: detailContent?.upperLimit || null,
        saleprice: detailContent?.saleListPrice || null,
        rentprice: detailContent?.rentListPrice || null,
        duplicateorder: detailContent?.duplicateFlag || null,
        effectivetype: detailContent?.effType || null,
        ordertimelimitinput: detailContent?.expOff || null,
        ordertimelimitselect: detailContent?.expTimeUnit || null,
        automaticrenewal: detailContent?.autoContinueFlag || null,
        agreementperiodinput: detailContent?.cycleQuantity || null,
        agreementperiodselect: detailContent?.timeUnit || null,
        agreementaffectiveinput: detailContent?.agreementEffType || null,
        agreementaffectiveselect: detailContent?.timeUnit || null,
        remarks: detailContent?.comments || null,
      });
      setFormTemp({
        ...formField,
        priceplanname: detailContent.offerName ?? null,
        priceplancode: detailContent.offerCode ?? null,
        servicetype: detailContent.servType ?? null,
        validperiodstart: detailContent.effDate ?? null,
        validperiodend: detailContent.expDate ?? null,
        applylevel: detailContent.applyLevel ?? null,
        priceplantype: detailContent.pricePlanType ?? null,
        ispackage: detailContent.isPackage ?? null,
        packagemode: detailContent.groupType ?? null,
        quantitylimitlower: detailContent?.lowerLimit || null,
        quantitylimitupper: detailContent?.upperLimit || null,
        saleprice: detailContent?.saleListPrice || null,
        rentprice: detailContent?.rentListPrice || null,
        duplicateorder: detailContent?.duplicateFlag || null,
        effectivetype: detailContent?.effType || null,
        ordertimelimitinput: detailContent?.expOff || null,
        ordertimelimitselect: detailContent?.expTimeUnit || null,
        automaticrenewal: detailContent?.autoContinueFlag || null,
        agreementperiodinput: detailContent?.cycleQuantity || null,
        agreementperiodselect: detailContent?.timeUnit || null,
        agreementaffectiveinput: detailContent?.agreementEffType || null,
        agreementaffectiveselect: detailContent?.timeUnit || null,
        remarks: detailContent?.comments || null,
      });
    }
  }, [detailContent]);

  useEffect(() => {
    if (formField.effectivetype) {
      setSelectedEffType(formField.effectivetype.split("|"));
    } else {
      setSelectedEffType([]);
    }
  }, [formField.effectivetype]);

  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  // helper aman
  const toLow = (v: any) => (v ?? "").toString().toLowerCase();
  const term = (search ?? "").toLowerCase();

  const filteredServiceTypes = serviceType.filter((item: any) => {
    const code = toLow(item?.networkTypeName);
    const name = toLow(item?.servTypeName);
    return code.includes(term) || name.includes(term);
  });

  // const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  //   const target = e.currentTarget;
  //   if (
  //     target.scrollTop + target.clientHeight >= target.scrollHeight - 5 &&
  //     !loading &&
  //     serviceType.length < totalRows
  //   ) {
  //     setPage((prev) => {
  //       const nextPage = prev + 1;
  //       fetchServiceType(nextPage);
  //       return nextPage;
  //     });
  //   }
  // };

  /* actions */
  const doUpdateData = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // console.table(formField)
      // console.log(catgid)

      if (!isEditing || !validateForm()) {
        return;
      }

      const response = await PutData(`${API_URL_OFFER}/offer/price-plan/mod-price-plan-offer`, {
        pricePlanId: detailContent.pricePlanId,
        offerName: formField.priceplanname,
        offerCode: formField.priceplancode,
        servType: formField.servicetype,
        effDate: formField.validperiodstart,
        expDate: formField.validperiodend,
        applyLevel: formField.applylevel,
        pricePlanType: formField.priceplantype,
        isPackage: formField.ispackage,
        groupType: formField.packagemode,
        lowerLimit: formField.quantitylimitlower,
        upperLimit: formField.quantitylimitupper,
        saleListPrice: Number(formField.saleprice),
        rentListPrice: Number(formField.rentprice),
        effType: formField.effectivetype,
        duplicateFlag: formField.duplicateorder,
        expOff: formField.ordertimelimitinput,
        expTimeUnit: formField.ordertimelimitselect,
        autoContinueFlag: formField.automaticrenewal,
        cycleQuantity: formField.agreementperiodinput,
        timeUnit: formField.agreementperiodselect,
        agreementEffType: formField.agreementaffectiveinput,
        comments: formField.remarks,
        offerType: "4",
        offerCatgId: String(catgid),
        spId: 0,
        offer: {
          offerId: offerid,
          offerName: formField.priceplanname,
          offerCode: formField.priceplancode,
          servType: formField.servicetype,
          effDate: formField.validperiodstart,
          expDate: formField.validperiodend,
          applyLevel: formField.applylevel,
          pricePlanType: formField.priceplantype,
          isPackage: formField.ispackage,
          groupType: formField.packagemode,
          lowerLimit: formField.quantitylimitlower,
          upperLimit: formField.quantitylimitupper,
          saleListPrice: Number(formField.saleprice),
          rentListPrice: Number(formField.rentprice),
          effType: formField.effectivetype,
          duplicateFlag: formField.duplicateorder,
          expOff: formField.ordertimelimitinput,
          expTimeUnit: formField.ordertimelimitselect,
          autoContinueFlag: formField.automaticrenewal,
          cycleQuantity: formField.agreementperiodinput,
          timeUnit: formField.agreementperiodselect,
          agreementEffType: formField.agreementaffectiveinput,
          comments: formField.remarks,
          offerType: "4",
          offerCatgId: String(catgid),
          spId: 0,
        },
      });

      if (response?.status) {
        // ✅ close dialog
        // onClose();
        setIsEditing(false);

        // ✅ show success toast
        toast.success("Success Update Price Plan Offer ");

        // ✅ refresh page / reload data
        // window.location.reload();
        onReload();

        await fetchDetailCategoryContent(offerid);

        fetchOfferData();

        const createActivity = {
          module: "Default",
          description: `Update Price Plan Offer => ${formField.priceplanname}`,
          action: "U",
        };
        doSaveLogActivity(createActivity);
      } else {
        setFormField(formTemp);
        toast.error(`${response?.data?.data?.error || "Failed to update data"}`);
        setAlert((prev) => ({
          ...prev,
          show: true,
          message: response?.message,
        }));
      }
    },
    [formField, isEditing, catgid, offerid, detailContent, onReload],
  );

  const tabs = [
    { id: "detail", label: "Product Detail" },
    { id: "feature", label: "Feature" },
    { id: "relationship", label: "Relationship" },
    { id: "sales-condition", label: "Sales Condition" },
    { id: "version", label: "Version" },
    {
      id: "belong-in-package",
      label: `Belong In Package (${lengthBelongInPackage})`,
    },
    {
      id: "belong-in-offer-group",
      label: `Belong In Offer Group (${lengthBelongInOfferGroup})`,
    },
    // { id: "belong-in-subscription-plan", label: "Belong In Subscription Plan" },
    { id: "rebate", label: "Rebate" },
    { id: "script-rule", label: "Script Rule" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "feature":
        return <FeatureTabContent category={catgid} rowData={rowData} />;
      case "relationship":
        return (
          <RelationshipTabContent
            rowData={detailContent}
            allowedRelationTypes={[
              // "Exchangeable",
              "Mutually Exclusive", //done
              "Dependent", //done
              "Dependent for automatic order", //done
              "Weakly Dependent", //done
            ]}
          />
        );
      case "sales-condition":
        return <SalesConditionTabContent offerId={offerid} rowData={rowData} category={offername} />;
      case "version":
        return <VersionContent offername={offername} offerid={offerid} applylevel={formField.applylevel} onOpenPortal={onOpenPortal} />;
      case "belong-in-package":
        return <BelongInPackage offername={offername} rowData={detailContent} countBelongInPackage={countBelongInPackage} offerid={offerid} />;
      case "belong-in-offer-group":
        return <BelongInOfferGroup category={offername} rowData={detailContent} countBelongInOfferGroup={countBelongInOfferGroup} />;
      case "belong-in-subscription-plan":
        return <BelongInSubscriptionPlan offername={offername} />;
      case "rebate":
        return <Rebate offerid={offerid} />;
      case "script-rule":
        return <ScriptRule offername={offername} />;
      default:
        return null;
    }
  };

  // Tutup dropdown custom kalau klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenServiceType(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (serviceType.length > 0 && detailContent?.servType) {
      const found = serviceType.find((item: any) => String(item.servType) === String(detailContent.servType));
      // console.log("found:", found);
      if (found) {
        setSelected(found);
      }
    }
  }, [serviceType, detailContent]);

  function SweetAlertForEdit() {
    if (lengthBelongInOfferGroup > 0) {
      Swal.fire({
        icon: "warning",
        title: "Cannot modify",
        text: "Cannot modify price plan type or service type because the price plan has offer groups.",
        confirmButtonColor: "#3085d6",
      });
    }
    return null; // nothing to render in DOM
  }

  // usage

  return (
    // <div className="h-full flex flex-col">
    <div className="flex flex-col px-6 pt-0 mb-0">
      <div className="flex items-center gap-3 p-4 border-b">
        <button onClick={onBack} className="btn btn-sm btn-icon btn-light">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">{offername.charAt(0)}</div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg">{offername || "-"}</span>
          </div>
        </div>
        <OfferStatusManageDialog isOpen={isDialogOpen} onClose={handleCloseDialog} />
        {/* {isEditing && <SweetAlertForEdit lengthBelongInOfferGroup={lengthBelongInOfferGroup} />} */}

        {onBack && (
          <div className="ml-auto flex items-center gap-2">
            {/* Offer Status Manage */}
            <Button variant="default" className="h-7.5" onClick={handleAddFeature}>
              Offer Status Manage
            </Button>

            {/* X */}
            <button
              onClick={() => {
                onBack();
              }}
              className="btn btn-sm btn-icon btn-light"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ml-4 ${activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Content */}
      {renderTabContent()}

      {/* Detail Tab Only */}
      {activeTab === "detail" && (
        <>
          <div className="" style={{ marginTop: "1rem" }}>
            <div className="min-h-screen bg-white p-4">
              <div className="border rounded shadow-sm">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <h1 className="mt-5 ml-5 text-2xl font-semibold">Price Plan Detail</h1>
                  </div>
                </div>

                {/* Form Section */}
                <form action="" onSubmit={doUpdateData} className="flex-1 overflow-auto">
                  <div>
                    <div className="flex min-h-full">
                      {/* Left Panel - Available Features */}
                      <div className="flex-1 border-r flex flex-col min-h-0">
                        <div className="flex-1 overflow-auto min-h-0">
                          {/* Form Section */}
                          <div className="w-full p-6">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="text-sm font-medium">
                                  <span className="text-red-500">*</span>Price Plan Name
                                </label>
                                <Input
                                  type="text"
                                  className={`input ${errors["priceplanname"] ? "border-red-500" : ""} w-full border rounded px-2 py-1 text-sm mt-1`}
                                  disabled={!isEditing}
                                  placeholder="Input Price Plan Name"
                                  value={formField.priceplanname || ""}
                                  onChange={({ target }) => {
                                    setFormField((prev) => ({
                                      ...prev,
                                      priceplanname: target.value === "" ? null : target.value,
                                    }));

                                    setErrors((prev) => ({
                                      ...prev,
                                      priceplaname: "",
                                    }));
                                  }}
                                />
                                {errors["priceplanname"] && <p className="text-red-500 text-xs mt-1">{errors["priceplanname"]}</p>}
                              </div>

                              <div>
                                <label className="text-sm font-medium">
                                  <span className="text-red-500">*</span>Price Plan Code
                                </label>
                                <Input
                                  type="text"
                                  className={`input ${errors["priceplancode"] ? "border-red-500" : ""} w-full border rounded px-2 py-1 text-sm mt-1`}
                                  disabled={!isEditing}
                                  placeholder="Input Price Plan Code"
                                  value={formField.priceplancode || ""}
                                  onChange={({ target }) => {
                                    setFormField((prev) => ({
                                      ...prev,
                                      priceplancode: target.value === "" ? null : target.value,
                                    }));

                                    setErrors((prev) => ({
                                      ...prev,
                                      priceplancode: "",
                                    }));
                                  }}
                                />
                                {errors["priceplancode"] && <p className="text-red-500 text-xs mt-1">{errors["priceplancode"]}</p>}
                              </div>

                              <div className="w-full relative" ref={dropdownRef}>
                                <label className="text-sm font-medium block mb-1">Service Type</label>

                                {/* Selected Box */}
                                <div
                                  className={`border rounded-lg px-3 py-2 text-sm flex justify-between items-center shadow-sm 
      ${!isEditing ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white cursor-pointer"}`}
                                  onClick={() => {
                                    if (isEditing) {
                                      setIsOpenServiceType(!isOpenServiceType);
                                    }
                                  }}
                                >
                                  <span className={selected ? "text-gray-800" : "text-gray-400"}>{selected ? `${selected.servTypeName} [${selected.networkTypeName}]` : "--- Please Select ---"}</span>
                                  <svg
                                    className={`w-4 h-4 ml-2 transform transition-transform ${isOpenServiceType ? "rotate-180" : ""} 
        ${!isEditing ? "text-gray-300" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>

                                {/* Dropdown List */}
                                {isOpenServiceType && isEditing && (
                                  <div className="absolute mt-1 w-full border rounded-lg bg-white shadow-lg z-20">
                                    {/* Search Box */}
                                    <div className="p-2">
                                      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search service type..." className="w-full border rounded px-2 py-1 text-sm" />
                                    </div>

                                    <div className="max-h-48 overflow-y-auto">
                                      {loading ? (
                                        <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                                      ) : filteredServiceTypes.length > 0 ? (
                                        filteredServiceTypes.map((item: any) => (
                                          <div
                                            key={item.servType}
                                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-100 
                ${selected?.servType === item.servType ? "bg-gray-100 font-medium" : ""}`}
                                            onClick={() => {
                                              if (lengthBelongInOfferGroup > 0) {
                                                // 🚨 Jangan ubah value, balikin ke lama
                                                SweetAlertForEdit();
                                                setIsOpenServiceType(false);
                                                return;
                                              }

                                              // ✅ Kalau tidak ada restriction
                                              setSelected(item);
                                              setFormField((prev: any) => ({
                                                ...prev,
                                                servicetype: item.servType,
                                              }));
                                              setIsOpenServiceType(false);
                                            }}
                                          >
                                            {`${item.servTypeName ?? ""} [${item.networkTypeName}]`}
                                          </div>
                                        ))
                                      ) : (
                                        <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  <span className="text-red-500">*</span>Valid Period
                                </label>
                                <div>
                                  {isEditing ? (
                                    <div className="flex space-x-4">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="date"
                                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm
               focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                          value={formField.validperiodstart ?? ""}
                                          onChange={(e) => {
                                            const newStart = e.target.value === "" ? null : e.target.value;
                                            if (formField.validperiodend && newStart && moment(newStart).isAfter(formField.validperiodend)) {
                                              toast.error("Start date cannot more than enddate");
                                              return;
                                            }
                                            setFormField((prev: any) => ({
                                              ...prev,
                                              validperiodstart: newStart,
                                            }));
                                          }}
                                        />

                                        <span>-</span>

                                        <input
                                          type="date"
                                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm
               focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                          value={formField.validperiodend ?? ""}
                                          onChange={(e) => {
                                            const newEnd = e.target.value === "" ? null : moment(e.target.value).format("YYYY-MM-DD");
                                            if (formField.validperiodstart && newEnd && moment(formField.validperiodstart).isAfter(newEnd)) {
                                              toast.error("Start date cannot more than enddate");
                                              return;
                                            }
                                            setFormField((prev: any) => ({
                                              ...prev,
                                              validperiodend: newEnd,
                                            }));
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex space-x-4">
                                      <Input type="text" className="w-full border rounded px-2 py-1 text-sm mt-1" disabled value={formField.validperiodstart || ""} />
                                      <span>-</span>
                                      <Input type="text" className="w-full border rounded px-2 py-1 text-sm mt-1" disabled value={formField.validperiodend || ""} />
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium">
                                  <span className="text-red-500">*</span>Apply Level
                                </label>
                                <div>
                                  {isEditing ? (
                                    <div>
                                      <Select
                                        onValueChange={(val) => {
                                          if (lengthBelongInOfferGroup > 0) {
                                            SweetAlertForEdit();
                                            // ⬇️ kembalikan lagi ke value sebelumnya
                                            setFormField((prev) => ({
                                              ...prev,
                                              applylevel: prev.applylevel,
                                            }));
                                            return;
                                          }
                                          setFormField((prev) => ({
                                            ...prev,
                                            applylevel: val === "" ? null : val,
                                          }));
                                        }}
                                        value={formField.applylevel || ""}
                                        disabled={!isEditing}
                                      >
                                        <SelectTrigger className="w-full border rounded px-2 py-1 text-sm mt-1">
                                          <SelectValue placeholder="--- Please Select ---" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="A">Account Price Plan</SelectItem>
                                          <SelectItem value="S">Subscription Price Plan</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  ) : (
                                    <div>
                                      <Input type="text" className="w-full border rounded px-2 py-1 text-sm mt-1" disabled value={applyLevelDisabled} />
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium">
                                  <span className="text-red-500">*</span> Price Plan Type
                                </label>
                                <Select
                                  onOpenChange={(open) => {
                                    if (open) setIsOpenServiceType(false); // ✅ kalau Select dibuka, tutup service type
                                  }}
                                  onValueChange={(val) => {
                                    if (lengthBelongInOfferGroup > 0) {
                                      SweetAlertForEdit();
                                      setFormField((prev) => ({
                                        ...prev,
                                        priceplantype: prev.priceplantype,
                                      }));
                                      return;
                                    }

                                    setFormField((prev) => ({
                                      ...prev,
                                      priceplantype: val,
                                    }));
                                  }}
                                  value={formField.priceplantype}
                                  disabled={!isEditing}
                                >
                                  <SelectTrigger className="w-full border rounded px-2 py-1 text-sm mt-1">
                                    <SelectValue placeholder="--- Please Select ---" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {formField.applylevel === "A"
                                      ? pricePlanType
                                          .filter((item: any) => item.id === "2" || item.id === "3")
                                          .map((item: any) => (
                                            <SelectItem key={item.id} value={item.id}>
                                              {item.pricePlanTypeName}
                                            </SelectItem>
                                          ))
                                      : pricePlanType.map((item: any) => (
                                          <SelectItem key={item.id} value={item.id}>
                                            {item.pricePlanTypeName}
                                          </SelectItem>
                                        ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Is Package</label>
                                <div className="flex space-x-4 mt-1">
                                  <label className="flex items-center space-x-2">
                                    <Input
                                      type="radio"
                                      name="isPackage"
                                      value="Y"
                                      checked={formField.ispackage === "Y"}
                                      onChange={({ target }) =>
                                        setFormField((prev) => ({
                                          ...prev,
                                          ispackage: target.value,
                                        }))
                                      }
                                    />
                                    <span>Yes</span>
                                  </label>
                                  <label className="flex items-center space-x-2">
                                    <Input
                                      type="radio"
                                      name="isPackage"
                                      value="N"
                                      checked={formField.ispackage === "N"}
                                      onChange={({ target }) =>
                                        setFormField((prev) => ({
                                          ...prev,
                                          ispackage: target.value,
                                        }))
                                      }
                                    />
                                    <span>No</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Order Rule Section */}
                          <h1 className="mt-5 ml-5 text-2xl font-semibold">Order Rule</h1>
                          <div className="w-full p-6">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="text-sm font-medium">Package Mode</label>
                                <Select
                                  onValueChange={(val) =>
                                    setFormField((prev) => ({
                                      ...prev,
                                      packagemode: val === "" ? null : val,
                                    }))
                                  }
                                  value={formField.packagemode ?? undefined}
                                  disabled={!isEditing || formField.ispackage !== "Y"}
                                >
                                  <SelectTrigger className="w-full border rounded px-2 py-1 text-sm mt-1">
                                    <SelectValue placeholder="--- Please Select ---" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="A">Single Select</SelectItem>
                                    <SelectItem value="B">Multi Select</SelectItem>
                                    <SelectItem value="C">Select All</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Quantity Limit</label>
                                <div className="flex space-x-4 mt-1">
                                  <Input
                                    className="input"
                                    type="number"
                                    placeholder="Quantity Limit Lower"
                                    autoComplete="off"
                                    value={formField.quantitylimitlower}
                                    onChange={({ target }) =>
                                      setFormField((prev) => ({
                                        ...prev,
                                        quantitylimitlower: target.value,
                                      }))
                                    }
                                    disabled={!isEditing || formField.packagemode !== "B"}
                                  />
                                  <span>-</span>
                                  <Input
                                    className="input"
                                    type="number"
                                    placeholder="Quantity Limit Upper"
                                    autoComplete="off"
                                    value={formField.quantitylimitupper}
                                    onChange={({ target }) =>
                                      setFormField((prev) => ({
                                        ...prev,
                                        quantitylimitupper: target.value,
                                      }))
                                    }
                                    disabled={!isEditing || formField.packagemode !== "B"}
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Sale Price</label>
                                <Input
                                  className="input"
                                  type="number"
                                  placeholder="Sale Price"
                                  autoComplete="off"
                                  value={formField.saleprice ?? ""}
                                  onChange={({ target }) =>
                                    setFormField((prev) => ({
                                      ...prev,
                                      saleprice: target.value === "" ? null : target.value,
                                    }))
                                  }
                                  disabled={!isEditing}
                                />
                              </div>

                              <div>
                                <label className="text-sm font-medium">Rent Price</label>
                                <Input
                                  className="input"
                                  type="number"
                                  placeholder="Rent Price"
                                  autoComplete="off"
                                  value={formField.rentprice ?? ""}
                                  onChange={({ target }) =>
                                    setFormField((prev) => ({
                                      ...prev,
                                      rentprice: target.value === "" ? null : target.value,
                                    }))
                                  }
                                  disabled={!isEditing}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Duplicate Order</label>
                                <Select
                                  onValueChange={(val) =>
                                    setFormField((prev) => ({
                                      ...prev,
                                      duplicateorder: val === "" ? null : val,
                                    }))
                                  }
                                  value={formField.duplicateorder ?? undefined}
                                  disabled={!isEditing}
                                >
                                  <SelectTrigger className="w-full border rounded px-2 py-1 text-sm mt-1">
                                    <SelectValue placeholder="--- Please Select ---" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="A">Don't Allow to Duplicate Order</SelectItem>
                                    <SelectItem value="B">Extend Effective period of original instance from sysdate</SelectItem>
                                    <SelectItem value="C">Add Offer Instance, Don't Change Old Instance</SelectItem>
                                    <SelectItem value="D">Add Offer Instance, Cancel Old Instance</SelectItem>
                                    <SelectItem value="E">Extend Effective period of original instance from ExpDate</SelectItem>
                                    <SelectItem value="F">Add Offer Instance, New Instance EffDate equal Old ExpDate</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <label className="text-sm font-medium">
                                  <span className="text-red-500">*</span>
                                  Effective Type
                                </label>

                                <div>
                                  {isEditing ? (
                                    <div>
                                      <Popover open={effTypeOpen} onOpenChange={setEffTypeOpen}>
                                        <PopoverTrigger asChild>
                                          <button type="button" className="w-full px-2 py-1 text-sm h-10 border border-gray-300 rounded-md flex items-center justify-between">
                                            <span className="truncate w-[85%] text-left">
                                              {selectedEffType.length === 0
                                                ? "Select Effective Type"
                                                : effectiveType
                                                    .filter((item) => selectedEffType.includes(item.value))
                                                    .map((item) => item.label)
                                                    .join(" | ")}
                                            </span>
                                            <MdKeyboardArrowDown className="h-4 w-4 opacity-50" />
                                          </button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-[520px]">
                                          <div className="flex flex-col gap-2">
                                            {effectiveType.map((item) => (
                                              <label key={item.value} className="flex items-center gap-2 text-md">
                                                <Checkbox
                                                  checked={selectedEffType.includes(item.value)}
                                                  onCheckedChange={(checked) => {
                                                    setSelectedEffType((prev) => {
                                                      let newValues = checked ? [...prev, item.value] : prev.filter((val) => val !== item.value);

                                                      // ✅ update ke formField
                                                      setFormField((prevForm) => ({
                                                        ...prevForm,
                                                        effectivetype: newValues.join("|"),
                                                      }));

                                                      return newValues;
                                                    });
                                                  }}
                                                />
                                                {item.label}
                                              </label>
                                            ))}
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  ) : (
                                    <div>
                                      <Input type="text" className="w-full border rounded px-2 py-1 text-sm mt-1" disabled value={effTypeDisabled} />
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Order Time Limit</label>
                                <div className="flex space-x-4 mt-1">
                                  <Input
                                    className="input"
                                    type="number"
                                    placeholder="Quantity Limit Upper"
                                    autoComplete="off"
                                    value={formField.ordertimelimitinput ?? ""}
                                    onChange={({ target }) =>
                                      setFormField((prev) => ({
                                        ...prev,
                                        ordertimelimitinput: target.value === "" ? null : target.value,
                                      }))
                                    }
                                    disabled={!isEditing}
                                  />
                                  <Select
                                    onValueChange={(val) =>
                                      setFormField((prev) => ({
                                        ...prev,
                                        ordertimelimitselect: val === "" ? null : val,
                                      }))
                                    }
                                    value={formField.ordertimelimitselect ?? undefined}
                                    disabled={!isEditing}
                                  >
                                    <SelectTrigger className="w-full border rounded px-2 py-1 text-sm mt-1">
                                      <SelectValue placeholder="--- Please Select ---" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Y">Year</SelectItem>
                                      <SelectItem value="M">Month</SelectItem>
                                      <SelectItem value="W">Week</SelectItem>
                                      <SelectItem value="D">Day</SelectItem>
                                      <SelectItem value="H">Hour</SelectItem>
                                      <SelectItem value="C">Billing Cycle</SelectItem>
                                      <SelectItem value="S">Exact Time</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Automatic Renewal</label>
                                <div className="flex space-x-4 mt-1">
                                  <label className="flex items-center space-x-2">
                                    <Input
                                      type="radio"
                                      name="autoRenewal"
                                      value="Y"
                                      checked={formField.automaticrenewal === "Y"}
                                      onChange={({ target }) =>
                                        setFormField((prev) => ({
                                          ...prev,
                                          automaticrenewal: target.value,
                                        }))
                                      }
                                    />
                                    <span>Yes</span>
                                  </label>
                                  <label className="flex items-center space-x-2">
                                    <Input
                                      type="radio"
                                      name="autoRenewal"
                                      value="N"
                                      checked={formField.automaticrenewal === "N"}
                                      onChange={({ target }) =>
                                        setFormField((prev) => ({
                                          ...prev,
                                          automaticrenewal: target.value,
                                        }))
                                      }
                                    />
                                    <span>No</span>
                                  </label>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Agreement Period</label>
                                <div className="flex space-x-4 mt-1">
                                  <Input
                                    className="input"
                                    type="number"
                                    placeholder="Agreement Period"
                                    autoComplete="off"
                                    value={formField.agreementperiodinput ?? ""}
                                    onChange={({ target }) =>
                                      setFormField((prev) => ({
                                        ...prev,
                                        agreementperiodinput: target.value === "" ? null : target.value,
                                      }))
                                    }
                                    disabled={!isEditing}
                                  />
                                  <Select
                                    onValueChange={(val) =>
                                      setFormField((prev) => ({
                                        ...prev,
                                        agreementperiodselect: val === "" ? null : val,
                                      }))
                                    }
                                    value={formField.agreementperiodselect ?? undefined}
                                    disabled={!isEditing}
                                  >
                                    <SelectTrigger className="w-full border rounded px-2 py-1 text-sm mt-1">
                                      <SelectValue placeholder="--- Please Select ---" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Y">Year</SelectItem>
                                      <SelectItem value="M">Month</SelectItem>
                                      <SelectItem value="W">Week</SelectItem>
                                      <SelectItem value="D">Day</SelectItem>
                                      <SelectItem value="H">Hour</SelectItem>
                                      <SelectItem value="C">Billing Cycle</SelectItem>
                                      <SelectItem value="S">Exact Time</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Agreement Affective Type</label>
                                <div className="flex space-x-4 mt-1">
                                  <Input
                                    className="input"
                                    type="text"
                                    placeholder="Agreement Affective Type"
                                    autoComplete="off"
                                    value={formField.agreementaffectiveinput ?? ""}
                                    onChange={({ target }) =>
                                      setFormField((prev) => ({
                                        ...prev,
                                        agreementaffectiveinput: target.value === "" ? null : target.value,
                                      }))
                                    }
                                    disabled={!isEditing}
                                  />
                                  <Select
                                    onValueChange={(val) =>
                                      setFormField((prev) => ({
                                        ...prev,
                                        agreementaffectiveselect: val === "" ? null : val,
                                      }))
                                    }
                                    value={formField.agreementaffectiveselect ?? undefined}
                                    disabled={!isEditing}
                                  >
                                    <SelectTrigger className="w-full border rounded px-2 py-1 text-sm mt-1">
                                      <SelectValue placeholder="--- Please Select ---" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="C">Next Day</SelectItem>
                                      <SelectItem value="E">Next Month</SelectItem>
                                      <SelectItem value="F">Next Billing Cycle</SelectItem>
                                      <SelectItem value="4">Today 0:00</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div>
                              <label className="text-sm font-medium">Remarks</label>
                              <Input
                                className="input"
                                type="text"
                                placeholder="Remarks"
                                autoComplete="off"
                                value={formField.remarks ?? ""}
                                onChange={({ target }) =>
                                  setFormField((prev) => ({
                                    ...prev,
                                    remarks: target.value === "" ? null : target.value,
                                  }))
                                }
                                disabled={!isEditing}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t flex justify-end items-center">
                      <div className="px-4 py-3 border-t flex justify-end items-center">
                        <div className="flex gap-2">
                          {" "}
                          {isEditing ? (
                            <Button className="bg-green-500 text-white text-sm px-4 py-1 rounded hover:bg-green-600">Save</Button>
                          ) : (
                            <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
                              <Button className="bg-blue-500 text-white text-sm px-4 py-1 rounded hover:bg-blue-600" onClick={() => setIsEditing(true)}>
                                Edit{" "}
                              </Button>
                            </AccessWrapper>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DetailContent;
