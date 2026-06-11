import { DataGridProvider, DefaultTooltip, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import BlockSalesCategorySide from "./blocksSalesCategorySide";
import SalesCategoryContentChild from "./SalesCategoryContentChild";
import { useOfferGroupHook } from "../../../subscription-plan/hooks/useOfferGroupHooks";
import { SalesCategoryChildProps } from "./SalesCategoryChildInterface";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useOfferLayout } from "@/layouts/main-menu/offer";


interface SalesCategoryProps {
  isOpen?: boolean;
  onClose?: () => void;
  type?: string;
  onSubmitSuccess?: () => void;
}

interface contactChannelProps {
  id: number;
  name: string;
  comments: string;
}

const API_URL_OFFER = apiConfigOffer.offer;

const SalesCategoryContent: React.FC<SalesCategoryProps> = ({ isOpen, onClose = () => {}, type = "2", onSubmitSuccess }) => {
  const {menuPrivAccess} = useOfferLayout()
  const { GetData, PostData } = useCallApi();
  const { handleSubmit, handleEdit, renderDeleteDialog, isSubmitting, errors, clearErrors, deleteData } = BlockSalesCategorySide({
    onSubmitSuccess: () => {
      // console.log("Category saved successfully");
    },
  });
  const { fetchSearchSalesCategory, searchResult, setSearchResult, showSearchDropdown, setShowSearchDropdown, isSearching, setIsSearching } = useOfferGroupHook();
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadingContactChannel, setLoadingContactChannel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    offerCatg: {
      offerCatgClass: "A",
      offerCatgType: "2",
      offerCatgName: "",
      offerCatgCode: "",
      effDate: "",
      expDate: "",
      comments: "",
      rootCatg: false,
    },
    spId: 0,
    offerCatgMem: {
      offerCatgId: "",
    },
    offerCatgApplyChannelStr: "",
    offerCatgApplyChannelList: [
      {
        contactChannelId: "",
        spId: 0,
      },
    ],
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesParent, setCategoriesParent] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [contactChannel, setContactChannel] = useState<contactChannelProps[]>([]);
  const [contactChannelOpen, setContactChannelOpen] = useState(false);
  const [contactChannelFormOpen, setContactChannelFormOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<contactChannelProps[]>([]);
  const [selectedChannelForm, setSelectedChannelForm] = useState<contactChannelProps[]>([]);
  const [isParentSelected, setIsParentSelected] = useState<boolean>(true);
  const [selectedOfferCategory, setSelectedOfferCategory] = useState<string>(type);
  const [initialType, setInitialType] = useState<string>(type);
  const [mode, setMode] = useState<"view" | "edit" | "create">("view");
  const [showDelete, setShowDelete] = useState(false);
  const [selectedContentChild, setSelectedContentChild] = useState<SalesCategoryChildProps | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCategorySideParent = async () => {
    setLoadingCategory(true);
    setError(null);

    try {
      const response = await GetData(`${API_URL_OFFER}/offer/category/qry-indep-prod-catg-mem-and-cnt`, {
        spId: 0,
        method: "qryRootCatg",
        offerCatgType: selectedOfferCategory,
        offerCatgClass: "B",
      });

      const responseDataParent = response.data;
      setCategoriesParent(responseDataParent);
      return responseDataParent;
    } catch (error) {
      console.error("error fetching category side parent");
      return [];
    } finally {
      setLoadingCategory(false);
    }
  };

  const fetchCategorySide = async (parentId?: number, parentClass?: string) => {
    // setLoadingCategory(true);
    setError(null);

    try {
      const response = await GetData(`${API_URL_OFFER}/offer/category/qry-offer-catg`, {
        offerCatgType: selectedOfferCategory,
        offerCatgClass: parentClass,
        offerCatgId: parentId ?? 1,
        spId: 0,
      });

      const responseData = response.data;
      setCategories(responseData);
      return responseData;
    } catch (error) {
      console.error("Error fetching category side");
      return [];
    }
  };

  const fetchContactChannel = async () => {
    try {
      const response = await GetData(`${API_URL_OFFER}/offer/common/qry-contact-channel`, {});
      const responseData = response.data;
      setContactChannel(responseData);
      return responseData;
    } catch (error) {
      console.error("Error fetching contact channel");
      return [];
    }
  };

  const closePopUp = () => {
    onClose();
    setSelectedChannel([]);
    setSelectedChannelForm([]);
    setMode("view");
    setSearchQuery("");
    setSearchResult([]);
    setShowSearchDropdown(false);

    // ✅ Reset ke initialType (bukan type prop langsung)
    setSelectedOfferCategory(initialType);

    setSelectedCategory(null);
    setCategoriesParent([]);
    setCategories([]);
    setIsParentSelected(true);
  };

  const handleShowDelete = (open: boolean) => {
    setShowDelete(open);
  };

  const handleSaveCategory = async () => {
    // console.log("test");
    setIsLoading(true);

    const payload = isParentSelected
      ? {
          offerCatg: {
            offerCatgType: selectedOfferCategory,
            offerCatgClass: "B",
            offerCatgName: formData.offerCatg.offerCatgName,
            offerCatgCode: formData.offerCatg.offerCatgCode,
            comments: formData.offerCatg.comments,
            effDate: formData.offerCatg.effDate,
            expDate: formData.offerCatg.expDate,
            rootCatg: formData.offerCatg.rootCatg,
            spId: 0,
            ...(mode === "edit" && {
              offerCatgId: selectedCategory?.offerCatgId,
            }),
          },
          offerCatgApplyChannelStr: formData.offerCatgApplyChannelStr,
          offerCatgApplyChannelList: formData.offerCatgApplyChannelList,
          spId: 0,
        }
      : {
          offerCatg: {
            offerCatgName: formData.offerCatg.offerCatgName,
            offerCatgCode: formData.offerCatg.offerCatgCode,
            effDate: formData.offerCatg.effDate,
            expDate: formData.offerCatg.expDate,
            comments: formData.offerCatg.comments,
            offerCatgClass: "B",
            offerCatgType: selectedOfferCategory,
            rootCatg: false,
            spId: 0,
            ...(mode === "edit" && {
              offerCatgId: selectedCategory?.offerCatgId,
            }),
          },
          spId: 0,
          offerCatgMem: {
            offerCatgId: selectedCategory?.offerCatgId?.toString() || "",
          },
          offerCatgApplyChannelList: [],
        };
    // console.log(payload);
    try {
      let success = false;

      if (mode === "create") {
        success = await handleSubmit(payload);
      } else if (mode === "edit") {
        success = await handleEdit(payload);
      }

      if (success) {
        const updatedData = await fetchCategorySideParent();

        if (updatedData && updatedData.length > 0) {
          if (mode === "create") {
            if (isParentSelected) {
              const newCategory = updatedData.find((cat: any) => cat.offerCatgName === formData.offerCatg.offerCatgName);
              if (newCategory) {
                setSelectedCategory(newCategory);
              }
            } else {
              const parentCat = updatedData.find((cat: any) => cat.offerCatgId === selectedCategory?.offerCatgId);

              if (parentCat) {
                const children = await fetchCategorySide(parentCat.offerCatgId, parentCat.offerCatgClass);
                const newChild = children.find((child: any) => child.offerCatgName === formData.offerCatg.offerCatgName);
                if (newChild) {
                  setSelectedCategory(newChild);
                  setIsParentSelected(false);
                  setCategoriesParent((prev) => prev.map((p) => (p.offerCatgId === parentCat.offerCatgId ? { ...p, children: children, isExpand: true } : p)));
                }
              }
            }
          } else {
            // ✅ Logic untuk edit - refresh data yang sedang dipilih
            if (isParentSelected) {
              const updatedCategory = updatedData.find((cat: any) => cat.offerCatgId === selectedCategory.offerCatgId);
              if (updatedCategory) {
                setSelectedCategory(updatedCategory);
              }
            } else {
              // Untuk child, perlu fetch ulang parent dan cari child yang diupdate
              const parentCat = updatedData.find((cat: any) => cat.offerCatgId === selectedCategory.srcOfferCatgId);
              if (parentCat) {
                const children = await fetchCategorySide(parentCat.srcOfferCatgId, parentCat.offerCatgClass);
                const updatedChild = children.find((child: any) => child.offerCatgId === selectedCategory.offerCatgId);
                if (updatedChild) {
                  setSelectedCategory(updatedChild);
                  setCategoriesParent((prev) => prev.map((p) => (p.offerCatgId === parentCat.offerCatgId ? { ...p, children: children, isExpand: true } : p)));
                }
              }
            }
          }
        }

        setMode("view");
      }
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      setFormData((prev) => ({
        ...prev,
        offerCatg: {
          ...prev.offerCatg,
          offerCatgName: selectedCategory.offerCatgName || "",
          offerCatgCode: selectedCategory.offerCatgCode || "",
          contactChannel: "",
          effDate: selectedCategory.effDate || "",
          expDate: selectedCategory.expDate || "",
          comments: selectedCategory.comments || "",
        },
        offerCatgApplyChannelStr: mode === "edit" && !isParentSelected ? selectedCategory.offerCatgApplyChannelStr || "" : "",
        offerCatgApplyChannelList: mode === "edit" && !isParentSelected ? selectedCategory.offerCatgApplyChannelList || [] : [], //  [
        //     {
        //       contactChannelId: "",
        //       spId: 0,
        //     },
        //   ],
      }));
      if (mode === "edit" && isParentSelected && selectedCategory.offerCatgApplyChannelList) {
        const channelIds = selectedCategory.offerCatgApplyChannelList.map((ch: any) => parseInt(ch.contactChannelId));

        // Set selectedChannelForm berdasarkan data yang ada
        if (contactChannel.length > 0) {
          const selectedChannels = contactChannel.filter((ch) => channelIds.includes(ch.id));
          setSelectedChannelForm(selectedChannels);
        }
      } else {
        setSelectedChannelForm([]);
      }
    }
  }, [selectedCategory]);

  const init = async () => {
    try {
      setIsLoading(true);
      const dataParent = await fetchCategorySideParent();

      if (dataParent && dataParent.length > 0) {
        setSelectedCategory(dataParent[0])
        setIsParentSelected(true);
      }
    } catch (error) {
      console.error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      init();
    }
  }, [isOpen, selectedOfferCategory]);

  useEffect(() => {
    // Update initialType jika user manually mengubah category
    if (isOpen && selectedOfferCategory !== initialType) {
      // Jangan update initialType, biarkan tetap sesuai prop
      // Ini memastikan saat modal ditutup dan dibuka lagi, kembali ke initialType
    }
  }, [selectedOfferCategory, initialType, isOpen]);

  useEffect(() => {
    if (clearErrors) {
      clearErrors();
    }
  }, [mode]);

  useEffect(() => {
    if (selectedChannelForm.length > 0) {
      setFormData((prev) => ({
        ...prev,
        offerCatgApplyChannelStr: selectedChannelForm.map((c) => c.name).join(", "),
        offerCatgApplyChannelList: selectedChannelForm.map((c) => ({
          contactChannelId: c.id.toString(),
          spId: 0,
        })),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        offerCatgApplyChannelStr: "",
        offerCatgApplyChannelList: [],
      }));
    }
  }, [selectedChannelForm]);

  const handleSearchCategory = useCallback(
    async (search: string) => {
      if (!search.trim()) {
        setSearchResult([]);
        setShowSearchDropdown(false);
        return;
      }

      await fetchSearchSalesCategory(search, "B", selectedOfferCategory);
    },
    [fetchSearchSalesCategory, setSearchResult, setShowSearchDropdown, selectedOfferCategory],
  );

  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        handleSearchCategory(value);
      }, 500);
    },
    [handleSearchCategory],
  );

  const handleSelectSearchResult = async (category: any) => {
    const isParent = categoriesParent.some((parent) => parent.offerCatgId === category.offerCatgId);

    setSelectedCategory(category);
    setSearchQuery(category.offerCatgName);
    setSearchResult([]);
    setShowSearchDropdown(false);
    setMode("view");
    setIsParentSelected(isParent);

    if (!isParent) {
      try {
        // Loop semua parent dan fetch children-nya untuk cari parent yang sebenarnya
        for (const parent of categoriesParent) {
          const children = await fetchCategorySide(parent.offerCatgId, parent.offerCatgClass);

          const foundChild = children.find((child: any) => child.offerCatgId === category.offerCatgId);

          if (foundChild) {
            setCategoriesParent((prev) => prev.map((p) => (p.offerCatgId === parent.offerCatgId ? { ...p, children: children, isExpand: true } : p)));
            break;
          }
        }
      } catch (error) {
        console.error("Error finding parent:", error);
      }
    }
  };

  useEffect(() => {
    setSearchQuery("");
    setSearchResult([]);
    setShowSearchDropdown(false);
  }, [selectedOfferCategory]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closePopUp();
      }}
    >
      <DialogOverlay className="bg-black/50" />
      <DialogContent className="max-w-7xl flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold text-gray-800 flex items-center">Sales Category</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {/* <Loading /> */}

        <div className="flex gap-4 flex-1 min-h-0 p-4">
          {/* left Panel */}
          <div className="w-1/3 bg-white border border-gray-200 rounded shadow-sm flex flex-col min-h-0">
            {/* Header */}
            <div className="p-3 border-b">
              <div className="relative">
                <div className="text-sm font-medium text-gray-700 mb-1 px-1">Category Name</div>
                <div className="relative">
                  <label className="input input-sm flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onFocus={() => {
                        if (searchResult.length > 0) {
                          setShowSearchDropdown(true);
                        }
                      }}
                      placeholder="Search category name..."
                      className="w-full"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResult([]);
                          setShowSearchDropdown(false);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                    <KeenIcon icon="magnifier" />
                  </label>

                  {showSearchDropdown && (
                    <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                      {searchResult.length > 0 ? (
                        <ul className="py-1">
                          {searchResult.map((category, index) => (
                            <li key={`${category.offerCatgId}-${index}`}>
                              <button onClick={() => handleSelectSearchResult(category)} className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors duration-150 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center gap-2">
                                  <KeenIcon icon="category" className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-900 truncate" title={category.offerCatgName}>
                                      {category.offerCatgName}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">{category.offerCatgCode}</div>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{selectedOfferCategory === "1" ? "Bundle" : selectedOfferCategory === "2" ? "Product" : "Goods"}</span>
                                  </div>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500 text-center">{isSearching ? "Searching..." : "No results found"}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col w-full py-3">
                <label className="text-sm font-medium text-gray-700 mb-1 px-1">Offer Category</label>
                <Select
                  value={selectedOfferCategory}
                  onValueChange={(value) => {
                    setSelectedOfferCategory(value);
                    setCategoriesParent([]);
                    setSelectedCategory([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Main Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Bundle Category</SelectItem>
                    <SelectItem value="2">Main Product Category</SelectItem>
                    <SelectItem value="3">Goods Product Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-1 px-1">Contact Channel</label>
                <Popover
                  open={contactChannelOpen}
                  onOpenChange={async (open) => {
                    if (open) {
                      if (contactChannel.length === 0 && !loadingContactChannel) {
                        await fetchContactChannel();
                      }
                    }
                    setContactChannelOpen(open);
                  }}
                >
                  <PopoverTrigger asChild>
                    <button type="button" className="w-full flex items-center justify-between input text-left truncate" disabled={loadingContactChannel} title={selectedChannel.length > 0 ? selectedChannel.map((c) => c.name).join(", ") : undefined}>
                      <span className="truncate max-w-[90%]">{loadingContactChannel ? "Loading contact channel..." : selectedChannel.length > 0 ? selectedChannel.map((c) => c.name).join(", ") : "Select Contact Channels"}</span>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" onWheel={(e) => e.stopPropagation()}>
                    <Command>
                      <CommandInput placeholder="Search contact channel..." />
                      <CommandList className="max-h-[200px] overflow-y-auto pointer-events-auto">
                        <CommandEmpty>{loadingContactChannel ? "Loading..." : "No contact channel found."} </CommandEmpty>
                        <CommandGroup>
                          {contactChannel.map((contact) => (
                            <CommandItem
                              key={`${contact.id}`}
                              value={`${contact.name}`}
                              className="cursor-pointer text-xs flex items-center gap-2"
                              onSelect={() => {
                                const alreadySelected = selectedChannel.some((item) => item.id === contact.id);
                                if (alreadySelected) {
                                  setSelectedChannel((prev) => prev.filter((item) => item.id !== contact.id));
                                } else {
                                  setSelectedChannel((prev) => [...prev, contact]);
                                }
                              }}
                            >
                              <input type="checkbox" checked={selectedChannel.some((item) => item.id === contact.id)} readOnly />
                              {contact.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-wrap gap-3 mt-3 w-full justify-center">
                <AccessWrapper hasAccess={menuPrivAccess?.addStatus} enabledText="New Root Category">
                  <Button
                    variant="default"
                    className="h-7.5 px-4 text-sm sm:px-3 sm:text-xs w-auto"
                    onClick={() => {
                      setMode("create");
                      setSelectedChannelForm([]);
                      setFormData({
                        offerCatg: {
                          offerCatgClass: "A",
                          offerCatgType: "2",
                          offerCatgName: "",
                          offerCatgCode: "",
                          effDate: "",
                          expDate: "",
                          comments: "",
                          rootCatg: false,
                        },
                        spId: 0,
                        offerCatgMem: {
                          offerCatgId: "",
                        },
                        offerCatgApplyChannelStr: "",
                        offerCatgApplyChannelList: [],
                      });
                      setIsParentSelected(true);
                    }}
                  >
                    <span className="hidden sm:inline">New Root Category</span>
                    <span className="inline sm:hidden">Root</span>
                  </Button>
                </AccessWrapper>
              

                <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
                  <Button
                    variant="default"
                    className="h-7.5 px-4 text-sm sm:px-3 sm:text-xs w-auto"
                    onClick={() => {
                      setMode("create");
                      setSelectedChannelForm([]);
                      setFormData({
                        offerCatg: {
                          offerCatgClass: "A",
                          offerCatgType: "2",
                          offerCatgName: "",
                          offerCatgCode: "",
                          effDate: "",
                          expDate: "",
                          comments: "",
                          rootCatg: false,
                        },
                        spId: 0,
                        offerCatgMem: {
                          offerCatgId: "",
                        },
                        offerCatgApplyChannelStr: "",
                        offerCatgApplyChannelList: [],
                        //   {
                        //     contactChannelId: "",
                        //     spId: 0,
                        //   },
                        // ],
                      });
                      setIsParentSelected(false);
                    }}
                  >
                    <span className="hidden sm:inline">New Subcategory</span>
                    <span className="inline sm:hidden">Sub</span>
                  </Button>
                </AccessWrapper>
                
              </div>
            </div>

            <div className="flex-1 overflow-auto px-1">
              {loadingCategory ? (
                <div className="flex justify-center items-center py-10">
                  <Loading />
                </div>
              ) : error ? (
                <div className="text-center text-red-500 py-4 text-sm">Failed to load categories.</div>
              ) : (
                <ul className="mt-2 text-sm px-2 h-full">
                  {categoriesParent.length === 0 ? (
                    <li className="flex justify-center h-full items-center px-2 py-1.5 text-xl text-gray-500 italic">No data available</li>
                  ) : (
                    categoriesParent.map((parent, index) => {
                      const isExpanded = parent.isExpand || false;
                      const isSelectedParent = selectedCategory?.offerCatgId === parent.offerCatgId && isParentSelected;

                      const handleToggleExpand = async () => {
                        if (parent.children && parent.children.length > 0) {
                          setCategoriesParent((prev) => prev.map((p, i) => (i === index ? { ...p, isExpand: !p.isExpand } : p)));
                          return;
                        }

                        if (parent.children !== undefined) {
                          setCategoriesParent((prev) => prev.map((p, i) => (i === index ? { ...p, isExpand: !p.isExpand } : p)));
                          return;
                        }

                        // console.log(parent);

                        const children = await fetchCategorySide(parent.offerCatgId, parent.offerCatgClass);
                        setCategoriesParent((prev) => prev.map((p, i) => (i === index ? { ...p, children: children, isExpand: true } : p)));
                      };

                      const handleSelectParent = () => {
                        setMode("view");
                        setSelectedCategory(parent);
                        setIsParentSelected(true);
                      };

                      return (
                        <li key={parent.offerCatgId}>
                          <div className="flex flex-row w-full">
                            <div className="flex items-center flex-1 w-40 px-2 py-1 hover:bg-gray-200 rounded transition-colors duration-200">
                              <button onClick={handleToggleExpand}>
                                <KeenIcon icon="right" className={`mr-2 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                              </button>

                              {/* Parent name */}
                              <button
                                className="flex-1 min-w-0 text-left"
                                onClick={() => {
                                  handleSelectParent();
                                  handleToggleExpand();
                                }}
                              >
                                <span className={`block font-medium text-xs whitespace-normal break-words max-w-[300px] truncate ${isSelectedParent ? "text-blue-700 font-semibold" : ""}`} title={parent.offerCatgName}>
                                  {parent.offerCatgName}
                                </span>
                              </button>
                            </div>

                            {/* Delete button */}
                            {/* <Button className="flex items-center gap-1 ml-auto" size={"sm"} variant={"ghost"}>
                            <KeenIcon icon="trash" />
                          </Button> */}
                          </div>

                          {/* Children (Subcategories) */}
                          {isExpanded && parent.children !== undefined && (
                            <ul className="ml-6 mt-1">
                              {parent.children.length === 0 ? (
                                <li className="px-2 py-1.5 text-xs text-gray-500 italic">No data available</li>
                              ) : (
                                parent.children.map((child: any) => {
                                  const isSelectedChild = selectedCategory?.offerCatgId === child.offerCatgId && !isParentSelected;

                                  const handleSelectChild = () => {
                                    setMode("view");
                                    setSelectedCategory(child);
                                    setIsParentSelected(false);
                                  };

                                  return (
                                    <li key={child.srcOfferCatgId}>
                                      <button onClick={handleSelectChild} className={`flex items-center w-full text-left px-2 py-1.5 rounded hover:bg-blue-50 ${isSelectedChild ? "bg-blue-100 border-2 border-blue-400" : "hover:bg-gray-100"}`}>
                                        <KeenIcon icon="element-11" className={`w-4 h-4 mr-2 ${isSelectedChild ? "text-blue-600" : "text-gray-500"}`} />
                                        <div className="flex-1 min-w-0">
                                          <span className={`block truncate text-xs ${isSelectedChild ? "font-semibold text-blue-800" : ""}`}>{child.offerCatgName}</span>
                                        </div>
                                      </button>
                                    </li>
                                  );
                                })
                              )}
                            </ul>
                          )}
                        </li>
                      );
                    })
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* right panel */}
          <div className="flex-1 bg-white border border-gray-200 rounded shadow-sm overflow-auto">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between">
              <label className="text-gray-700 font-semibold text-lg">Category Detail</label>
              {mode === "create" && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Creating New
                  {isParentSelected ? "Root Category" : "Subcategory"}
                </span>
              )}
              {mode === "edit" && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Editing</span>}
            </div>

            {/* Form Content Top*/}
            <div className="p-6">
              <div className="flex gap-6">
                {/* left panel */}
                <div className="w-1/2 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-700 w-32">
                      <label className="text-red-600">*</label>Category Name
                    </div>
                    <div className="flex-1">
                      <label className={`input input-sm flex items-center gap-2 w-full ${errors.offerCatgName ? "border-red-500 border-2" : ""}`}>
                        <input
                          type="text"
                          className={`w-full ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          value={formData.offerCatg.offerCatgName}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              offerCatg: {
                                ...formData.offerCatg,
                                offerCatgName: e.target.value,
                              },
                            });
                            if (errors.offerCatgName && clearErrors) {
                              clearErrors();
                            }
                          }}
                          disabled={mode === "view"}
                          placeholder="Category Name"
                        />
                      </label>
                      {errors.offerCatgName && <span className="text-red-500 text-xs mt-1 blocks">{errors.offerCatgName}</span>}
                    </div>
                  </div>

                  {isParentSelected && (
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 w-32">Contact Channel</label>
                      <div className="flex-1">
                        <Popover
                          open={contactChannelFormOpen && mode !== "view"}
                          onOpenChange={async (open) => {
                            if (mode === "view") return;

                            if (open) {
                              if (contactChannel.length === 0 && !loadingContactChannel) {
                                await fetchContactChannel();
                              }
                            }
                            setContactChannelFormOpen(open);
                          }}
                        >
                          <PopoverTrigger asChild>
                            <button type="button" className={`input input-sm w-full flex items-center justify-between text-left truncate border-red  ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""} ${errors.offerCatgApplyChannelList ? "border-2 border-red-500" : ""}`} disabled={mode === "view" || loadingContactChannel} title={selectedChannelForm.length > 0 ? selectedChannelForm.map((c) => c.name).join(", ") : undefined}>
                              <span className="truncate max-w-[90%]">{loadingContactChannel ? "Loading contact channel..." : selectedChannelForm.length > 0 ? selectedChannelForm.map((c) => c.name).join(", ") : "Select Contact Channels"}</span>
                              <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className={`w-[var(--radix-popover-trigger-width)] p-0 `} onWheel={(e) => e.stopPropagation()}>
                            <Command>
                              <CommandInput placeholder="Search contact channel..." />
                              <CommandList className="max-h-[200px] overflow-y-auto pointer-events-auto">
                                <CommandEmpty>{loadingContactChannel ? "Loading..." : "No contact channel found."}</CommandEmpty>
                                <CommandGroup>
                                  {contactChannel.map((contact) => (
                                    <CommandItem
                                      key={`${contact.id}`}
                                      value={`${contact.name}`}
                                      className="cursor-pointer text-xs flex items-center gap-2"
                                      onSelect={() => {
                                        const alreadySelected = selectedChannelForm.some((item) => item.id === contact.id);
                                        if (errors.offerCatgApplyChannelList && clearErrors) {
                                          clearErrors();
                                        }
                                        if (alreadySelected) {
                                          setSelectedChannelForm((prev) => prev.filter((item) => item.id !== contact.id));
                                        } else {
                                          setSelectedChannelForm((prev) => [...prev, contact]);
                                        }
                                      }}
                                    >
                                      <input type="checkbox" checked={selectedChannelForm.some((item) => item.id === contact.id)} readOnly className="cursor-pointer" />
                                      {contact.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {errors.offerCatgApplyChannelList && <span className="text-red-500 text-xs mt-1 blocks">{errors.offerCatgApplyChannelList}</span>}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 w-32">
                      <span className="text-red-600">*</span>
                      Effective Date
                    </label>
                    <div className="flex-1 relative">
                      <input
                        type="date"
                        className={`w-full h-9 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${mode === "view" ? "bg-gray-100 cursor-not-allowed border-gray-300" : errors.effDate ? "border-red-500 border-2" : "border-gray-300"}`}
                        value={formData.offerCatg.effDate}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            offerCatg: {
                              ...formData.offerCatg,
                              effDate: e.target.value,
                            },
                          });
                          if (errors.effDate && clearErrors) {
                            clearErrors();
                          }
                        }}
                        disabled={mode === "view"}
                      />
                      {errors.effDate && <span className="text-red-500 text-xs mt-1 block">{errors.effDate}</span>}
                    </div>
                  </div>

                  {!isParentSelected && (
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 w-32">Remarks</label>
                      <div className="flex-1">
                        <label className="input input-sm flex items-center gap-2 w-full">
                          <input
                            type="text"
                            className={`w-full ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                            value={formData.offerCatg.comments}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                offerCatg: {
                                  ...formData.offerCatg,
                                  comments: e.target.value,
                                },
                              })
                            }
                            disabled={mode === "view"}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* right panel */}
                <div className="w-1/2 space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 w-32">Category Code</label>
                    <div className="flex-1">
                      <label className="input input-sm flex items-center gap-2 w-full">
                        <input
                          type="text"
                          className={`w-full ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          value={formData.offerCatg.offerCatgCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              offerCatg: {
                                ...formData.offerCatg,
                                offerCatgCode: e.target.value,
                              },
                            })
                          }
                          disabled={mode === "view"}
                          placeholder="Category Code"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 w-32">Expiry Date</label>
                    <div className="flex-1 relative">
                      <input
                        type="date"
                        className={`w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        value={formData.offerCatg.expDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            offerCatg: {
                              ...formData.offerCatg,
                              expDate: e.target.value,
                            },
                          })
                        }
                        disabled={mode === "view"}
                      />
                    </div>
                  </div>

                  {isParentSelected && (
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 w-32">Remarks</label>
                      <div className="flex-1">
                        <label className="input input-sm flex items-center gap-2 w-full">
                          <input
                            type="text"
                            className={`w-full ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                            value={formData.offerCatg.comments}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                offerCatg: {
                                  ...formData.offerCatg,
                                  comments: e.target.value,
                                },
                              })
                            }
                            disabled={mode === "view"}
                            placeholder="Remarks"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* tombol di bawah */}
              <div className="w-full flex justify-end items-center pt-5 gap-3">
                {mode === "view" ? (
                  <>
                  <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
                    <Button variant="default" onClick={() => setMode("edit")} disabled={!selectedCategory?.offerCatgId}>
                      Edit
                    </Button>
                  </AccessWrapper>
                  <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!selectedCategory?.offerCatgId) {
                          toast.error("No category selected");
                          return;
                        }
                        handleShowDelete(true);
                      }}
                      disabled={!selectedCategory?.offerCatgId}
                    >
                      Delete
                    </Button>
                  </AccessWrapper>
                  </>
                ) : (
                  <>
                    <Button variant="default" onClick={handleSaveCategory} disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : mode === "create" ? "Save" : "Save Changes"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setMode("view");
                        setSelectedChannelForm([]);
                        if (selectedCategory) {
                          const isParent = categoriesParent.some((parent) => parent.offerCatgId === selectedCategory?.offerCatgId);
                          setIsParentSelected(isParent);
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Form Content Bottom */}
            <div className="flex-1 overflow-auto">
              <div className="flex min-h-full">
                <div className="flex-1 border-r flex flex-col min-h-0">
                  <DataGridProvider columns={[]}>
                    <div className="flex-1 overflow-auto min-h-0 p-3">
                      <SalesCategoryContentChild selectedCategory={selectedCategory} categoryParent={categoriesParent} categoryChildren={categories} setSelectedContentChild={setSelectedContentChild} selectedContentChild={selectedContentChild} selectedOfferCategory={selectedOfferCategory} reload={init} />
                      {renderDeleteDialog(
                        showDelete,
                        () => handleShowDelete(false),
                        selectedCategory?.offerCatgId,
                        async () => {
                          const updatedData = await fetchCategorySideParent();

                          if (updatedData && updatedData.length > 0) {
                            setSelectedCategory(updatedData[0]);
                            setIsParentSelected(true);
                          } else {
                            setSelectedCategory(null);
                          }
                        },
                      )}
                    </div>
                  </DataGridProvider>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-50 rounded-lg">
            <Loading />
          </div>
        )} */}
      </DialogContent>
    </Dialog>
  );
};

export default SalesCategoryContent;
