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
import { useCallback, useEffect, useState } from "react";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import AdviceTypeAction, {
  cascadeProps,
  domainProps,
} from "../action/AdviceTypeAction";
import { Loading } from "@/components/common/Loading";
import { toast } from "sonner";

const API_URL_REF = apiConfigRef.ref;

const MoveContent = () => {
  const { PostData } = useCallApi();
  const {
    showMoveContent,
    setShowMoveContent,
    selectedContent,
    fetchingListContent,
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

  const [parentExpand, setParentExpand] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedParentMove, setSelectedParentMove] =
    useState<domainProps | null>(null);
  const [selectedChildrenMove, setSelectedChildrenMove] =
    useState<cascadeProps | null>(null);

  const handleSelectParentMove = (parent: domainProps) => {
    setSelectedParentMove(parent);
    setSelectedChildrenMove(null);
  };

  const handleSelectChildrenMove = (child: cascadeProps) => {
    setSelectedChildrenMove(child);
    setSelectedParentMove(null);
  };

  const toggleExpand = (parentValue: string) => {
    setParentExpand((prev) => {
      if (prev === parentValue) {
        setSubChildrenSide([]);
        return null;
      }
      return parentValue;
    });
  };

  useEffect(() => {
    if (showMoveContent) {
      childrenSideBar();
    }
  }, [showMoveContent]);

  useEffect(() => {
    if (parentExpand) {
      subChildrenSidebar(parentExpand);
    } else {
      setSubChildrenSide([]);
    }
  }, [parentExpand, subChildrenSidebar]);

  const handleSubmit = async () => {
    if (!selectedContent || (!selectedParentMove && !selectedChildrenMove))
      return;

    //  console.log("selectedContent", selectedContent);

    setIsSubmitting(true);

    try {
      let payload: any = {
        adviceType: selectedContent?.adviceType,
      };

      if (selectedChildrenMove) {
        payload.adviceTypeSortId = selectedChildrenMove.adviceTypeSortId;
        payload.adviceCatg = selectedChildrenMove.adviceCatg;
      }

      if (selectedParentMove) {
        payload.adviceCatg = selectedParentMove?.value;
        payload.adviceTypeSortId = 0;
      }
      const response = await PostData(
        `${API_URL_REF}/api/advice-type/change-sort-of-advice-type`,
        payload,
      );

      if (response?.status) {
        toast.success("Advice type move successfully!");
        await fetchingListContent();

        setSelectedParentMove(null);
        setSelectedChildrenMove(null);
        setParentExpand(null);
        setShowMoveContent(false);
      } else {
        const errorMessage =
          response?.message || "Failed to move advice type. Please try again.";
        toast.error(errorMessage);
        console.error("❌ Api returned error:", response);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
      console.error("❌ error moving advice type:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={showMoveContent} onOpenChange={setShowMoveContent}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            Move Selector
          </DialogTitle>
        </DialogHeader>

        <div className="h-[50vh] flex flex-col">
          <div className="font-medium py-3 px-5 text-[16px]">Template Name</div>

          <div className="overflow-y-auto flex-1 relative px-2">
            <ul className="space-y-1 text-sm">
              {loadingChild && <Loading />}
              {!loadingChild && childrenSide.length === 0 ? (
                <li className="flex h-full items-center px-2 py-1.5 text-sm text-gray-500 italic">
                  No data available
                </li>
              ) : (
                childrenSide?.map((parent) => (
                  <li key={parent.value}>
                    <div className="flex flex-col w-full">
                      <div className="flex flex-row items-center gap-1 w-full">
                        <button
                          onClick={() => {
                            toggleExpand(parent.value);
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors duration-200 pl-5"
                        >
                          <KeenIcon
                            icon="right"
                            className={`transition-transform text-gray-600 ${parentExpand === parent.value ? "rotate-90" : ""}`}
                          />
                        </button>

                        <button
                          onClick={() => handleSelectParentMove(parent)}
                          className={`flex flex-row items-center gap-2 py-1 flex-1 hover:bg-gray-200 transition-colors duration-200 rounded ${
                            selectedParentMove?.value === parent.value
                              ? "bg-blue-100 text-blue-600"
                              : ""
                          }`}
                        >
                          <KeenIcon icon="folder" />
                          <span className="text-sm">{parent.lookupName}</span>
                        </button>
                      </div>

                      {parentExpand === parent.value && (
                        <ul className="pl-10 mt-1 space-y-1">
                          {loadingSubChild && <Loading />}
                          {!loadingSubChild && subChildrenSide.length === 0 ? (
                            <li className="flex items-center px-2 py-1.5 text-sm text-gray-500 italic">
                              No data available
                            </li>
                          ) : (
                            subChildrenSide?.map((child) => (
                              <li key={child.adviceTypeSortId}>
                                <button
                                  onClick={() =>
                                    handleSelectChildrenMove(child)
                                  }
                                  className={`flex flex-row items-center gap-2 py-1 px-3 w-full hover:bg-gray-200 transition-colors duration-200 rounded ${selectedChildrenMove?.adviceTypeSortId === child.adviceTypeSortId ? "bg-blue-100 text-blue-700" : ""}`}
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
            onClick={() => {
              setShowMoveContent(false);
              setSelectedParentMove(null);
              setSelectedChildrenMove(null);
              setParentExpand(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="text-sm h-8"
            onClick={() => {
              handleSubmit();
              //  console.log("1");
            }}
            disabled={!selectedParentMove && !selectedChildrenMove}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveContent;
