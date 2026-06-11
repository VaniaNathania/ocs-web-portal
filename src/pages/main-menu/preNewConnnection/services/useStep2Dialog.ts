import { useEffect, useMemo, useRef, useState } from "react";
import { BuildTreeSidebar, TreeNode } from "../blocks/BuildTreeSidebar";
import { BuildTreeMain, TreeNodeMain } from "../blocks/BuildTreeMain";
import { BuildFlattenMain } from "../blocks/BuildFlattenMain";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import { usePreNew } from "../hooks/context";
import { OfferAndSubsPlanByOfferCatgProps, OfferCatalogAllProps } from "../interface";

const API_URL = apiConfigOrder.order;

interface UseStep2DialogProps {
  onOk: (subsPlanId: number, offerId: number, offerName: string) => void;
}

const useStep2Dialog = ({ onOk }: UseStep2DialogProps) => {
  const { setTriggerOk, setForm } = usePreNew();
  const { GetData } = useCallApi();
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [expandedSidebar, setExpandedSidebar] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedItemMain, setSelectedItemMain] = useState<TreeNodeMain | null>(null);
  const [isSidebarLoading, setIsSidebarLoading] = useState<boolean>(false);
  const [isMainLoading, setIsMainLoading] = useState<boolean>(false);
  const [offerCatalogDatas, setOfferCatalogDatas] = useState<OfferCatalogAllProps[]>([]);
  const [subsPlanByOfferCatgDatas, setSubsPlanByOfferCatgDatas] = useState<OfferAndSubsPlanByOfferCatgProps[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showSuggestionsMain, setShowSuggestionsMain] = useState<boolean>(false);
  const wrapperRefMain = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState<string>("");
  const [searchMain, setSearchMain] = useState<string>("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRefMain.current && !wrapperRefMain.current.contains(event.target as Node)) {
        setShowSuggestionsMain(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowSuggestionsMain]);

  const flattenTree = (nodes: TreeNode[]) => {
    let result: TreeNode[] = [];

    nodes.forEach((node) => {
      result.push(node);

      if (node.children?.length) {
        result = result.concat(flattenTree(node.children));
      }
    });

    return result;
  };

  const fetchQryOfferCatalog = async () => {
    try {
      setIsSidebarLoading(true);
      const response = await GetData(`${API_URL}/api/order-entry/go-shop/qry-offer-catalog`, {});
      if (response?.data) {
        setOfferCatalogDatas(response.data);
        setSelectedId(response?.data[0]?.id);
      }
    } catch (err) {
      toast.error("Failed GetData!");
    } finally {
      setIsSidebarLoading(false);
    }
  };

  const fetchQrySubsPlanByOfferCatg = async (catgId: number, spId: number) => {
    try {
      setIsMainLoading(true);
      const response = await GetData(`${API_URL}/api/order-entry/common-service/qry-offer-and-subs-plan-by-offer-catg`, {
        catgId,
        spId,
        orgId: 1,
        areaId: 1,
        contactChannelId: 1,
      });
      if (response?.data) {
        setSubsPlanByOfferCatgDatas(response.data);
      }
    } catch (err) {
      toast.error("Failed GetData!");
    } finally {
      setIsMainLoading(false);
    }
  };

  const treeDataSidebar = useMemo(() => BuildTreeSidebar(offerCatalogDatas), [offerCatalogDatas]);

  const treeDataMain = useMemo(() => BuildTreeMain(subsPlanByOfferCatgDatas), [subsPlanByOfferCatgDatas]);

  const flattenData = useMemo(() => BuildFlattenMain(treeDataMain, expandedRows), [treeDataMain, expandedRows]);

  const flattenSearch = flattenTree(treeDataSidebar);

  const searchResult = flattenSearch.filter((item) => item.name?.toLowerCase().includes(search.toLowerCase()));

  const searchMainResult = flattenData.filter((item) => item.name.toLowerCase().includes(searchMain.toLowerCase()));

  useEffect(() => {
    if (!treeDataMain || treeDataMain.length === 0) return;

    const parentIds: number[] = [];

    const collectParents = (nodes: TreeNodeMain[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          parentIds.push(node.id);
          collectParents(node.children);
        }
      });
    };

    collectParents(treeDataMain);

    setExpandedRows(parentIds);
  }, [treeDataMain]);

  const handleToggleExpand = (id: string) => {
    setExpandedSidebar((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExpandOnly = (id: string) => {
    setExpandedSidebar((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const handleToggleExpandMain = (id: number) => {
    setExpandedRows((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSelectItem = (id: number) => {
    setSelectedId(id);
  };

  const handleItemMainClick = (item: TreeNodeMain) => {
    setSelectedItemMain(item);
    setForm((prev) => ({
      ...prev,
      selectedItemDialog: item,
    }));
  };

  const handleOk = async () => {
    if (!selectedItemMain || selectedItemMain.__level === 0) {
      toast.error("Please Select Offer!");
      return;
    }
    if (!selectedItemMain?.indepProdSpecId || !selectedItemMain?.id || !selectedItemMain?.name) return;
    const offerId = selectedItemMain.indepProdSpecId;
    const subsPlanId = selectedItemMain.id;
    const offerName = selectedItemMain.name;

    onOk(subsPlanId, offerId, offerName);
    setTriggerOk(true);
  };

  return {
    handleToggleExpand,
    handleToggleExpandMain,
    handleSelectItem,
    handleItemMainClick,
    handleOk,
    treeDataMain,
    treeDataSidebar,
    flattenData,
    expandedRows,
    expandedSidebar,
    selectedId,
    selectedItemMain,
    fetchQryOfferCatalog,
    fetchQrySubsPlanByOfferCatg,
    isMainLoading,
    isSidebarLoading,
    setSelectedItemMain,
    setExpandedRows,
    showSuggestions,
    setShowSuggestions,
    searchResult,
    search,
    setSearch,
    wrapperRef,
    handleExpandOnly,
    searchMain,
    setSearchMain,
    searchMainResult,
    showSuggestionsMain,
    setShowSuggestionsMain,
    wrapperRefMain,
  };
};

export default useStep2Dialog;
