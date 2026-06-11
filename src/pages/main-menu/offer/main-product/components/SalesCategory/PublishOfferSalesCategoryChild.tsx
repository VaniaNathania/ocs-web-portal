import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { ColumnDef, useReactTable } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import BlockSalesCategorySide, { EffectiveType } from "./blocksSalesCategorySide";

interface PublishOfferProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory?: any;
  categoryParent?: any;
  categoryChildren?: any;
  selectedContentChild?: any;
  reload?: any;
}

const API_URL_OFFER = apiConfigOffer.offer;

const PublishOfferSalesCategoryChild = ({ isOpen, onClose, selectedCategory, categoryParent, categoryChildren, selectedContentChild, reload }: PublishOfferProps) => {
  const { GetData, PostData } = useCallApi();
  // const {EffectiveType} = BlockSalesCategorySide ({ onSubmitSuccess: () => {} })
  const [categoryName, setCategoryName] = useState("");
  const [categoryRight, setCategoryRight] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [childrenData, setChildrenData] = useState<{ [key: number]: any[] }>({});
  const [loadingChildren, setLoadingChildren] = useState<{
    [key: number]: boolean;
  }>({});
  const [loadingCategoryRight, setLoadingCategoryRight] = useState(false);
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [selectItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [expandedRightRows, setExpandedRightRows] = useState<Set<number>>(new Set());
  const [childrenRightData, setChildrenRightData] = useState<{
    [key: number]: any[];
  }>({});
  const [selectedRightItems, setSelectedRightItems] = useState<Set<string>>(new Set());
  const [showEffectiveType, setShowEffectiveType] = useState(false);
  const [pendingItemsToMove, setPendingItemsToMove] = useState<any[]>([]);
  const [pendingChildrenRightData, setPendingChildrenRightData] = useState<any>({});
  const [pendingExpandRight, setPendingExpandRight] = useState<any>({});

  const fetchCategoryChildren = async (offerCatgId: number, offerCatgClass: string) => {
    try {
      setLoadingChildren((prev) => ({ ...prev, [offerCatgId]: true }));

      const payload = {
        offerCatgType: "2",
        offerCatgClass: offerCatgClass,
        offerCatgId: offerCatgId,
        spId: 0,
      };

      const response = await GetData(`${API_URL_OFFER}/offer/category/qry-offer-catg`, payload);
      setLoadingChildren((prev) => ({ ...prev, [offerCatgId]: false }));
      return response?.data || [];
    } catch (error) {
      console.error("Error fetching children:", error);
      setLoadingChildren((prev) => ({ ...prev, [offerCatgId]: false }));
      return [];
    }
  };

  const fetchCategoryRight = async (offerCatgClass: string) => {
    setLoadingCategoryRight(true);
    setError(null);

    try {
      const response = await GetData(`${API_URL_OFFER}/offer/common/qry-offer-catg-by-offer-id`, {
        offerId: selectedContentChild?.offerId,
        offerCatgClass: offerCatgClass,
        offerCatgType: "2",
        spId: 0,
      });

      const responseData = response.data;
      setCategoryRight(responseData);
      return responseData;
    } catch (error: any) {
      console.error("Error fetching category right");
      return [];
    } finally {
      setLoadingCategoryRight(false);
    }
  };

  const handleSelectParent = async (parent: any) => {
    const parentId = parent.offerCatgId;
    if (selectedParent === parentId) {
      setSelectedParent(null);
      setExpandedRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(parentId);
        return newSet;
      });
    } else {
      setSelectedParent(parentId);
      if (!childrenData[parentId]) {
        const children = await fetchCategoryChildren(parent.offerCatgId, parent.offerCatgClass);
        setChildrenData((prev) => ({ ...prev, [parentId]: children }));
      }
      setExpandedRows(new Set([parentId]));
    }
  };

  const handleToggleExpand = async (parent: any) => {
    const parentId = parent.offerCatgId;
    const isCurrentlyExpanded = expandedRows.has(parentId);

    if (isCurrentlyExpanded) {
      setExpandedRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(parentId);
        return newSet;
      });
    } else {
      if (!childrenData[parentId]) {
        const children = await fetchCategoryChildren(parent.offerCatgId, parent.offerCatgClass);
        setChildrenData((prev) => ({ ...prev, [parentId]: children }));
      }
      setExpandedRows((prev) => new Set(prev).add(parentId));
    }
  };

  const getAllVisibleItems = () => {
    const items: string[] = [];

    categoryParent.forEach((parent: any) => {
      items.push(`parent-${parent.offerCatgId}`);

      if (expandedRows.has(parent.offerCatgId)) {
        const children = childrenData[parent.offerCatgId] || [];
        children.forEach((child: any) => {
          items.push(`child-${child.offerCatgMemId}`);
        });
      }
    });

    return items;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allItems = getAllVisibleItems();
      const selectableItems = allItems.filter((itemId) => {
        if (itemId.startsWith("parent-")) {
          const parentIdNum = parseInt(itemId.replace("parent-", ""));
          return !isInRightTable(parentIdNum);
        } else if (itemId.startsWith("child-")) {
          const childIdNum = parseInt(itemId.replace("child-", ""));
          for (const parent of categoryParent) {
            const children = childrenData[parent.offerCatgId] || [];
            const child = children.find((c: any) => c.offerCatgMemId === childIdNum);
            if (child) {
              return !isChildRightTable(child.offerCatgId, parent.offerCatgId);
            }
          }
        }
        return true;
      });

      setSelectedItems(new Set(selectableItems));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectRightItem = (itemId: string) => {
    setSelectedRightItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAllRight = (checked: boolean) => {
    if (checked) {
      const allItems: string[] = [];

      categoryRight.forEach((item: any) => {
        allItems.push(`parent-${item.offerCatgId}`);

        if (expandedRightRows.has(item.offerCatgId)) {
          const children = childrenRightData[item.offerCatgId] || [];
          children.forEach((child: any) => {
            allItems.push(`child-${child.offerCatgMemId}`);
          });
        }
      });

      setSelectedRightItems(new Set(allItems));
    } else {
      setSelectedRightItems(new Set());
    }
  };

  const closePopUp = () => {
    setExpandedRows(new Set());
    setChildrenData({});
    setLoadingChildren({});
    setSelectedItems(new Set());
    setSelectedParent(null);
    setExpandedRightRows(new Set());
    setChildrenRightData({});
    setSelectedRightItems(new Set());
    // if (selectedContentChild?.offerId) {
    //   fetchCategoryRight(selectedContentChild.offerCatgClass || "B");
    // } else {
    //   setCategoryRight([]);
    // }

    onClose();
  };

  const handleSubmit = async () => {
    try {
      const offerCatgMems: any[] = [];

      categoryRight.forEach((item: any) => {
        // parent category
        const parentItem: any = {
          offerCatgId: item.offerCatgId,
          spId: 0,
          effDate: item.memEffDate?.split("T")[0] || new Date().toISOString().split("T")[0],
        };

        if (item.memExpDate) {
          parentItem.expDate = item.memExpDate.split("T")[0];
        }

        offerCatgMems.push(parentItem);

        //children category
        const children = childrenRightData[item.offerCatgId] || [];
        children.forEach((child: any) => {
          const childItem: any = {
            offerCatgId: child.offerCatgId,
            spId: 0,
            effDate: child.memEffDate?.split("T")[0] || new Date().toISOString().split("T")[0],
          };

          if (child.memExpDate) {
            childItem.expDate = item.memExpDate.split("T")[0];
          }

          offerCatgMems.push(childItem);
        });
      });

      const payload = {
        offerCatgMems: offerCatgMems,
        offerCatgClass: selectedContentChild?.offerCatgClass || "B",
        offerId: selectedContentChild?.offerId || null,
      };

      // console.log("Submit payload:", payload);

      const response = await PostData(`${API_URL_OFFER}/offer/category/set-offer-in-catg`, payload);

      if (response?.status !== false) {
        if (offerCatgMems.length === 0) {
          toast.success("Offer removed from all categories");
        } else {
          toast.success("Offer categories updated successfully");
        }

        closePopUp();
        reload();
      } else {
        toast.error(response?.message || "Failed to update offer categories");
      }
    } catch (error: any) {
      console.error("Error submitting:", error);
      toast.error(error?.response?.data?.message || "An error occurred while publishing offer");
    }
  };

  // Check apakah category ada di table kanan
  const isInRightTable = (offerCatgId: number) => {
    return categoryRight.some((item: any) => item.offerCatgId === offerCatgId);
  };

  const isChildRightTable = (childOfferCatgId: number, parentOfferCatgId: number) => {
    // Cek di childrenRightData (child yang ada di bawah parent)
    const childrenInRight = childrenRightData[parentOfferCatgId] || [];
    if (childrenInRight.some((c: any) => c.offerCatgId === childOfferCatgId)) {
      return true;
    }

    // Cek juga sebagai standalone child di categoryRight
    const standaloneChild = categoryRight.find((item: any) => item.offerCatgMemId !== null && item.offerCatgId === childOfferCatgId);

    return !!standaloneChild;
  };

  const handleMoveToRight = () => {
    const itemsToMove: any[] = [];
    const movedIds = new Set<number>();
    const newChildrenRight: { [key: number]: any[] } = {};
    const newExpandedRight = new Set(expandedRightRows);
    const standAloneChildrenToRemove = new Set<number>();

    // Copy existing children data
    Object.keys(childrenRightData).forEach((key) => {
      const parentId = parseInt(key);
      newChildrenRight[parentId] = [...childrenRightData[parentId]];
    });

    // Pisahkan parent dan children items
    const parentItems: string[] = [];
    const childItems: string[] = [];

    selectItems.forEach((itemId) => {
      if (itemId.startsWith("parent-")) {
        parentItems.push(itemId);
      } else if (itemId.startsWith("child-")) {
        childItems.push(itemId);
      }
    });

    parentItems.forEach((itemId) => {
      const parentIdNum = parseInt(itemId.replace("parent-", ""));
      const parent = categoryParent.find((p: any) => p.offerCatgId === parentIdNum);

      if (parent && !isInRightTable(parent.offerCatgId) && !movedIds.has(parent.offerCatgId)) {
        itemsToMove.push(parent);
        movedIds.add(parent.offerCatgId);

        const allChildrenToMerge: any[] = [];

        const childrenInLeft = childrenData[parent.offerCatgId] || [];
        const childOfferCatgIds = childrenInLeft.map((c: any) => c.offerCatgId);

        // console.log("Parent ID:", parent.offerCatgId);
        // console.log("Children IDs in left table:", childOfferCatgIds);

        const standAloneChildrenInRight = categoryRight.filter((item: any) => {
          return item.offerCatgMemId !== null && childOfferCatgIds.includes(item.offerCatgId);
        });

        // console.log("Found standalone children:", standAloneChildrenInRight);

        allChildrenToMerge.push(...standAloneChildrenInRight);

        const childrenInItemsToMove = itemsToMove.filter((item: any) => item.offerCatgMemId !== null && childOfferCatgIds.includes(item.offerCatgId));

        allChildrenToMerge.push(...childrenInItemsToMove);

        childItems.forEach((childItemId) => {
          const childIdNum = parseInt(childItemId.replace("child-", ""));
          const children = childrenData[parent.offerCatgId] || [];
          const child = children.find((c: any) => c.offerCatgMemId === childIdNum);

          if (child && !movedIds.has(child.offerCatgId)) {
            allChildrenToMerge.push(child);
            movedIds.add(child.offerCatgId);
          }
        });

        // Merge semua children ke parent
        if (allChildrenToMerge.length > 0) {
          if (!newChildrenRight[parent.offerCatgId]) {
            newChildrenRight[parent.offerCatgId] = [];
          }

          allChildrenToMerge.forEach((child: any) => {
            if (!newChildrenRight[parent.offerCatgId].some((c: any) => c.offerCatgId === child.offerCatgId)) {
              newChildrenRight[parent.offerCatgId].push(child);
            }
            standAloneChildrenToRemove.add(child.offerCatgId);
          });

          newExpandedRight.add(parent.offerCatgId);
        }
      }
    });

    // BARU PROSES CHILDREN
    childItems.forEach((itemId) => {
      const childIdNum = parseInt(itemId.replace("child-", ""));

      for (const parent of categoryParent) {
        const children = childrenData[parent.offerCatgId] || [];
        const child = children.find((c: any) => c.offerCatgMemId === childIdNum);

        if (child && !isInRightTable(child.offerCatgId) && !movedIds.has(child.offerCatgId)) {
          const parentObj = categoryParent.find((p: any) => p.offerCatgId === parent.offerCatgId);

          if (parentObj) {
            // Cek apakah parent sudah ada di kanan ATAU baru saja di-move
            const parentInRight = isInRightTable(parentObj.offerCatgId) || movedIds.has(parentObj.offerCatgId);

            if (parentInRight) {
              // Parent sudah ada di kanan, tambahkan sebagai child
              if (!newChildrenRight[parentObj.offerCatgId]) {
                newChildrenRight[parentObj.offerCatgId] = [];
              }

              if (!newChildrenRight[parentObj.offerCatgId].some((c: any) => c.offerCatgId === child.offerCatgId)) {
                newChildrenRight[parentObj.offerCatgId].push(child);
              }
              newExpandedRight.add(parentObj.offerCatgId);
            } else {
              // Parent belum ada di kanan, tambahkan child sebagai standalone
              itemsToMove.push(child);
            }
          }

          movedIds.add(child.offerCatgId);
          break;
        }
      }
    });

    //simpan semua hasil ke pending agar muncul effctive Type dulu
    setPendingItemsToMove(itemsToMove);
    setPendingChildrenRightData(newChildrenRight);
    setPendingExpandRight(newExpandedRight);

    const filteredCategoryRight = [...categoryRight, ...itemsToMove].filter((item: any) => {
      if (item.offerCatgMemId !== null && standAloneChildrenToRemove.has(item.offerCatgId)) {
        return false;
      }
      if (item.offerCatgMemId !== null) {
        const hasParent = [...categoryRight, ...itemsToMove].some((parent: any) => parent.offerCatgMemId === null && parent.offerCatgId === item.offerCatgId);
        return !hasParent;
      }
      return true;
    });

    (window as any).tempFilteredCategoryRight = filteredCategoryRight;

    setSelectedItems(new Set());
    setShowEffectiveType(true);
  };

  const handleEffectiveTypeConfirm = (EffectiveType: string, effectiveDate: string, expiryDate: string) => {
    const updateItems = pendingItemsToMove.map((item) => ({
      ...item,
      effDate: EffectiveType === "immediately" ? new Date().toISOString().split("T")[0] : effectiveDate,
      expDate: expiryDate || null,

      memEffDate: EffectiveType === "immediately" ? new Date().toISOString().split("T")[0] : effectiveDate,
      memExpDate: expiryDate || null,
    }));
    // console.log(updateItems);

    const filteredCategoryRight = (window as any).tempFilteredCategoryRight || categoryRight;

    setCategoryRight(
      filteredCategoryRight
        .map((item: any) => {
          // Update item yang baru dipindahkan
          const updatedItem = updateItems.find((ui: any) => ui.offerCatgId === item.offerCatgId);
          return updatedItem || item;
        })
        .concat(updateItems.filter((ui: any) => !filteredCategoryRight.some((item: any) => item.offerCatgId === ui.offerCatgId))),
    );

    setChildrenRightData(pendingChildrenRightData);
    setExpandedRightRows(pendingExpandRight);

    (window as any).tempFilteredCategoryRight = null;
    setPendingItemsToMove([]);
    setPendingChildrenRightData({});
    setPendingExpandRight(new Set());

    setShowEffectiveType(false);

    // setCategoryRight((prev) => [
    //   ...prev,
    //   ...pendingItemsToMove.map((item) => ({
    //     ...item,
    //     effectiveDate:
    //       EffectiveType === "immediately"
    //       ? new Date().toISOString().split("T")[0]
    //       : effectiveDate,
    //       expiryDate: expiryDate || null,
    //   })),
    // ]);
  };

  const handleMoveToLeft = () => {
    if (selectedRightItems.size === 0) {
      return;
    }

    const idsToRemove = new Set<number>();
    const childIdsToRemove = new Set<number>(); // TAMBAHKAN INI

    selectedRightItems.forEach((itemId) => {
      if (itemId.startsWith("parent-")) {
        const parentIdNum = parseInt(itemId.replace("parent-", ""));
        idsToRemove.add(parentIdNum);

        // TAMBAHKAN INI: Jika parent dihapus, hapus juga semua children-nya
        const children = childrenRightData[parentIdNum] || [];
        children.forEach((child: any) => {
          childIdsToRemove.add(child.offerCatgId);
        });
      } else if (itemId.startsWith("child-")) {
        const childIdNum = parseInt(itemId.replace("child-", ""));
        for (const item of categoryRight) {
          const children = childrenRightData[item.offerCatgId] || [];
          const child = children.find((c: any) => c.offerCatgMemId === childIdNum);
          if (child) {
            idsToRemove.add(child.offerCatgId);
            childIdsToRemove.add(child.offerCatgId); // TAMBAHKAN INI
            break;
          }
        }
      }
    });

    // Filter categoryRight
    setCategoryRight((prev) => prev.filter((item) => !idsToRemove.has(item.offerCatgId)));

    // TAMBAHKAN INI: Bersihkan childrenRightData
    setChildrenRightData((prev) => {
      const newData = { ...prev };

      // Hapus children yang di-remove
      Object.keys(newData).forEach((parentKey) => {
        const parentId = parseInt(parentKey);

        // Jika parent di-remove, hapus semua children-nya
        if (idsToRemove.has(parentId)) {
          delete newData[parentId];
        } else {
          // Filter children yang di-remove
          newData[parentId] = newData[parentId].filter((child: any) => !childIdsToRemove.has(child.offerCatgId));

          // Jika tidak ada children tersisa, hapus entry parent
          if (newData[parentId].length === 0) {
            delete newData[parentId];
          }
        }
      });

      return newData;
    });

    // TAMBAHKAN INI: Bersihkan expandedRightRows jika parent di-remove
    setExpandedRightRows((prev) => {
      const newSet = new Set(prev);
      idsToRemove.forEach((id) => newSet.delete(id));
      return newSet;
    });

    setSelectedRightItems(new Set());
  };

  const column = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => {
          const allItems = getAllVisibleItems();
          const selectableItems = allItems.filter((itemId) => {
            if (itemId.startsWith("parent-")) {
              const parentIdNum = parseInt(itemId.replace("parent-", ""));
              return !isInRightTable(parentIdNum);
            } else if (itemId.startsWith("child-")) {
              const childIdNum = parseInt(itemId.replace("child-", ""));
              // Cari child untuk get offerCatgId
              for (const parent of categoryParent) {
                const children = childrenData[parent.offerCatgId] || [];
                const child = children.find((c: any) => c.offerCatgMemId === childIdNum);
                if (child) {
                  return !isInRightTable(child.offerCatgId);
                }
              }
            }
            return true;
          });

          const isAllSelected = selectableItems.length > 0 && selectableItems.every((item) => selectItems.has(item));
          const isSomeSelected = selectableItems.some((item) => selectItems.has(item)) && !isAllSelected;

          return (
            <div className="flex items-center justify-center">
              <Input
                type="checkbox"
                className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = isSomeSelected;
                  }
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </div>
          );
        },
        cell: ({ row }) => {
          const parent = row.original;
          const isExpanded = expandedRows.has(parent.offerCatgId);
          const children = childrenData[parent.offerCatgId] || [];
          const parentId = `parent-${parent.offerCatgId}`;

          // Check apakah parent ada di table kanan
          const parentInRight = isInRightTable(parent.offerCatgId);

          return (
            <div>
              {/* Parent Checkbox */}
              <div className="flex items-center justify-center py-2">
                <Input type="checkbox" className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-700" checked={parentInRight || selectItems.has(parentId)} disabled={parentInRight} onChange={() => handleSelectItem(parentId)} />
              </div>

              {/* Children Checkboxes */}
              {isExpanded && children.length > 0 && (
                <div className="space-y-0">
                  {children.map((child: any) => {
                    const childId = `child-${child.offerCatgMemId}`;
                    const childInRight = isChildRightTable(child.offerCatgId, parent.offerCatgId);

                    return (
                      <div key={child.offerCatgMemId} className="flex items-center justify-center py-2 border-t">
                        <Input type="checkbox" className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-700" checked={childInRight || selectItems.has(childId)} disabled={childInRight} onChange={() => handleSelectItem(childId)} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "offerCatgName",
        accessorFn: (row) => row.offerCatgName,
        header: ({ column }) => <DataGridColumnHeader className="" title="Published Category" column={column} />,
        cell: ({ row }) => {
          const parent = row.original;
          const isExpanded = expandedRows.has(parent.offerCatgId);
          const children = childrenData[parent.offerCatgId] || [];
          const isLoading = loadingChildren[parent.offerCatgId] || false;
          const isSelectedParent = selectedParent === parent.offerCatgId; // Tambahkan ini

          return (
            <div>
              {/* Parent Row */}
              <div className="flex items-center py-2">
                <button onClick={() => handleToggleExpand(parent)} className="mr-2 hover:bg-gray-100 rounded p-1">
                  <KeenIcon icon="right" className={`transition-transform text-sm ${isExpanded ? "rotate-90" : ""}`} />
                </button>
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => handleSelectParent(parent)} // Update ini
                >
                  <span className={`block text-sm whitespace-normal break-words truncate ${isSelectedParent ? "text-blue-700 font-semibold" : ""}`} title={parent.offerCatgName}>
                    {parent.offerCatgName}
                  </span>
                </button>
              </div>

              {/* Children Rows */}
              {isExpanded && (
                <div>
                  {isLoading ? (
                    <div className="text-sm text-gray-500 py-2 pl-6 border-t">Loading...</div>
                  ) : children.length === 0 ? (
                    <div className="text-sm text-gray-500 italic py-2 pl-6 border-t">No data available</div>
                  ) : (
                    children.map((child: any) => (
                      <div key={child.offerCatgMemId} className="flex items-center py-2 pl-6 border-t">
                        <KeenIcon icon="element-11" className="w-3 h-3 mr-2 text-gray-500" />
                        <span className="text-sm">{child.offerCatgName}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "effDate",
        accessorFn: (row) => row.effDate,
        header: ({ column }) => <DataGridColumnHeader className="" title="Effective Date" column={column} />,
        cell: ({ row }) => {
          const parent = row.original;
          const isExpanded = expandedRows.has(parent.offerCatgId);
          const children = childrenData[parent.offerCatgId] || [];

          return (
            <div>
              {/* Parent effDate */}
              <div className="py-2">
                <span className="text-sm">{parent.effDate || "-"}</span>
              </div>

              {/* Children effDate */}
              {isExpanded && children.length > 0 && (
                <div>
                  {children.map((child: any) => (
                    <div key={child.offerCatgMemId} className="py-2 border-t">
                      <span className="text-sm">{child.effDate || "-"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "expDate",
        accessorFn: (row) => row.expDate,
        header: ({ column }) => <DataGridColumnHeader className="" title="Expiry Date" column={column} />,
        cell: ({ row }) => {
          const parent = row.original;
          const isExpanded = expandedRows.has(parent.offerCatgId);
          const children = childrenData[parent.offerCatgId] || [];

          return (
            <div>
              {/* Parent expDate */}
              <div className="py-2">
                <span className="text-sm">{parent.expDate || "-"}</span>
              </div>

              {/* Children expDate */}
              {isExpanded && children.length > 0 && (
                <div>
                  {children.map((child: any) => (
                    <div key={child.offerCatgMemId} className="py-2 border-t">
                      <span className="text-sm">{child.expDate || "-"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
    ],
    [expandedRows, childrenData, loadingChildren, selectedParent, selectItems, categoryRight],
  );

  const rightColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => {
          const allRightItems: string[] = [];
          categoryRight.forEach((item: any) => {
            allRightItems.push(`parent-${item.offerCatgId}`);
            if (expandedRightRows.has(item.offerCatgId)) {
              const children = childrenRightData[item.offerCatgId] || [];
              children.forEach((child: any) => {
                allRightItems.push(`child-${child.offerCatgMemId}`);
              });
            }
          });

          const isAllSelected = allRightItems.length > 0 && allRightItems.every((item) => selectedRightItems.has(item));
          const isSomeSelected = allRightItems.some((item) => selectedRightItems.has(item)) && !isAllSelected;

          return (
            <div className="flex items-center justify-center gap-1">
              <input
                type="checkbox"
                className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = isSomeSelected;
                  }
                }}
                onChange={(e) => handleSelectAllRight(e.target.checked)}
              />
            </div>
          );
        },
        cell: ({ row }) => {
          const item = row.original;
          const isExpanded = expandedRightRows.has(item.offerCatgId);
          const children = childrenRightData[item.offerCatgId] || [];
          const parentId = `parent-${item.offerCatgId}`;

          return (
            <div>
              {/* Parent Checkbox */}
              <div className="flex items-center justify-center py-2">
                <input type="checkbox" className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-600" checked={selectedRightItems.has(parentId)} onChange={() => handleSelectRightItem(parentId)} />
              </div>

              {/* Children Checkboxes */}
              {isExpanded && children.length > 0 && (
                <div className="space-y-0">
                  {children.map((child: any) => {
                    const childId = `child-${child.offerCatgMemId}`;
                    return (
                      <div key={child.offerCatgMemId} className="flex items-center justify-center py-2 border-t">
                        <input type="checkbox" className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-700" checked={selectedRightItems.has(childId)} onChange={() => handleSelectRightItem(childId)} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "offerCatgName",
        accessorFn: (row) => row.offerCatgName,
        header: ({ column }) => <DataGridColumnHeader className="" title="Published Category" column={column} />,
        cell: ({ row }) => {
          const item = row.original;
          const isExpanded = expandedRightRows.has(item.offerCatgId);
          const children = childrenRightData[item.offerCatgId] || [];

          return (
            <div>
              {/* Parent Row */}
              <div className="flex items-center py-2">
                {children.length > 0 ? (
                  <button
                    onClick={() => {
                      setExpandedRightRows((prev) => {
                        const newSet = new Set(prev);
                        if (newSet.has(item.offerCatgId)) {
                          newSet.delete(item.offerCatgId);
                        } else {
                          newSet.add(item.offerCatgId);
                        }
                        return newSet;
                      });
                    }}
                    className="mr-2 hover:bg-gray-100 rounded p-1"
                  >
                    <KeenIcon icon="right" className={`transition-transform text-sm ${isExpanded ? "rotate-90" : ""}`} />
                  </button>
                ) : (
                  <div className="w-6 mr-2" />
                )}
                <span className="text-sm">{item.offerCatgName}</span>
              </div>

              {/* Children Rows */}
              {isExpanded && children.length > 0 && (
                <div>
                  {children.map((child: any) => (
                    <div key={child.offerCatgMemId} className="flex items-center py-2 pl-6 border-t">
                      <KeenIcon icon="element-11" className="w-3 h-3 mr-2 text-gray-500" />
                      <span className="text-sm">{child.offerCatgName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "effDate",
        accessorFn: (row) => row.memEffDate,
        header: ({ column }) => <DataGridColumnHeader className="" title="Effective Date" column={column} />,
        cell: ({ row }) => {
          const item = row.original;
          const isExpanded = expandedRightRows.has(item.offerCatgId);
          const children = childrenRightData[item.offerCatgId] || [];

          return (
            <div>
              {/* Parent effDate */}
              <div className="py-2">
                <span className="text-sm">{item.memEffDate ? item.memEffDate.split("T")[0] : "-"}</span>
              </div>

              {/* Children effDate */}
              {isExpanded && children.length > 0 && (
                <div>
                  {children.map((child: any) => (
                    <div key={child.offerCatgMemId} className="py-2 border-t">
                      <span className="text-sm">{child.memEffDate ? child.memEffDate.split("T")[0] : "-"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "expDate",
        accessorFn: (row) => row.expDate,
        header: ({ column }) => <DataGridColumnHeader className="" title="Expiry Date" column={column} />,
        cell: ({ row }) => {
          const item = row.original;
          const isExpanded = expandedRightRows.has(item.offerCatgId);
          const children = childrenRightData[item.offerCatgId] || [];

          return (
            <div>
              {/* Parent expDate */}
              <div className="py-2">
                <span className="text-sm">{item.memExpDate ? item.memExpDate.split("T")[0] : "-"}</span>
              </div>

              {/* Children expDate */}
              {isExpanded && children.length > 0 && (
                <div>
                  {children.map((child: any) => (
                    <div key={child.offerCatgMemId} className="py-2 border-t">
                      <span className="text-sm">{child.memExpDate ? child.memExpDate.split("T")[0] : "-"} </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
    ],
    [categoryParent, childrenData, expandedRightRows, childrenRightData, selectedRightItems],
  );

  useEffect(() => {
    if (selectedContentChild?.offerName) {
      setCategoryName(selectedContentChild.offerName);
    } else {
      setCategoryName("");
    }

    if (isOpen && selectedContentChild?.offerId) {
      fetchCategoryRight(selectedContentChild.offerCatgClass || "B");
    } else {
      setCategoryRight([]);
    }
  }, [selectedContentChild, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => closePopUp()}>
      <DialogContent className="max-w-7xl flex flex-col p-0 overflow-hidden">
        {loadingCategoryRight && <Loading />}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-medium">Publish Offer</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-4 flex flex-col mb-5">
          <div className="flex items-center py-4 w-1/3">
            <label className="text-sm font-medium w-32 min-w-[120px]">Offer Name</label>
            <Input type="text" value={categoryName} className="w-full border rounded-md px-3 py-1.5 text-sm border-gray-500" disabled />
          </div>
          <div className="pb-3 px-1 font-medium text-gray-700">Published Category</div>
          <div className="flex flex-1 min-h-0 items-stretch gap-4 flex-row">
            {/* Left */}
            <div className="flex-1 min-h-0">
              <div className=" h-full">
                <div className="flex-1 border border-gray-300 p-3 overflow-auto">
                  <DataGridProvider columns={column} data={categoryParent} pagination={{ size: 10 }} />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-2">
              <Button size="sm" variant="outline" onClick={handleMoveToRight} disabled={selectItems.size === 0} title="Move selected items to right">
                <KeenIcon icon="right" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleMoveToLeft} title="Move all items to left">
                <KeenIcon icon="left" />
              </Button>
            </div>

            {/* Right */}
            <div className="flex-1 min-h-0">
              <div className="flex-1 border border-gray-300 p-3 overflow-auto">
                <DataGridProvider columns={rightColumns} data={categoryRight} pagination={{ size: 10 }} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className=" bottom-0 bg-white border-t border-gray-200 flex justify-end gap-2 p-4 pr-10">
          <Button
            type="submit"
            variant="default"
            onClick={() => handleSubmit()}
            // disabled={selectedRightItems.size === 0}
          >
            Ok
          </Button>
          <Button type="button" variant="outline" onClick={() => closePopUp()}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
      {/* {EffectiveType(showEffectiveType, () => setShowEffectiveType(false))} */}
      <EffectiveType isOpen={showEffectiveType} onClose={() => setShowEffectiveType(false)} onSubmitSuccess={handleEffectiveTypeConfirm} />
      {/* <EffectiveType isOpen={showEffectiveType} onClose={() => setShowEffectiveType(false)}/> */}
    </Dialog>
  );
};

export default PublishOfferSalesCategoryChild;
