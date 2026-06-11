import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdviceTypeContext } from "../hooks/useAdviceTypeContext";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
import { useEffect, useState } from "react";
import AdviceTypeAction, {
  cascadeProps,
  domainProps,
} from "../action/AdviceTypeAction";
import { Loading } from "@/components/common/Loading";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import {
  adviceTypeContentProps,
  initialPropsAdviceTypeContent,
} from "../hooks/AdviceTypeContext";

const API_URL_REF = apiConfigRef.ref;

const CopyContent = () => {
  const { PostData } = useCallApi();
  const {
    showCopyContent,
    setShowCopyContent,
    selectedChildrenSide,
    subChildrenReloadKey,
    fetchingListContent,
    selectedContent,
  } = useAdviceTypeContext();

  const {
    childrenSide,
    subChildrenSide,
    setSubChildrenSide,
    childrenSideBar,
    subChildrenSidebar,
    loadingChild,
    loadingSubChild,
  } = AdviceTypeAction();

  const [expandedChildValue, setExpandedChildValue] = useState<string | null>(
    null,
  );
  const [selectedParentCopy, setSelectedParentCopy] =
    useState<domainProps | null>(null);
  const [selectedChildrenCopy, setSelectedChildrenCopy] =
    useState<cascadeProps | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectParentCopy = (item: domainProps) => {
    setSelectedParentCopy(item);
    setSelectedChildrenCopy(null);
  };

  const handleSelectChildCopy = (item: cascadeProps) => {
    setSelectedChildrenCopy(item);
    setSelectedParentCopy(null);
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
    if (showCopyContent) {
      childrenSideBar();
    }
  }, [showCopyContent]);

  useEffect(() => {
    if (expandedChildValue) {
      subChildrenSidebar(expandedChildValue);
    } else {
      setSubChildrenSide([]);
    }
  }, [expandedChildValue, subChildrenSidebar, subChildrenReloadKey]);

  const handleSubmit = async () => {
    if (!selectedParentCopy && !selectedChildrenCopy && !selectedContent) {
      return;
    }

    setIsSubmitting(true);

    try {
      let payload: any = {
        adviceTypeName: `Copy Of ${selectedContent?.adviceTypeName ?? ""}`,
        adviceChannel: selectedContent?.adviceChannel,
        adviceChannelName: selectedContent?.adviceChannelName,
        isHis: selectedContent?.isHis,
        disabled: selectedContent?.disabled,
        effTime: selectedContent?.effTime,
        expTime: selectedContent?.expTime,
        msgDefine: selectedContent?.msgDefine,
        comments: selectedContent?.comments,
        delayTime: selectedContent?.delayTime,
        stdCode: `Copy Of ${selectedContent?.stdCode ?? ""}`,
        priority: selectedContent?.priority,
        srcNbr: selectedContent?.srcNbr,
        senderParam: selectedContent?.senderParam,
        adviceType: selectedContent?.adviceType,
        times: selectedContent?.times,
        timeInterval: selectedContent?.timeInterval,
        parentAdviceType: selectedContent?.parentAdviceType,
        adviceCatg: selectedChildrenSide?.value,
        adviceParamCode: selectedContent?.adviceParamCode ?? "",
      };

      if (selectedParentCopy) {
        payload.adviceCatg = selectedParentCopy.value;
        payload.adviceTypeSortId = 0;
      }

      if (selectedChildrenCopy) {
        payload.adviceCatg = selectedChildrenCopy.adviceCatg;
        payload.adviceTypeSortId = selectedChildrenCopy.adviceTypeSortId;
      }

      //  console.log("Copy payload:", payload);

      const response = await PostData(
        `${API_URL_REF}/api/advice-type/copy-advice-type`,
        payload,
      );

      //  console.log("hasil response:", response);

      if (response?.status) {
        toast.success("Advice type copied successfully!");
        await fetchingListContent();

        setSelectedParentCopy(null);
        setSelectedChildrenCopy(null);
        setExpandedChildValue(null);
        setShowCopyContent(false);
      } else {
        const errorMessage =
          response?.message || "Failed to copy advice type. Please try again.";
        toast.error(errorMessage);
        console.error("❌ API returned error:", response);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "Something went wrong. Please try again.";
      console.error("❌ Error copying advice type:", error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={showCopyContent} onOpenChange={setShowCopyContent}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            Copy Selector
          </DialogTitle>
        </DialogHeader>

        <div className="h-[50vh] flex flex-col">
          <div className="font-medium py-3 px-5 text-[16px]">Template Name</div>

          <div className="overflow-y-auto flex-1 relative px-2">
            {/* CHILDREN LEVEL */}
            <ul className="space-y-1 text-sm">
              {loadingChild && <Loading />}
              {!loadingChild && childrenSide.length === 0 ? (
                <li className="flex h-full items-center px-2 py-1.5 text-sm text-gray-500 italic">
                  No data available
                </li>
              ) : (
                childrenSide?.map((parent) => (
                  <li key={parent.value}>
                    {/* CHILD ITEM */}
                    <div className="flex flex-col w-full">
                      <div className="flex flex-row items-center gap-1 w-full">
                        {/* Expand/Collapse Button */}
                        <button
                          onClick={() => toggleExpandChildren(parent.value)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors duration-200 pl-5"
                        >
                          <KeenIcon
                            icon="right"
                            className={`transition-transform text-gray-600 ${
                              expandedChildValue === parent.value
                                ? "rotate-90"
                                : ""
                            }`}
                          />
                        </button>

                        {/* Parent Selection Button */}
                        <button
                          onClick={() => handleSelectParentCopy(parent)}
                          className={`flex flex-row items-center gap-2 py-1 flex-1 hover:bg-gray-200 transition-colors duration-200 rounded ${
                            selectedParentCopy?.value === parent.value
                              ? "bg-blue-100 text-blue-600"
                              : ""
                          }`}
                        >
                          <KeenIcon icon="folder" />
                          <span className="text-sm">{parent.lookupName}</span>
                        </button>
                      </div>

                      {/* SUB CHILDREN LEVEL */}
                      {expandedChildValue === parent.value && (
                        <ul className="pl-10 mt-1 space-y-1">
                          {loadingSubChild && <Loading />}
                          {!loadingSubChild && subChildrenSide.length === 0 ? (
                            <li className="flex items-center px-2 py-1.5 text-sm text-gray-500 italic">
                              No sub data available
                            </li>
                          ) : (
                            subChildrenSide?.map((child) => (
                              <li key={child.adviceTypeSortId}>
                                <button
                                  onClick={() => handleSelectChildCopy(child)}
                                  className={`flex flex-row items-center gap-2 py-1 px-3 w-full hover:bg-gray-200 transition-colors duration-200 rounded ${
                                    selectedChildrenCopy?.adviceTypeSortId ===
                                    child.adviceTypeSortId
                                      ? "bg-green-100 text-green-600"
                                      : ""
                                  }`}
                                >
                                  <KeenIcon icon="menu" />
                                  <span className="text-sm">
                                    {child.adviceTypeSortName}
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
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="text-sm h-8"
            onClick={() => setShowCopyContent(false)}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="text-sm h-8"
            onClick={handleSubmit}
            disabled={!selectedParentCopy && !selectedChildrenCopy}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CopyContent;
