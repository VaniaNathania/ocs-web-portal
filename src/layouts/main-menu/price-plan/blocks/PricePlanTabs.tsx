// REFACTORED SIDEBAR - Mengikuti pattern dari referensi
// Replace entire component dengan kode ini:

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { apiConfig } from "@/config/api.config";
import { useAuthContext } from "@/auth";
import {
  PricePlanListContext,
  PricePlanListContextProvider,
} from "../hooks/PricePlanContext";
import { DataGridInner, KeenIcon } from "@/components";
import { ChevronDown, ChevronRight, FileText, DollarSign } from "lucide-react";

const API_URL = apiConfig.service_price_plan;

interface PricePlanType {
  id: string;
  pricePlanTypeName: string;
}

interface ApplyLevel {
  parentName: string;
  name: string;
  list: PricePlanType[][];
}

const PricePlanTabs = () => {
  const { auth } = useAuthContext();

  const [applyLevels, setApplyLevels] = useState<ApplyLevel[]>([]);
  const [activeApplyLevel, setActiveApplyLevel] = useState<string>("");
  const [activePricePlanTypeId, setActivePricePlanTypeId] =
    useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openedApplyLevel, setOpenedApplyLevel] = useState<string>("");

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${API_URL}/priceplan/menu/list`, {
          headers: {
            Authorization: `Bearer ${auth?.access_token}`,
          },
        });

        if (response.data.code !== "200") {
          throw new Error(response.data.message ?? "Failed to fetch menu data");
        }

        const menuData: ApplyLevel[] = response.data.data ?? [];
        setApplyLevels(menuData);

        let defaultApplyLevel: ApplyLevel | undefined;
        let defaultType: PricePlanType | undefined;

        for (const level of menuData) {
          const flat = level.list?.flat() ?? [];
          const found = flat.find((t) => t.pricePlanTypeName === "System");

          if (found) {
            defaultApplyLevel = level;
            defaultType = found;
            break;
          }
        }

        if (!defaultApplyLevel && menuData.length > 0) {
          defaultApplyLevel = menuData[0];
          defaultType = menuData[0]?.list?.flat()?.[0];
        }

        if (defaultApplyLevel) {
          setActiveApplyLevel(defaultApplyLevel.name);
          setOpenedApplyLevel(defaultApplyLevel.name);
        }

        if (defaultType) {
          setActivePricePlanTypeId(defaultType.id);
        }

        setError(null);
      } catch (err: any) {
        console.error("Error fetching menu data:", err);
        setError(err.message || "Failed to load menu data");
      } finally {
        setLoading(false);
      }
    };

    if (auth?.access_token) {
      fetchMenuData();
    }
  }, [auth?.access_token]);

  const handleApplyLevelClick = (applyLevelName: string) => {
    setOpenedApplyLevel((prev) =>
      prev === applyLevelName ? "" : applyLevelName
    );

    setActiveApplyLevel(applyLevelName);

    const selectedLevel = applyLevels.find((x) => x.name === applyLevelName);
    const nextType = selectedLevel?.list?.flat()?.[0] ?? null;

    if (nextType) {
      setActivePricePlanTypeId(nextType.id);
    } else {
      setActivePricePlanTypeId("");
    }
  };

  const handlePricePlanTypeChange = (id: string) => {
    setActivePricePlanTypeId(id);
  };

  const currentPricePlanTypes = useMemo(() => {
    const level = applyLevels.find((x) => x.name === activeApplyLevel);
    return level?.list?.flat() ?? [];
  }, [applyLevels, activeApplyLevel]);

  const getApplyLevelDisplayName = (level: string) => {
    const mapping: Record<string, string> = {
      S: "Subscription",
      A: "Account",
    };
    return mapping[level] || level;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="text-gray-600 text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="text-red-600 text-sm">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar - Style dari referensi */}
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <KeenIcon icon="price-tag" className=" text-white" />
            </div>
            <h2 className="text-sm font-semibold text-gray-800">Price Plans</h2>
          </div>

          {/* Navigation */}
          <nav aria-label="Price plan menu">
            <ul className="space-y-2">
              {applyLevels.map((level) => {
                const isActive = activeApplyLevel === level.name;
                const isOpened = openedApplyLevel === level.name;

                return (
                  <li key={level.name}>
                    {/* Apply Level Button */}
                    <button
                      onClick={() => handleApplyLevelClick(level.name)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                        isActive
                          ? "bg-red-50 text-red-600 border-l-4 border-red-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      title={level.parentName}
                    >
                      <FileText className="h-5 w-5 mr-3" />
                      <span className="text-sm font-medium">
                        {level.parentName}
                      </span>
                      {isOpened ? (
                        <ChevronDown className="h-4 w-4 ml-auto" />
                      ) : (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )}
                    </button>

                    {/* Price Plan Types - Submenu */}
                    {isOpened && (
                      <ul className="mt-1 ml-8 space-y-1">
                        {currentPricePlanTypes.length === 0 ? (
                          <li className="px-3 py-2 text-xs text-gray-400">
                            No price plan types
                          </li>
                        ) : (
                          currentPricePlanTypes.map((type) => (
                            <li key={type.id}>
                              <button
                                onClick={() =>
                                  handlePricePlanTypeChange(type.id)
                                }
                                className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                                  activePricePlanTypeId === type.id
                                    ? "bg-red-50 text-red-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                                title={type.pricePlanTypeName}
                              >
                                <span className="text-sm">
                                  {type.pricePlanTypeName}
                                </span>
                                {activePricePlanTypeId === type.id && (
                                  <div className="ml-auto w-1.5 h-1.5 bg-red-600 rounded-full" />
                                )}
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Breadcrumbs */}
          {activeApplyLevel && activePricePlanTypeId && (
            <nav className="flex items-center space-x-2 text-sm mb-6 text-gray-600">
              <span className="font-medium">Price Plan</span>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium">
                {getApplyLevelDisplayName(activeApplyLevel)}
              </span>
              <ChevronRight className="h-4 w-4" />
              <span className="font-semibold text-gray-900">
                {currentPricePlanTypes.find(
                  (t) => t.id === activePricePlanTypeId
                )?.pricePlanTypeName || ""}
              </span>
            </nav>
          )}

          {/* Content Area */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {activeApplyLevel && activePricePlanTypeId ? (
              <PricePlanListContextProvider
                key={`${activeApplyLevel}-${activePricePlanTypeId}`}
                applyLevel={activeApplyLevel}
                pricePlanTypeId={activePricePlanTypeId}
              >
                <DataGridInner />
              </PricePlanListContextProvider>
            ) : (
              <div className="text-sm text-gray-500 text-center py-12">
                Please select a price plan type
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { PricePlanTabs };
