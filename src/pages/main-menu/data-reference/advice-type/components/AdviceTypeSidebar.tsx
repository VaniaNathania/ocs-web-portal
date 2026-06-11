import AdviceTypeDetailSidebar from "./AdviceTypeDetailSidebar";
import { useCallback, useEffect, useState } from "react";
import { KeenIcon } from "@/components";
import { Loading } from "@/components/common/Loading";
import { useAdviceTypeContext } from "../hooks/useAdviceTypeContext";
import AdviceTypeAction from "../action/AdviceTypeAction";

export const parentData: any = {
  value: "ALL",
  lookupName: "ALL",
  comments: "",
};

const AdviceTypeSidebar = () => {
  const {
    handleSelectParent,
    handleSelectChild,
    handleSelectSubChild,
    selectedParentSide,
    setSelectedParentSide,
    selectedChildrenSide,
    setSelectedChildrenSide,
    selectedSubChildrenSide,
    setSelectedSubChildrenSide,
    subChildrenReloadKey,
    setSelectedContent,
    isAddingData,
  } = useAdviceTypeContext();
  const {
    childrenSide,
    setChildrenSide,
    subChildrenSide,
    setSubChildrenSide,
    childrenSideBar,
    subChildrenSidebar,
    loadingChild,
    loadingSubChild,
  } = AdviceTypeAction();
  const [parentExpand, setParentExpand] = useState(false);
  const [expandedChildValue, setExpandedChildValue] = useState<string | null>(
    null,
  );

  const toggleExpandParent = () => {
    setParentExpand((prev) => {
      const newData = !prev;
      if (!newData) {
        setChildrenSide([]);
        setSelectedChildrenSide(null);
        setExpandedChildValue(null);
        setSubChildrenSide([]);
      }
      return newData;
    });
  };

  const toggleExpandChildren = (childValue: string) => {
    setExpandedChildValue((prev) => {
      if (prev === childValue) {
        setSubChildrenSide([]);
        return null;
      }
      return childValue;
    });
  };

  useEffect(() => {
    setParentExpand(true);
    handleSelectParent(parentData as any);
  }, []);

  useEffect(() => {
    if (parentExpand) {
      childrenSideBar();
    }
  }, [parentExpand]);

  useEffect(() => {
    if (!isAddingData && selectedChildrenSide) {
      setSelectedContent(null);
    }
  }, [selectedChildrenSide?.value]);

  useEffect(() => {
    if (!isAddingData && selectedSubChildrenSide) {
      setSelectedContent(null);
    }
  }, [selectedSubChildrenSide?.adviceTypeSortId]);

  useEffect(() => {
    if (!isAddingData && selectedParentSide) {
      setSelectedContent(null);
    }
  }, [selectedParentSide?.value]);

  useEffect(() => {
    if (
      !selectedParentSide &&
      !selectedChildrenSide &&
      !selectedSubChildrenSide
    ) {
      setParentExpand(true);
      handleSelectParent(parentData as any);
    }
  }, []);

  useEffect(() => {
    if (expandedChildValue) {
      subChildrenSidebar(expandedChildValue);
    } else {
      setSubChildrenSide([]);
    }
  }, [expandedChildValue, subChildrenSidebar, subChildrenReloadKey]);

  return (
    <div className="flex flex-col w-80 h-full bg-gray-50 overflow-y-auto">
      <div className="flex flex-col border border-gray-200 rounded-lg bg-white flex-1 min-h-0">
        {/* Header dengan styling yang lebih modern */}
        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <h2 className="font-semibold text-lg text-gray-800 tracking-tight">
            Sort Name
          </h2>
        </div>

        <div className="p-3 overflow-y-auto flex-1">
          {/* PARENT LEVEL */}
          <div
            className={`rounded-lg transition-all duration-200 ${selectedParentSide?.value === parentData.value ? "bg-red-50 ring-2 ring-red-200" : "hover:bg-gray-100"}`}
          >
            <button
              onClick={() => {
                toggleExpandParent();
                handleSelectParent(parentData as any);
                setSelectedSubChildrenSide(null);
              }}
              className="flex flex-row items-center gap-3 px-3 py-1.5 text-sm w-full group"
            >
              <KeenIcon
                icon="right"
                className={`transition-all duration-200 ${parentExpand ? "rotate-90 text-gray-700" : "text-gray-500"} group-hover:text-gray-700`}
              />
              <KeenIcon
                icon="folder"
                className={`${selectedParentSide?.value === parentData.value ? "text-red-600" : "text-gray-600"} group-hover:text-gray-700 transition-colors`}
              />
              <span
                className={`font-medium ${selectedParentSide?.value === parentData.value ? "text-red-600" : "text-gray-700"}`}
              >
                ALL
              </span>
            </button>
          </div>

          {/* CHILDREN LEVEL */}
          {parentExpand && (
            <ul className="pl-2 mt-2 space-y-1">
              {/* {loadingChild && (
                <div className="flex justify-center items-center py-8">
                  <Loading />
                </div>
              )} */}
              {!loadingChild && childrenSide.length === 0 ? (
                <li className="flex items-center justify-center px-4 py-8 text-sm text-gray-400">
                  <div className="text-center">
                    <KeenIcon
                      icon="folder"
                      className="text-2xl text-gray-300 mb-2 mx-auto"
                    />
                    <p>No data available</p>
                  </div>
                </li>
              ) : (
                childrenSide?.map((child) => (
                  <li key={child.value} className="space-y-1">
                    {/* CHILD ITEM */}
                    <div className="flex flex-col w-full">
                      <button
                        onClick={() => {
                          toggleExpandChildren(child.value);
                          handleSelectChild(child);
                          setSelectedParentSide(null);
                          setSelectedSubChildrenSide(null);
                          //  console.log('data child :', child)
                          //  console.log('klik selected children', selectedChildrenSide)
                        }}
                        className={`flex flex-row items-center gap-3 py-1.5 px-3 w-full transition-all duration-200 rounded-lg group ${selectedChildrenSide?.value === child.value ? "bg-blue-50 ring-2 ring-blue-200" : "hover:bg-gray-100"}`}
                      >
                        <KeenIcon
                          icon="right"
                          className={`transition-all duration-200 text-xs ${expandedChildValue === child.value ? "rotate-90 text-gray-700" : "text-gray-500"} group-hover:text-gray-700`}
                        />
                        <KeenIcon
                          icon="folder"
                          className={`${selectedChildrenSide?.value === child.value ? "text-blue-600" : "text-gray-600"} group-hover:text-gray-700 transition-colors`}
                        />
                        <span
                          className={`font-medium text-sm ${selectedChildrenSide?.value === child.value ? "text-blue-600" : "text-gray-700"}`}
                        >
                          {child.lookupName}
                        </span>
                      </button>

                      {/* SUB CHILDREN LEVEL */}
                      {expandedChildValue === child.value && (
                        <ul className="pl-8 mt-1 space-y-1">
                          {/* {loadingSubChild && (
                            <div className="flex justify-center items-center py-4">
                              <Loading />
                            </div>
                          )} */}
                          {!loadingSubChild && subChildrenSide.length === 0 ? (
                            <li className="flex items-center justify-center px-3 py-4 text-sm text-gray-400">
                              <div className="text-center">
                                <KeenIcon
                                  icon="menu"
                                  className="text-xl text-gray-300 mb-1 mx-auto"
                                />
                                <p className="text-xs">No sub data available</p>
                              </div>
                            </li>
                          ) : (
                            subChildrenSide?.map((subChild) => (
                              <li key={subChild.adviceTypeSortId}>
                                <button
                                  onClick={() => {
                                    handleSelectSubChild(subChild);
                                    setSelectedParentSide(null);
                                    setSelectedChildrenSide(null);
                                  }}
                                  className={`flex flex-row items-center gap-3 py-2 px-3 w-full transition-all duration-200 rounded-lg group ${selectedSubChildrenSide?.adviceTypeSortId === subChild.adviceTypeSortId ? "bg-green-50 ring-2 ring-green-200" : "hover:bg-gray-100"}`}
                                >
                                  <KeenIcon
                                    icon="menu"
                                    className={`text-xs ${selectedSubChildrenSide?.adviceTypeSortId === subChild.adviceTypeSortId ? "text-green-600" : "text-gray-500"} group-hover:text-gray-700 transition-colors`}
                                  />
                                  <span
                                    className={`text-sm ${selectedSubChildrenSide?.adviceTypeSortId === subChild.adviceTypeSortId ? "text-green-600 font-medium" : "text-gray-700"}`}
                                  >
                                    {subChild.adviceTypeSortName}
                                  </span>
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>

      <AdviceTypeDetailSidebar />
    </div>
  );
};

export default AdviceTypeSidebar;
