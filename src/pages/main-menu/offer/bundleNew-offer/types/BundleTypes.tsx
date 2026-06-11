import React, { SetStateAction } from "react";

export interface OfferQueryParams {
  offerCatgClass: "A";
  spId: number;
  method: string;
  offerCatgType: number;
  offerCatgId: number;
  search?: string;
  prodType?: string;
  servType?: string;
}

export interface BundleQueryParentParams {
  offerCatgClass: string | null;
  spId: number;
  method: "qryRootCatg";
  offerCatgType: string | number;
}

export interface categorySideBarProps {
  comment: string;
  effDate: string;
  offerCatgCode: string;
  offerCatgId: string;
  offerCatgName: string;
  offerCatgType: string;
  offerCatgClass: string;
  spId: number;
  cnt: number;
}

export interface BundleOfferChildParams {
  offerId: number;
  offerName: string;
  offerType: string | number;
  offerCode: number;
  subsCnt: number;
}

export interface BundleSubsPlanGrandChild {
  subsPlanId: number;
  subsPlanName: string;
  offerId: number;
  offerName: string;
  offerType: string | number;
  spId: number;
  isBundleFlag: boolean;
  indepProdSpecId: number;
  effDate: string;
  offerCode: number;
  parentCategoryId: number;
  subsCnt: number;
  saleType?: string;
  ValidPeriod?: string;
  agreementPeriod?: string | null;
  aggrementEffType: string;
  openSource: "sidebar" | "main";
}

export interface enrichedOfferData extends OfferBundParams {
  parentCategoryId: number;
  dataType: string;
  openSource: "sidebar" | "main";
}
export interface enrichedSubsPlanData extends BundleSubsPlanGrandChild {
  parentOffer: string;
  parentCategoryId: number;
  dataType: string;
  openSource: "sidebar" | "main";
}

export interface FormDataOfferBundle {
  offerId: number | null;
  offerType: string | number;
  offerName: string;
  remarks: string;
  offerCode: string;
  effDate: string;
  effType: string;
  expDate: string;
  prodType: string;
  spId: number;
  servType: string;
  paidFlag: string;
  offerCatgId: number;
  aggrementPeriod: number | null;
  aggrementPeriodUnit: string;
  aggrementEffType: string;
  parentCategoryId: number;
  subsCnt: number;
  automaticRenewal: string;
  lifecycleType: string | null;
}

export type FormDataApiParams = PaginationParams & {
  offerCatgId: number;
};

export interface DetailSubOfferMainPageProps {
  isOpen: boolean;
  subCategory: string;
  onBack: () => void;
  onClose?: () => void;
  rowData: enrichedOfferData;
  openSource: "main" | "sidebar";
}
export interface DetailSubsPlanCatgProps {
  isOpen: boolean;
  subCategory: string;
  onBack: () => void;
  onSuccess: () => void;
  onClose?: () => void;
  rowData: enrichedSubsPlanData;
  onUpdatePlanInSidebar: (updateSubsPlan: BundleSubsPlanGrandChild) => void;
}

export interface SalesCategoryMainProps {
  Open?: boolean;
  onClose?: () => void;
  type?: string;
  onSubmit?: () => void;
}

export interface FormDataBundleDetail {
  offerType: string | number;
  offerName: string;
  comments: string;
  offerCode: number;
  effDate: string;
  expDate: string;
  effType: string;
  prodType: string;
  spId: number;
  brandPricePlanId: string | undefined;
  servType: string;
  paidFlag: string;
  lifecycleType: string;
  offerCatgId: number;
  agreementperiodinput?: string | null;
  agreementperiodselect?: string | null;
}

export interface EditDetailSubsBundCatgProps {
  formDatas: FormDataOfferBundle;
  errors: Record<string, string>;
  SubmittEdit: boolean;
  serviceType: FormDataOfferBundle[];
  automaticRenewal: FormDataOfferBundle[];
  lifecycleType: FormDataBundleDetail[];
  selectEffType: string[];
  effTypeOpen: boolean;
  onInputChange: (field: string, value: FormDataOfferBundle) => void;
  onSubmitEdit: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
  setSelectEffType: React.Dispatch<SetStateAction<string[]>>;
  setEffTypeOpen: React.Dispatch<SetStateAction<boolean>>;
  rowData: FormDataOfferBundle;
}

export interface OfferBundParams
  extends FormDataOfferBundle,
    DatasDetailSubsPlanProps,
    DetailSubsPlanProps {}

export const SubsPlanTabsBundle = [
  { id: "detail", label: "Detail" },
  { id: "offer-group", label: "Offer Group" },
  { id: "feature", label: "Feature" },
  { id: "relationship", label: "Relationship" },
  { id: "sales-condition", label: "Sales Condition" },
  { id: "subscription-price", label: "Subscription Price" },
  { id: "bundle-member", label: "Bundle Member" },
  { id: "script-rule", label: "Script Rule" },
];

export const formSaleFlagSubsPlan = (saleFlagSubs: string) => {
  switch (saleFlagSubs) {
    case "0":
      return "Sold Unlimittedly";
    case "1":
      return "Sold Separately";
    case "2":
      return "Sold In Bundle";
    default:
      return "-";
  }
};
export const formBundAutoContFlag = (flagAuto: string) => {
  return flagAuto === "Y" ? "Yes" : flagAuto === "N" ? "No" : "-";
};

export const formBunProductLine = (prodLineBund: string) => {
  return prodLineBund === "F" ? "Fix" : prodLineBund === "M" ? "Mobile" : "-";
};

export const TimeUnitMapSubsPlan: Record<string, string> = {
  Y: "Year",
  M: "Month",
  W: "Week",
  D: "Day",
  H: "Hour",
  C: "Billing Cycle",
  S: "Exact Time",
};

export const effectiveTypeMapping: Record<string, string> = {
  "1": "Next Day",
  "2": "Next Month",
  "3": "Next Billing Cycle",
  "4": "Today 0:00",
};

export const formBundTimeUnit = (timeUnitBund: string) => {
  return TimeUnitMapSubsPlan[timeUnitBund] || timeUnitBund || "-";
};

export const formEffTypeBund = (effTypeBund: string) => {
  return effectiveTypeMapping[effTypeBund] || effTypeBund || "-";
};

export interface DatasDetailSubsPlanProps {
  offerType: string | number;
  offerName: string;
  comments: string;
  offerCode: string;
  effDate: string;
  expDate: string;
  effType: string;
  prodType: string;
  spId: number;
  saleFlag?: string;
  timeUnit: string | null;
  cycleQuantity: number | null;
  priority: number | null;
  renewal?: string;
  autoContinueFlag: string | null;
  agreementEffType: string | null;
  servType: string;
  paidFlag: string;
  lifecycleType: string | null;
  offerCatgId: number;
}

export const formBundDate = (dateStringBund: string | null) => {
  if (!dateStringBund) return "-";

  const date = new Date(dateStringBund);

  if (isNaN(date.getTime())) return "-";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export interface DetailSubsPlanProps {
  subsPlanId: number;
  indepProdSpecId: number;
  priority: number | null;
  effDate: string;
  expDate: string;
  saleFlag?: string;
  spId: number;
  isBundleFlag: string;
  subsPlanCode: string;
  subsPlanName: string;

  offerId: number | null;
  offerType: string | number;
  offerName: string;
  comments: string;
  offerCode: string;
  saleListPrice: number | null;
  rentListPrice: number | null;

  effType: string;
  autoContinueFlag: string | null;
  cycleQuantity: number | null;
  timeUnit: string | null;
  duplicateFlag: string | null;

  expOff: number | null;
  expTimeUnit: string | null;
  agreementEffType: string | null;
  prodType: string;
  createdDate?: string;

  offerVerId: number;

  state: string;
  refOfferVerId: number;

  lifecycleType: string | null;
  lifecyleFlag: string | null;
  staffJobId: number;
  actionState: string;
  checkPeriod: boolean;
}

export const initDetailSubsPlanProps: DetailSubsPlanProps = {
  subsPlanId: 0,
  indepProdSpecId: 0,
  priority: null,
  effDate: "",
  expDate: "",
  saleFlag: "",
  spId: 0,
  isBundleFlag: "N",
  subsPlanCode: "",
  subsPlanName: "",

  offerId: null,
  offerType: "7",
  offerName: "",
  comments: "",
  offerCode: "",
  saleListPrice: null,
  rentListPrice: null,

  effType: "",
  autoContinueFlag: null,
  cycleQuantity: null,
  timeUnit: null,
  duplicateFlag: null,

  expOff: null,
  expTimeUnit: null,
  agreementEffType: null,
  prodType: "",

  offerVerId: 0,
  state: "A",
  refOfferVerId: 0,

  lifecycleType: null,
  lifecyleFlag: null,
  staffJobId: 0,
  actionState: "NEW",
  checkPeriod: false,
};

export const reqFields = [
  { key: "offerCatgName", label: "Category Name" },
  { key: "offerCatgType", label: "Category Type" },
  { key: "offerCatgCode", label: "Category Code" },
  { key: "effDate", label: "Effective Date" },
];
export const reqFieldsBundDetail = [
  { key: "offer.offerName", label: "Bundle Name" },
  { key: "offer.offerCode", label: "Code" },
  { key: "offer.effDate", label: "Effective Date" },
  { key: "paidFlag", label: "Paid Flag" },
];

export const initStateAddSideBar = {
  offerCatgType: "2",
  offerCatgClass: "A",
  offerCatgName: "",
  comments: "",
  offerCatgCode: "",
  effDate: "",
  spId: 0,
};

export interface AddSideBarParamsApi {
  offerCatgType: string;
  offerCatgClass: string;
  offerCatgName: string;
  comments: string;
  offerCatgCode: string;
  effDate: string;
  spId: number;
}

export interface FormDatasAddBundDetail {
  offer: {
    offerType: string;
    offerName: string;
    comments: string;
    offerCode: number;
    effDate: string;
    expDate: string;
    effType: string;
    prodType: string;
    spId: number;
    brandPricePlanId?: string | undefined;
  };
  servType: string;
  paidFlag: string;
  lifecycleType: string;
  offerCatgId: number | null;
  prodType: string;
  agreementperiodinput?: string | null;
  agreementperiodselect?: string | null;
  automaticrenewal?: string | null;
}
export const initBundDetailAdd: FormDatasAddBundDetail = {
  offer: {
    offerType: "2",
    offerName: "",
    comments: "",
    offerCode: 0,
    effDate: "",
    expDate: "",
    effType: "",
    prodType: "",
    spId: 0,
    brandPricePlanId: "",
  },
  servType: "",
  paidFlag: "",
  lifecycleType: "",
  offerCatgId: null,
  prodType: "",
  agreementperiodinput: null,
  agreementperiodselect: null,
  automaticrenewal: null,
};

export interface lifeCycleTypeAddDetail {
  lifecycleType: number;
  lifecycleTypeName: string;
  comments: string;
  spId: number;
  extAttr: string;
}

export interface serviceTypeAddDetail {
  servType: number;
  servTypeName: string;
  networkType: string;
  catgType: string;
  comments: string;
  paidFlag: string;
  stdCode: number;
}

export interface FormFieldDatasDetailBund {
  agreementperiodinput?: string | null;
  agreementperiodselect?: string | null;
  automaticrenewal?: string | null;
}

 export const EffTypeDetailBundAdd = [
    { label: "Special Day", value: "A" },
    { label: "Instant", value: "B" },
    { label: "Next Day", value: "C" },
    { label: "Next Week", value: "D" },
    { label: "Next Month", value: "E" },
    { label: "Next Billing Cycle", value: "F" },
    { label: "The Cycle After Next Cycle", value: "G" },
    { label: "Special Time", value: "H" },
  ];
