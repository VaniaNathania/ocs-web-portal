import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useCallback, useState } from "react";
import { useAdviceTypeContext } from "../hooks/useAdviceTypeContext";

export interface domainProps {
  tableName: string;
  columnName: string;
  value: string;
  lookupName: string;
  comments: string;
  adviceCatg: string;
}

export const initialPropsDomain: domainProps = {
  tableName: "",
  columnName: "",
  value: "",
  lookupName: "",
  comments: "",
  adviceCatg: "",
};

export interface cascadeProps {
  adviceTypeSortId: number | null;
  parentAdviceTypeSortId: string;
  adviceTypeSortName: string;
  adviceCatg: string;
  spId: number | null;
}

export interface langProps {
  defLangId: number | null;
  stdCode: string;
  defLangName: string;
  comments: string;
  il8nCode: string;
}

export interface multiLangProps {
  adviceType: number;
  defLangId: number;
  msgDefine: string;
  spId: number | null;
  adviceTypeName: string;
  defLangName: string;
  subjectDefine: string;
}

export interface messageChannelProps {
  adviceChannel: string;
  adviceChannelName: string;
  comments: string;
}

export interface MacroListProps {
  macroId: number;
  macroScriptId: number;
  macroCode: string;
  macroKey: string;
  macroName: string;
  valueScript: string;
  comments: string;
  spId: null;
}

const API_URL_REF = apiConfigRef.ref;

const AdviceTypeAction = () => {
  const { GetData } = useCallApi();
  const { selectedContent } = useAdviceTypeContext();
  const [messageChannel, setMessageChannel] = useState<messageChannelProps[]>(
    [],
  );
  const [messageLoading, setMessageLoading] = useState(false);
  const [macroList, setMacroList] = useState<MacroListProps[]>([]);
  const [macroListLoading, setMacroListLoading] = useState(false);
  const [childrenSide, setChildrenSide] = useState<domainProps[]>([]);
  const [loadingChild, setLoadingChild] = useState(false);
  const [loadingSubChild, setLoadingSubChild] = useState(false);
  const [subChildrenSide, setSubChildrenSide] = useState<cascadeProps[]>([]);
  const [lang, setLang] = useState<langProps[]>([]);
  const [multiLang, setMultiLang] = useState<multiLangProps[]>([]);

  const fetchMessageChannel = useCallback(async () => {
    try {
      setMessageLoading(true);
      const response = await GetData(
        `${API_URL_REF}/api/advice-type/qry-advice-channel`,
        {},
      );
      const responseData = response.data;
      setMessageChannel(responseData);
      return responseData;
    } catch (error: any) {
      console.error("Error fetching message channel");
    } finally {
      setMessageLoading(false);
    }
  }, [GetData]);

  const fetchMacroList = useCallback(async () => {
    try {
      setMacroListLoading(true);
      const response = await GetData(
        `${API_URL_REF}/api/advice-type/qry-macro-list-all`,
        {},
      );
      const responseData = response.data;
      setMacroList(responseData);
      return responseData;
    } catch (error: any) {
      console.error("Error fetching macro list");
    } finally {
      setMacroListLoading(false);
    }
  }, [GetData]);

  const childrenSideBar = async () => {
    setLoadingChild(true);
    try {
      const response = await GetData(`${API_URL_REF}/api/common/qry-domain`, {
        tableName: "ADVICE_TYPE",
        columnName: "ADVICE_CATG",
      });
      const responseData = response.data;
      //  console.log("domain list :", responseData)
      setChildrenSide(responseData);
      return responseData;
    } catch (error: any) {
      console.error("Error fetching children side", error);
      return [];
    } finally {
      setLoadingChild(false);
    }
  };

  const subChildrenSidebar = useCallback(
    async (childValue: string) => {
      setLoadingSubChild(true);
      try {
        const response = await GetData(
          `${API_URL_REF}/api/advice-type/qry-advice-type-sort-cascade-by-catg`,
          {
            spId: 0,
            adviceCatg: childValue,
          },
        );
        const responseData = response.data;
        setSubChildrenSide(responseData);
        return responseData;
      } catch (error: any) {
        console.error("Error fetching sub children sidebar", error);
        return [];
      } finally {
        setLoadingSubChild(false);
      }
    },
    [GetData],
  );

  const fetchingLang = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/common/qry-def-lang`,
        {},
      );
      const responseData = response.data;
      setLang(responseData);
      return responseData;
    } catch (error: any) {
      console.error("Error fetching language", error);
      return [];
    }
  };

  const fetchingMultiLang = async (
    page: number = 0,
    limit: number = 10,
    sorting: any[] = [],
    filter: any[] = [],
  ) => {
    try {
      sorting =
        sorting.length == 0 ? [{ id: "DEF_LANG_ID", desc: false }] : sorting;
      // filter = filter.length == 0 ? {} : { defLangName: filter[0]?.value.toLowerCase()}

      const response = await GetData(
        `${API_URL_REF}/api/advice-type/qry-advice-type-lang-by-advice-type`,
        {
          page: page + 1,
          size: limit,
          sortBy: sorting[0].id,
          sortDirection: sorting[0].desc == false ? "ASC" : "DESC",
          adviceType: selectedContent?.adviceType,
          spId: 0,
        },
      );
      const responseData = response.data;
      setMultiLang(responseData);
      return responseData;
    } catch (error: any) {
      console.error("Error fetching multi language", error);
      return [];
    }
  };

  return {
    messageChannel,
    setMessageChannel,
    fetchMessageChannel,
    messageLoading,
    setMessageLoading,
    macroList,
    setMacroList,
    fetchMacroList,
    macroListLoading,
    setMacroListLoading,
    childrenSide,
    setChildrenSide,
    childrenSideBar,
    subChildrenSide,
    setSubChildrenSide,
    subChildrenSidebar,
    loadingChild,
    setLoadingChild,
    loadingSubChild,
    setLoadingSubChild,
    lang,
    setLang,
    fetchingLang,
    multiLang,
    setMultiLang,
    fetchingMultiLang,
  };
};

export default AdviceTypeAction;
