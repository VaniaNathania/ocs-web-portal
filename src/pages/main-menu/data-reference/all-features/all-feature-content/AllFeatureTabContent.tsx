import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { KeenIcon } from "@/components";
import { DataGridProvider, DataGridColumnHeader } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FeatureDetailView from "../all-feature-content/components/FeatureDetailView";
import FeatureEditForm from "../all-feature-content/components/FeatureEditForm";
import FeatureAddForm from "../all-feature-content/components/FeatureAddForm";
import FeatureDeleteDialog from "../all-feature-content/components/FeatureDeleteDialog";
import FeatureGroupDialog from "../all-feature-content/components/FeatureGroupDialog";
import { ListToolBarAllFeature } from "./blocks/ListToolBarAllFeature";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { useAllFeature } from "./hooks/context";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

export interface AllFeatureData {
  attrName: string;
  attrCode: string;
  inputType: string;
  attrId: number | null;
  attrType: string;
  objAttrId: string | null;
  csrVisible: string;
  instantiatable: string;
  configVisible: string;
  editable: string | null;
}

interface AllFeatureTabContentProps {
  rowData: any;
}

export interface ContactChannelList {
  contactChannelId: number;
  contactChannelName: string;
  attrId?: number;
}

interface driverAndLinkageProps {
  baseAttrId: number | null;
  attrValueId: number;
  valueMark: string;
  value: string;
  parentAttrValueId: number | null;
  parentAttrId: number | null;
  attrName: string;
  strAttrDriverList: string;
  strAttrValueLinkageList: string;
  spId: number | null;
  defaultValue: number | null;
}

interface InputType {
  inputType: string;
  inputTypeName: string;
  comments?: string;
}

interface DataType {
  dataType: string | null;
  dataTypeName: string;
}

interface ExpandedInputType {
  inputType: string;
  inputTypeName: string;
  dataType: string | null;
}

export interface AttrCatg {
  attrCatg: string;
  attrCatgName: string;
  comments: string | null;
}

type ModalMode = "detail" | "edit" | "add";

const API_URL_OFFER = apiConfigOffer.offer;

const AllFeatureTabContent: React.FC<AllFeatureTabContentProps> = ({
  rowData,
}) => {
  // State management
  const { menuPrivAccess } = useAllFeature();
  const [searchValue, setSearchValue] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<ModalMode>("detail");
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFeatureGroup, setShowFeatureGroup] = useState(false);

  const [detailData, setDetailData] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState<AllFeatureData | null>(
    null,
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedAttrId, setSelectedAttrId] = useState<number | null>(null);
  const { GetData } = useCallApi();
  const refreshGrid = () => setRefreshTrigger((prev) => prev + 1);
  // Filter states
  const [selectedContactChannel, setSelectedContactChannel] = useState<
    number[]
  >([]);

  // Data states
  const [dataType, setDataType] = useState<DataType[]>([]);
  const [inputTypeList, setInputTypeList] = useState<InputType[]>([]);
  const [contactChannelList, setContactChannelList] = useState<
    ContactChannelList[]
  >([]);
  const [attrCatg, setAttrCatg] = useState<AttrCatg[]>([]);
  const [driverAndLinkage, setDriverAndLinkage] = useState<
    driverAndLinkageProps[]
  >([]);
  const [contactChannelData, setContactChannelData] = useState<
    ContactChannelList[]
  >([]);
  const [attrCatgData, setAttrCatgData] = useState<AttrCatg[]>([]);
  const [mergedContactChannelData, setMergedContactChannelData] = useState<
    any[]
  >([]);
  const [mergedAttrCatgData, setMergedAttrCatgData] = useState<any[]>([]);

  const [backupFeature, setBackupFeature] = useState<AllFeatureData | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currentSorting, setCurrentSorting] = useState<any>([
    { id: "attrName", desc: false },
  ]);
  const isEditingMode = currentMode === "edit";
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [debounceSearch, setDebounceSearch] = useState<string>("");
  const [attrCatgFilter, setAttrCatgFilter] = useState<string>("");
  const [instantiatableValue, setInstantiatableValue] = useState<string>("");
  const [projectVisibleValue, setProjectVisibleValue] = useState<string>("");

  // Load feature details
  const loadDetailData = async (feature: AllFeatureData) => {
    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/attr/qry-attr-detail`,
        {
          baseAttrId: feature.attrId,
        },
      );

      if (response?.data) {
        setDetailData(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Detail API Error:", error);
      toast.error("Error GET Feature Detail data");
      return null;
    }
  };

  const loadFeatureDetails = async (feature: AllFeatureData) => {
    const detailApiData = await loadDetailData(feature);

    const combinedDetailData = {
      attrId: feature.attrId,
      attrType: feature.attrType ?? "1",
      attrCode: feature.attrCode ?? "",
      attrName: feature.attrName ?? "",
      csrVisible: feature.csrVisible ?? "",
      configVisible: feature.configVisible ?? "",
      instantiatable: feature.instantiatable ?? "",
      ...(detailApiData && {
        editable: detailApiData.editable ?? "",
        inputType: detailApiData.inputType,
        nullable: detailApiData.nullable ?? "",
        promptMsg: detailApiData.promptMsg ?? "",
        defaultValue: detailApiData.defaultValue ?? "",
        dataType: detailApiData.dataType,
        valueScript: detailApiData.valueScript ?? "",
        mask: detailApiData.mask ?? "",
        ruleScript: detailApiData.ruleScript ?? "",
        exceptionMessage: detailApiData.exceptionMessage ?? "",
        minValue: detailApiData.minValue ?? "",
        maxValue: detailApiData.maxValue ?? "",
        comments: detailApiData.comments ?? "",
      }),
    };

    setDetailData(combinedDetailData);
    // console.log(combinedDetailData, "AAAAAAAAAAAAAAAAAAAaa");
  };

  const fetchDriverAndLinkage = useCallback(
    async (attrId: number | null) => {
      if (!attrId) return;

      try {
        const response = await GetData(
          `${API_URL_OFFER}/offer/attr/qry-attr-driver-and-linkage/${attrId}`,
          {
            attrId,
          },
        );
        if (response.status) {
          setDriverAndLinkage(response.data);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error("Error get Data");
      }
    },
    [GetData],
  );

  const fetchApplyContactChannel = useCallback(
    async (attrId: number | null, spId: number) => {
      if (!attrId) return;

      try {
        const response = await GetData(
          `${API_URL_OFFER}/offer/attr/qry-attr-apply-channel`,
          {
            attrId,
            spId,
          },
        );
        if (response.status) {
          setContactChannelData(response.data);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error("Error get Data");
      }
    },
    [GetData],
  );

  const fetchApplyCatg = useCallback(
    async (attrId: number | null, spId: number) => {
      if (!attrId) return;

      try {
        const response = await GetData(
          `${API_URL_OFFER}/offer/attr/qry-attr-apply-catg`,
          {
            attrId,
            spId,
          },
        );
        if (response.status) {
          setAttrCatgData(response.data);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error("Error get Data");
      }
    },
    [GetData],
  );

  // Load data on component mount
  useEffect(() => {
    const fetchDataType = async () => {
      try {
        const response = await GetData(
          `${API_URL_OFFER}/offer/common/qry-data-type`,
          {},
        );
        if (response?.data && Array.isArray(response.data)) {
          setDataType(response.data);
        }
      } catch {
        toast.error("Error Get Data Type");
      }
    };

    const fetchInputTypeList = async () => {
      try {
        const response = await GetData(
          `${API_URL_OFFER}/offer/common/qry-input-type-list`,
          {},
        );
        if (response?.data && Array.isArray(response.data)) {
          setInputTypeList(response.data);
        }
      } catch {
        toast.error("Error Get Input Type List");
      }
    };

    const fetchContactChannelList = async () => {
      try {
        const response = await GetData(
          `${API_URL_OFFER}/offer/common/qry-contact-channel-list`,
          {},
        );
        if (response.status) {
          setContactChannelList(response.data);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error("Error get contact channel data");
      }
    };

    const fetchAttrCatg = async () => {
      try {
        const response = await GetData(
          `${API_URL_OFFER}/offer/attr/qry-attr-catg`,
          {},
        );
        if (response.status) {
          setAttrCatg(response.data);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error("Error get attr catg data");
      }
    };

    fetchInputTypeList();
    fetchDataType();
    fetchContactChannelList();
    fetchAttrCatg();
  }, []);

  useEffect(() => {
    if (selectedAttrId) {
      fetchDriverAndLinkage(selectedAttrId);
      fetchApplyContactChannel(selectedAttrId, 0);
      fetchApplyCatg(selectedAttrId, 0);
    }
  }, [
    selectedAttrId,
    fetchDriverAndLinkage,
    fetchApplyContactChannel,
    fetchApplyCatg,
  ]);

  useEffect(() => {
    if (contactChannelData.length > 0 && contactChannelList.length > 0) {
      const merged = contactChannelData.map((item) => {
        const matched = contactChannelList.find(
          (channel) => channel.contactChannelId === item.contactChannelId,
        );
        return {
          ...item,
          contactChannelName: matched ? matched.contactChannelName : null,
        };
      });
      setMergedContactChannelData(merged);
    } else {
      setMergedContactChannelData([]);
    }
  }, [contactChannelData, contactChannelList]);

  useEffect(() => {
    if (attrCatgData.length > 0 && attrCatg.length > 0) {
      const merged = attrCatgData.map((item) => {
        const matched = attrCatg.find(
          (catg) => catg.attrCatg === item.attrCatg,
        );
        return {
          ...item,
          attrCatgName: matched ? matched.attrCatgName : null,
        };
      });
      setMergedAttrCatgData(merged);
    } else {
      setMergedAttrCatgData([]);
    }
  }, [attrCatgData, attrCatg]);

  // Expanded input types
  const expandedInputTypes = useMemo(() => {
    const result: ExpandedInputType[] = [];

    inputTypeList.forEach((it) => {
      if (it.inputType !== "4") {
        result.push({
          inputType: it.inputType,
          inputTypeName: it.inputTypeName,
          dataType: null,
        });
      } else {
        dataType.forEach((dt) => {
          result.push({
            inputType: "4",
            inputTypeName: `${it.inputTypeName} - ${dt.dataTypeName}`,
            dataType: dt.dataType,
          });
        });
      }
    });

    return result;
  }, [inputTypeList, dataType]);

  // Mode handlers
  const handleEditMode = () => {
    setCurrentMode("edit");
  };

  const handleAddOnSuccess = async (newAttrId?: number) => {
    try {
      const response = await doGetAllFeatureData(
        currentPage,
        pageSize,
        currentSorting,
        [],
      );

      if (!response?.data || response.data.length === 0) {
        toast.error("Failed to load feature data after add");
        setCurrentMode("detail");
        return;
      }

      if (newAttrId) {
        const newFeature = response.data.find(
          (f: AllFeatureData) => f.attrId === newAttrId,
        );

        if (newFeature) {
          setSelectedFeature(newFeature);
          setSelectedAttrId(Number(newFeature.attrId));

          await loadFeatureDetails(newFeature);

          setCurrentMode("detail");
          setRefreshTrigger((prev) => prev + 1);
          return;
        }
      }

      // fallback
      const firstFeature = response.data[0];
      setSelectedFeature(firstFeature);
      setSelectedAttrId(Number(firstFeature.attrId));
      await loadFeatureDetails(firstFeature);

      setCurrentMode("detail");
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error in handleAddOnSuccess:", error);
      toast.error("Failed to load feature after add");
      setCurrentMode("detail");
    }
  };

  const handleEditOnSuccess = async () => {
    try {
      const response = await doGetAllFeatureData(
        currentPage,
        pageSize,
        currentSorting,
        [],
      );

      if (selectedFeature?.attrId && response.data) {
        const updatedFeature = response.data.find(
          (f: AllFeatureData) => f.attrId === selectedFeature.attrId,
        );

        if (updatedFeature) {
          setSelectedFeature(updatedFeature);
          setSelectedAttrId(Number(updatedFeature.attrId));

          await fetchDriverAndLinkage(updatedFeature.attrId);

          await fetchApplyCatg(updatedFeature.attrId, updatedFeature.spId);

          await loadFeatureDetails(updatedFeature);
        }
      }

      setCurrentMode("detail");
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    setCurrentMode("detail");

    if (currentMode === "add" && backupFeature) {
      setSelectedFeature(backupFeature);
      loadFeatureDetails(backupFeature);
    } else if (selectedFeature) {
      loadFeatureDetails(selectedFeature);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    setRefreshTrigger((prev) => prev + 1);
    const response = await doGetAllFeatureData(
      currentPage,
      pageSize,
      currentSorting,
      [],
    );
    if (response.data && response.data.length > 0) {
      const firstFeature = response.data[0];
      setSelectedFeature(firstFeature);
      await loadFeatureDetails(firstFeature);
      handleClearSearch();
    } else {
      setSelectedFeature(null);
      setDetailData(null);
    }

    setCurrentMode("detail");
  };

  const handleAddMode = () => {
    setBackupFeature(selectedFeature);
    setCurrentMode("add");
    setSelectedFeature(null);
    setDetailData(null);
  };

  // const handleClose = useCallback(() => {
  //   setSearchValue("");
  //   setCurrentMode("detail");
  //   setSelectedFeature(null);
  //   setDetailData(null);
  //   setMergedContactChannelData([]);
  //   setContactChannelData([]);
  //   setSelectedAttrId(null);
  //   // setFormData(initialFormData);
  //   setSelectedContactChannel([]);
  // }, []);

  const handleClearSearch = () => {
    setSearchValue("");
    setSearchResult([]);
    setDebounceSearch("");
    setShowSuggestions(false);
  };

  const handleFeatureSelect = async (feature: AllFeatureData) => {
    setSelectedFeature(feature);
    const attrId = Number(feature.attrId);
    setSelectedAttrId(attrId);
    await loadFeatureDetails(feature);
    setCurrentMode("detail");
  };

  const handleShowFeatureGroup = useCallback((open: boolean) => {
    setShowFeatureGroup(open);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      // console.log("search value: ", searchValue);
      setDebounceSearch(searchValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, [
    debounceSearch,
    attrCatgFilter,
    projectVisibleValue,
    instantiatableValue,
  ]);

  // Data grid handler
  const doGetAllFeatureData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      try {
        let sortBy = "ATTR_NAME";
        let sortDirection = "asc";

        if (sorting && sorting.length > 0) {
          const { id, desc } = sorting[0];
          switch (id) {
            case "attrName":
              sortBy = "ATTR_NAME";
              break;
            case "attrCode":
              sortBy = "ATTR_CODE";
              break;
            default:
              sortBy = "ATTR_NAME";
          }
          sortDirection = desc ? "desc" : "asc";
        }

        const response = await GetData(
          `${API_URL_OFFER}/offer/attr/qry-attr-list-by-catg`,
          {
            attrCatg: attrCatgFilter || null,
            search: debounceSearch || "",
            page: page,
            size: limit,
            sortBy: sortBy,
            sortDirection: sortDirection,

            ...(projectVisibleValue === "Y" && { projectVisibleY: "Y" }),
            ...(projectVisibleValue === "N" && { projectVisibleN: "N" }),
            ...(instantiatableValue === "Y" && { instantiatableY: "Y" }),
            ...(instantiatableValue === "N" && { instantiatableN: "N" }),
          },
        );

        if (response?.data && Array.isArray(response.data)) {
          // console.log("SEARCH RESULT DATA ON PARENT : ", response.data);
          setSearchResult(Array.isArray(response.data) ? response.data : []);
          if (!selectedFeature && response.data.length > 0) {
            const firstFeature = response.data[0];
            setSelectedFeature(firstFeature);
            await loadFeatureDetails(firstFeature);
          }

          return {
            data: response.data,
            totalCount: response.totalRows || 0,
          };
        } else {
          return {
            data: [],
            totalCount: 0,
          };
        }
      } catch (error) {
        console.error("API Error:", error);
        toast.error("Error loading feature data");
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [
      debounceSearch,
      selectedFeature,
      GetData,
      attrCatgFilter,
      instantiatableValue,
      projectVisibleValue,
    ],
  );

  // Table columns
  const columns = useMemo<ColumnDef<AllFeatureData>[]>(
    () => [
      {
        accessorFn: (row) => row.attrName,
        id: "attrName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className="text-gray-800"
            title="Feature Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const name = row.original.attrName;
          const isSelected =
            selectedFeature?.attrCode === row.original.attrCode;
          return (
            <div
              className={`text-gray-800 cursor-pointer p-2 rounded ${isSelected ? "bg-blue-100 font-semibold" : "hover:bg-gray-50"}`}
              onClick={() => handleFeatureSelect(row.original)}
            >
              {name}
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.attrCode,
        id: "attrCode",
        header: ({ column }) => (
          <DataGridColumnHeader
            className="text-gray-800"
            title="Feature Code"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const code = row.original.attrCode;
          const isSelected =
            selectedFeature?.attrCode === row.original.attrCode;
          return (
            <div
              className={`text-gray-800 cursor-pointer p-2 rounded ${isSelected ? "bg-blue-100 font-semibold" : "hover:bg-gray-50"}`}
              onClick={() => handleFeatureSelect(row.original)}
            >
              {code}
            </div>
          );
        },
      },
    ],
    [selectedFeature],
  );

  // Render content based on mode
  const renderContent = () => {
    switch (currentMode) {
      case "detail":
        return (
          <FeatureDetailView
            detailData={detailData}
            detailDriverAndLinkage={driverAndLinkage}
            detailContactChannel={mergedContactChannelData}
            detailAttrCatg={mergedAttrCatgData}
            inputTypeList={inputTypeList}
            dataType={dataType}
            onEdit={handleEditMode}
            onDelete={handleDeleteClick}
            selectedFeature={selectedFeature}
            rowData={rowData}
          />
        );
      case "edit":
        return (
          <FeatureEditForm
            detailDriverAndLinkage={driverAndLinkage}
            detailContactChannel={mergedContactChannelData}
            detailAttrCatg={mergedAttrCatgData}
            contactChannelList={contactChannelList}
            expandedInputTypes={expandedInputTypes}
            onSubmit={handleEditOnSuccess}
            detailData={detailData}
            onCancel={handleCancel}
            isAddMode={false}
            rowData={rowData}
            selectedFeature={selectedFeature}
            isEditingMode={currentMode === "edit"}
            attrCatgList={attrCatg}
          />
        );
      case "add":
        return (
          <FeatureAddForm
            contactChannelList={contactChannelList}
            expandedInputTypes={expandedInputTypes}
            onSubmit={handleAddOnSuccess}
            onCancel={handleCancel}
            rowData={rowData}
            attrCatgList={attrCatg}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="w-full flex flex-col p-0 overflow-hidden">
        <div className="flex gap-4 flex-1 min-h-0 p-4">
          {/* Left Panel - Feature List */}
          <div className="w-1/3 bg-white border border-gray-200 rounded shadow-sm flex flex-col min-h-0">
            {/* Header */}
            <div className="p-3 border-b">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-gray-800">
                  Main Features
                </span>
                <div className="flex items-center gap-2">
                  <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
                    <button
                      onClick={handleAddMode}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                      title="New"
                    >
                      +
                    </button>
                  </AccessWrapper>
                  <div className="relative">
                    <button
                      onClick={() => setShowGroupMenu(!showGroupMenu)}
                      className="bg-gray-100 px-2 py-1 rounded text-sm hover:bg-gray-200"
                    >
                      ...
                    </button>
                    {showGroupMenu && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded shadow-lg p-2 z-10">
                        <button onClick={() => handleShowFeatureGroup(true)}>
                          <span className="text-sm text-gray-700">
                            Feature Group
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <ListToolBarAllFeature
                contactChannelList={contactChannelList}
                searchResult={searchResult}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                showSuggestions={showSuggestions}
                onSuggestionsChange={setShowSuggestions}
                clearSearch={handleClearSearch}
                handleSelectedSearch={handleFeatureSelect}
                attrCatg={attrCatg}
                onAttrCatgChange={setAttrCatgFilter}
                onInstantiatableChange={setInstantiatableValue}
                onProjectVisibleChange={setProjectVisibleValue}
              />
            </div>

            {/* Grid Area */}
            <div className="flex-1 overflow-auto px-1">
              <DataGridProvider
                columns={columns}
                // ref={gridRef}
                pagination={{ size: 10 }}
                layout={{ card: false }}
                sorting={[{ id: "attrName", desc: false }]}
                serverSide={true}
                key={refreshTrigger}
                onFetchData={({
                  pageIndex,
                  pageSize,
                  sorting,
                  columnFilters,
                }) => {
                  setCurrentPage(pageIndex + 1);
                  setPageSize(pageSize);
                  setCurrentSorting(sorting);
                  return doGetAllFeatureData(
                    pageIndex + 1,
                    pageSize,
                    sorting,
                    columnFilters,
                  );
                }}
              />
            </div>
          </div>

          {/* Right Panel - Feature Details/Form */}
          <div className="w-2/3 bg-white border border-gray-200 rounded shadow-sm flex flex-col min-h-0">
            <div className="flex-1 p-3">{renderContent()}</div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <FeatureDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onSuccess={handleDelete}
        selectedFeature={selectedFeature}
      />

      <FeatureGroupDialog
        isOpen={showFeatureGroup}
        onClose={() => setShowFeatureGroup(false)}
      />
    </>
  );
};

export default AllFeatureTabContent;
