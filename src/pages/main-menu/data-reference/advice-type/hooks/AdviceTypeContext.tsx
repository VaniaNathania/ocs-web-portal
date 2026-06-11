import { createContext, useCallback, useEffect, useState } from "react";
import AdviceTypeSidebar from "../components/AdviceTypeSidebar";
import AdviceTypeContent from "../components/AdviceTypeContent";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import AddDialog from "../blocks/AddDialog";
import TemplateDefinition from "../components/TemplateDefinitionAdviceType";
import SenderParameter from "../components/SenderParameterAdviceType";
import TemplateDefinitionTest from "../components/TemplateDefinitionTest";
import ParameterListContent from "../components/ParameterListContent";
import CopyContent from "../components/CopyContent";
import MoveContent from "../components/MoveContent";
import { fa } from "zod/v4/locales";
import DetailContent from "../components/DetailContent";
import DeleteDialogSidebar from "../blocks/DeleteDialogSidebar";
import DeleteDialog from "../blocks/DeleteDialog";
import TemplateDefinitionMulti from "../components/TemplateDefinitionMulti";
import { toast } from "sonner";
import KeyValueParam from "../components/KeyValueParam";
import { cascadeProps, domainProps } from "../action/AdviceTypeAction";
import {
  menuAccess,
  useRoleCheck,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";

export interface adviceChannelProps {
  adviceChannel: string;
  adviceChannelName: string;
  comments: string;
}

export interface adviceTypeLangProps {
  adviceType: number;
  defLangId: number;
  defLangName: string;
  msgDefine: string;
  spId: number;
  subjectDefine: string;
  adviceTypeName: string;
}

export interface adviceTypeContentProps {
  adviceType: number;
  adviceTypeName?: string;
  adviceChannel: string;
  adviceChannelName: string;
  adviceCatg: string;
  comments: string;
  msgDefine: string;
  disabled: string;
  effTime: string;
  expTime: string;
  stdCode: string;
  spId: number | null;
  priority: string;
  updateDate: string;
  delayTime: string;
  isHis: string;
  srcNbr: string;
  senderParam: Record<string, string>;
  adviceTypeSortId: string;
  subjectDefine: string;
  times: string;
  timeInterval: string;
  adviceParamCode: string;
  parentAdviceType: string;
  adviceTypeLangList: adviceTypeLangProps[];
}

export const initialPropsAdviceTypeContent: adviceTypeContentProps = {
  adviceType: 0,
  adviceTypeName: "",
  adviceChannel: "",
  adviceChannelName: "",
  adviceCatg: "",
  comments: "",
  msgDefine: "",
  disabled: "N",
  effTime: "",
  expTime: "",
  stdCode: "",
  spId: null,
  priority: "",
  updateDate: "",
  delayTime: "",
  isHis: "Y",
  srcNbr: "",
  senderParam: {},
  adviceTypeSortId: "",
  subjectDefine: "",
  times: "",
  timeInterval: "",
  adviceParamCode: "",
  parentAdviceType: "",
  adviceTypeLangList: [],
};

const API_URL_REF = apiConfigRef.ref;

interface ContextProps {
  dataTableContext: adviceTypeContentProps[];
  fetchingListContent: () => Promise<adviceTypeContentProps[]>;
  isLoadingList: boolean;
  setIsLoadingList: (value: boolean) => void;
  valueDetail: "add" | "view" | "edit";
  setValueDetail: (value: "add" | "view" | "edit") => void;
  contentDetail: "add" | "view" | "edit";
  setContentDetail: (value: "add" | "view" | "edit") => void;
  selectedParentSide: domainProps | null;
  setSelectedParentSide: (item: domainProps | null) => void;
  selectedChildrenSide: domainProps | null;
  setSelectedChildrenSide: (item: domainProps | null) => void;
  selectedSubChildrenSide: cascadeProps | null;
  setSelectedSubChildrenSide: (item: cascadeProps | null) => void;
  handleSelectParent: (parent: domainProps) => void;
  handleSelectChild: (child: domainProps) => void;
  handleSelectSubChild: (subChild: cascadeProps) => void;
  showAddView: boolean;
  setShowAddView: (show: boolean) => void;
  showTemplateDefinition: boolean;
  setShowTemplateDefinition: (show: boolean) => void;
  showSenderParamter: boolean;
  setShowSenderParameter: (show: boolean) => void;
  selectedMessageChannel: string | null;
  setSelectedMessageChannel: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  showTestTemplateDefinition: boolean;
  setShowTestTemplateDefinition: (show: boolean) => void;
  showParameterListContent: boolean;
  setShowParameterListContent: (show: boolean) => void;
  showCopyContent: boolean;
  setShowCopyContent: (show: boolean) => void;
  showMoveContent: boolean;
  setShowMoveContent: (show: boolean) => void;
  selectedMacroList: string[];
  setSelectedMacroList: React.Dispatch<React.SetStateAction<string[]>>;
  selectedParamList: string[];
  setSelectedParamList: React.Dispatch<React.SetStateAction<string[]>>;
  selectedContent: adviceTypeContentProps | null;
  setSelectedContent: React.Dispatch<
    React.SetStateAction<adviceTypeContentProps | null>
  >;
  handleSelectedContent: (item: adviceTypeContentProps) => void;
  showDetailContent: boolean;
  setShowDetailContent: (show: boolean) => void;
  reloadSubChildren: (subChild: string) => Promise<void>;
  subChildrenReloadKey: number;
  showDeleteSideBar: boolean;
  setShowDeleteSidebar: (show: boolean) => void;
  selectedParentAdviceType: string | null;
  setSelectedParentAdviceType: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  parentAdviceTypeOpen: boolean;
  setParentAdviceTypeOpen: (show: boolean) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  searchContent: string;
  setSearchContent: React.Dispatch<React.SetStateAction<string>>;
  appliedSearch: string;
  setAppliedSearch: React.Dispatch<React.SetStateAction<string>>;
  messageTemplate: string;
  setMessageTemplate: React.Dispatch<React.SetStateAction<string>>;
  messageTemplateLang: string;
  setMessageTemplateLang: React.Dispatch<React.SetStateAction<string>>;
  formData: adviceTypeContentProps;
  setFormData: React.Dispatch<React.SetStateAction<adviceTypeContentProps>>;
  isAddingData: boolean;
  setIsAddingData: (item: boolean) => void;
  isEditMode: boolean;
  setIsEditMode: (item: boolean) => void;
  showTemplateMulti: boolean;
  setShowTemplateMulti: (show: boolean) => void;
  templateDefinitionMode: "addDialog" | "addLang";
  setTemplateDefinitionMode: (value: "addDialog" | "addLang") => void;
  adviceTypeLangList: adviceTypeLangProps[];
  setAdviceTypeLangList: React.Dispatch<
    React.SetStateAction<adviceTypeLangProps[]>
  >;
  selectedLangData: { defLangId: number; defLangName: string } | null;
  setSelectedLangData: React.Dispatch<
    React.SetStateAction<{ defLangId: number; defLangName: string } | null>
  >;
  selectedLangId: string;
  setSelectedLangId: React.Dispatch<React.SetStateAction<string>>;
  templateDefinitionLang: string;
  setTemplateDefinitionLang: React.Dispatch<React.SetStateAction<string>>;
  deleteAdviceTypeLang: (defLangId: number) => void;
  showKeyValueParam: boolean;
  setShowKeyValueParam: (show: boolean) => void;
  paramListValue: Record<string, string>;
  setParamListValue: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  macroListValue: Record<string, string>;
  setMacroListValue: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  titleParam: string;
  setTitleParam: React.Dispatch<React.SetStateAction<string>>;
  compileEmailMode: "text" | "html";
  setCompileEmailMode: (value: "text" | "html") => void;
  emailContent: string;
  setEmailContent: React.Dispatch<React.SetStateAction<string>>;
  dynamicParams: string[];
  setDynamicParams: React.Dispatch<React.SetStateAction<string[]>>;
  menuPrivAccess: menuAccess;
}

const InitialProps: ContextProps = {
  dataTableContext: [],
  fetchingListContent: async (): Promise<adviceTypeContentProps[]> => [],
  isLoadingList: false,
  setIsLoadingList: () => {},
  valueDetail: "view",
  setValueDetail: () => {},
  contentDetail: "view",
  setContentDetail: () => {},
  selectedParentSide: null,
  setSelectedParentSide: () => {},
  selectedChildrenSide: null,
  setSelectedChildrenSide: () => {},
  selectedSubChildrenSide: null,
  setSelectedSubChildrenSide: () => {},
  handleSelectParent: () => {},
  handleSelectChild: () => {},
  handleSelectSubChild: () => {},
  showAddView: false,
  setShowAddView: () => {},
  showTemplateDefinition: false,
  setShowTemplateDefinition: () => {},
  showSenderParamter: false,
  setShowSenderParameter: () => {},
  selectedMessageChannel: null,
  setSelectedMessageChannel: () => {},
  showTestTemplateDefinition: false,
  setShowTestTemplateDefinition: () => {},
  showParameterListContent: false,
  setShowParameterListContent: () => {},
  showCopyContent: false,
  setShowCopyContent: () => {},
  showMoveContent: false,
  setShowMoveContent: () => {},
  selectedMacroList: [],
  setSelectedMacroList: () => {},
  selectedParamList: [],
  setSelectedParamList: () => {},
  selectedContent: null,
  setSelectedContent: () => {},
  handleSelectedContent: () => {},
  showDetailContent: false,
  setShowDetailContent: () => {},
  reloadSubChildren: async () => {},
  subChildrenReloadKey: 0,
  showDeleteSideBar: false,
  setShowDeleteSidebar: () => {},
  selectedParentAdviceType: null,
  setSelectedParentAdviceType: () => {},
  parentAdviceTypeOpen: false,
  setParentAdviceTypeOpen: () => {},
  showDeleteDialog: false,
  setShowDeleteDialog: () => {},
  searchContent: "",
  setSearchContent: () => {},
  appliedSearch: "",
  setAppliedSearch: () => {},
  messageTemplate: "",
  setMessageTemplate: () => {},
  messageTemplateLang: "",
  setMessageTemplateLang: () => {},
  formData: initialPropsAdviceTypeContent,
  setFormData: () => {},
  isAddingData: false,
  setIsAddingData: () => {},
  isEditMode: false,
  setIsEditMode: () => {},
  showTemplateMulti: false,
  setShowTemplateMulti: () => {},
  templateDefinitionMode: "addDialog",
  setTemplateDefinitionMode: () => {},
  adviceTypeLangList: [],
  setAdviceTypeLangList: () => {},
  selectedLangData: null,
  setSelectedLangData: () => {},
  selectedLangId: "",
  setSelectedLangId: () => {},
  templateDefinitionLang: "",
  setTemplateDefinitionLang: () => {},
  deleteAdviceTypeLang: () => {},
  showKeyValueParam: false,
  setShowKeyValueParam: () => {},
  paramListValue: {},
  setParamListValue: () => {},
  macroListValue: {},
  setMacroListValue: () => {},
  titleParam: "",
  setTitleParam: () => {},
  compileEmailMode: "text",
  setCompileEmailMode: () => {},
  emailContent: "",
  setEmailContent: () => {},
  dynamicParams: [],
  setDynamicParams: () => {},
  menuPrivAccess: {
    addStatus: false,
    editStatus: false,
    deleteStatus: false,
    readStatus: false,
  },
};

const AdviceTypeListContext = createContext<ContextProps>(InitialProps);

const AdviceTypeContextListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { GetData } = useCallApi();
  const { checkMenusPriv } = useRoleCheck();

  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv(
      "/main-menu/data-reference/advice-type/AdviceTypePage",
      "addStatus",
    ),
    deleteStatus: checkMenusPriv(
      "/main-menu/data-reference/advice-type/AdviceTypePage",
      "deleteStatus",
    ),
    editStatus: checkMenusPriv(
      "/main-menu/data-reference/advice-type/AdviceTypePage",
      "editStatus",
    ),
    readStatus: checkMenusPriv(
      "/main-menu/data-reference/advice-type/AdviceTypePage",
      "readStatus",
    ),
  };
  const [valueDetail, setValueDetail] = useState<"view" | "add" | "edit">(
    "view",
  );
  const [contentDetail, setContentDetail] = useState<"view" | "add" | "edit">(
    "view",
  );
  const [dataTableContext, setDataTableContext] = useState<
    adviceTypeContentProps[]
  >([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [selectedParentSide, setSelectedParentSide] =
    useState<domainProps | null>(null);
  const [selectedChildrenSide, setSelectedChildrenSide] =
    useState<domainProps | null>(null);
  const [selectedSubChildrenSide, setSelectedSubChildrenSide] =
    useState<cascadeProps | null>(null);
  const [showAddView, setShowAddView] = useState(false);
  const [showTemplateDefinition, setShowTemplateDefinition] = useState(false);
  const [showSenderParamter, setShowSenderParameter] = useState(false);
  const [selectedMessageChannel, setSelectedMessageChannel] = useState<
    string | null
  >(null);
  const [showTestTemplateDefinition, setShowTestTemplateDefinition] =
    useState(false);
  const [showParameterListContent, setShowParameterListContent] =
    useState(false);
  const [showCopyContent, setShowCopyContent] = useState(false);
  const [showMoveContent, setShowMoveContent] = useState(false);
  const [selectedMacroList, setSelectedMacroList] = useState<string[]>([]);
  const [selectedParamList, setSelectedParamList] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] =
    useState<adviceTypeContentProps | null>(null);
  const [showDetailContent, setShowDetailContent] = useState(false);
  const [subChildrenReloadKey, setSubChildrenReloadKey] = useState(0);
  const [showDeleteSideBar, setShowDeleteSidebar] = useState(false);
  const [selectedParentAdviceType, setSelectedParentAdviceType] = useState<
    string | null
  >(null);
  const [parentAdviceTypeOpen, setParentAdviceTypeOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchContent, setSearchContent] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [messageTemplateLang, setMessageTemplateLang] = useState("");
  const [formData, setFormData] = useState<adviceTypeContentProps>(
    initialPropsAdviceTypeContent,
  );
  const [appliedSearch, setAppliedSearch] = useState("");
  const [isAddingData, setIsAddingData] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showTemplateMulti, setShowTemplateMulti] = useState(false);
  const [templateDefinitionMode, setTemplateDefinitionMode] = useState<
    "addDialog" | "addLang"
  >("addDialog");
  const [adviceTypeLangList, setAdviceTypeLangList] = useState<
    adviceTypeLangProps[]
  >([]);
  const [selectedLangData, setSelectedLangData] = useState<{
    defLangId: number;
    defLangName: string;
  } | null>(null);
  const [selectedLangId, setSelectedLangId] = useState("");
  const [templateDefinitionLang, setTemplateDefinitionLang] = useState("");
  const [showKeyValueParam, setShowKeyValueParam] = useState(false);
  const [paramListValue, setParamListValue] = useState<Record<string, string>>(
    {},
  );
  const [macroListValue, setMacroListValue] = useState<Record<string, string>>(
    {},
  );
  const [titleParam, setTitleParam] = useState("");
  const [compileEmailMode, setCompileEmailMode] = useState<"text" | "html">(
    "text",
  );
  const [emailContent, setEmailContent] = useState("");
  const [dynamicParams, setDynamicParams] = useState<string[]>([]);

  //delete local storage
  const deleteAdviceTypeLang = (defLangId: number) => {
    setAdviceTypeLangList((prev) => {
      const updatedList = prev.filter((item) => item.defLangId !== defLangId);

      return updatedList;
    });

    setSelectedLangData(null);
    setSelectedLangId("");
    setTemplateDefinitionLang("");
  };

  const reloadSubChildren = useCallback(async (childValue: string) => {
    setSelectedChildrenSide((prev: any) => {
      if (!prev) {
        return {
          value: childValue,
        };
      }

      // Jika prev ada, update value-nya
      return {
        ...prev,
        value: childValue,
      };
    });

    // Increment key untuk trigger re-fetch
    setSubChildrenReloadKey((prev) => {
      return prev + 1;
    });
  }, []);

  const handleSelectParent = (parent: domainProps) => {
    setSelectedParentSide(parent);
  };

  const handleSelectChild = (child: domainProps) => {
    setSelectedChildrenSide(child);
  };

  const handleSelectSubChild = (subChild: cascadeProps) => {
    setSelectedSubChildrenSide(subChild);
  };

  const handleSelectedContent = (item: adviceTypeContentProps) => {
    setSelectedContent(item);
  };

  const fetchingListContent = useCallback(async (): Promise<
    adviceTypeContentProps[]
  > => {
    setIsLoadingList(true);

    const payload: any = {
      spId: 0,
    };

    if (selectedChildrenSide && !parentAdviceTypeOpen) {
      payload.adviceCatg = selectedChildrenSide.value;
      // payload.adviceTypeSortId = 0;
    }

    if (selectedSubChildrenSide && !parentAdviceTypeOpen) {
      payload.adviceCatg = selectedSubChildrenSide.adviceCatg;
      payload.adviceTypeSortId = selectedSubChildrenSide.adviceTypeSortId;
    }

    try {
      const response = await GetData(
        `${API_URL_REF}/api/advice-type/qry-advice-type`,
        payload,
      );
      //  console.log("Response list:", response);
      // console.log("Data list:", response?.data);
      const responseData = response.data ?? [];
      setDataTableContext(responseData);
      return responseData;
    } catch (error) {
      console.error("Error fetching doGetListDataContext");
      toast.error("Error fetching data. Please check your connection!");
      return [];
    } finally {
      setIsLoadingList(false);
    }
  }, [
    GetData,
    selectedChildrenSide,
    selectedSubChildrenSide,
    parentAdviceTypeOpen,
  ]);

  useEffect(() => {
    fetchingListContent();
  }, [fetchingListContent]);

  return (
    <AdviceTypeListContext.Provider
      value={{
        dataTableContext,
        fetchingListContent,
        isLoadingList,
        setIsLoadingList,
        valueDetail,
        setValueDetail,
        contentDetail,
        setContentDetail,
        selectedParentSide,
        setSelectedParentSide,
        selectedChildrenSide,
        setSelectedChildrenSide,
        selectedSubChildrenSide,
        setSelectedSubChildrenSide,
        handleSelectParent,
        handleSelectChild,
        handleSelectSubChild,
        showAddView,
        setShowAddView,
        showTemplateDefinition,
        setShowTemplateDefinition,
        showSenderParamter,
        setShowSenderParameter,
        selectedMessageChannel,
        setSelectedMessageChannel,
        showTestTemplateDefinition,
        setShowTestTemplateDefinition,
        showParameterListContent,
        setShowParameterListContent,
        showCopyContent,
        setShowCopyContent,
        showMoveContent,
        setShowMoveContent,
        selectedMacroList,
        setSelectedMacroList,
        selectedParamList,
        setSelectedParamList,
        selectedContent,
        setSelectedContent,
        handleSelectedContent,
        showDetailContent,
        setShowDetailContent,
        reloadSubChildren,
        subChildrenReloadKey,
        showDeleteSideBar,
        setShowDeleteSidebar,
        selectedParentAdviceType,
        setSelectedParentAdviceType,
        parentAdviceTypeOpen,
        setParentAdviceTypeOpen,
        showDeleteDialog,
        setShowDeleteDialog,
        searchContent,
        setSearchContent,
        appliedSearch,
        setAppliedSearch,
        messageTemplate,
        setMessageTemplate,
        messageTemplateLang,
        setMessageTemplateLang,
        formData,
        setFormData,
        isAddingData,
        setIsAddingData,
        isEditMode,
        setIsEditMode,
        showTemplateMulti,
        setShowTemplateMulti,
        templateDefinitionMode,
        setTemplateDefinitionMode,
        adviceTypeLangList,
        setAdviceTypeLangList,
        selectedLangData,
        setSelectedLangData,
        selectedLangId,
        setSelectedLangId,
        templateDefinitionLang,
        setTemplateDefinitionLang,
        deleteAdviceTypeLang,
        showKeyValueParam,
        setShowKeyValueParam,
        paramListValue,
        setParamListValue,
        macroListValue,
        setMacroListValue,
        titleParam,
        setTitleParam,
        compileEmailMode,
        setCompileEmailMode,
        emailContent,
        setEmailContent,
        dynamicParams,
        setDynamicParams,
        menuPrivAccess,
      }}
    >
      {showAddView ? (
        <AddDialog />
      ) : showDetailContent ? (
        <DetailContent />
      ) : (
        <div className="flex flex-1 h-[calc(100vh-4rem)] mt-3 mx-3 gap-2 overflow-hidden">
          <AdviceTypeSidebar />
          <AdviceTypeContent />
        </div>
      )}

      <TemplateDefinition />
      <TemplateDefinitionTest />
      <SenderParameter />
      <ParameterListContent />
      <CopyContent />
      <MoveContent />
      <DeleteDialogSidebar />
      <DeleteDialog />
      <TemplateDefinitionMulti />
      <KeyValueParam />
    </AdviceTypeListContext.Provider>
  );
};

export { AdviceTypeListContext, AdviceTypeContextListProvider };
