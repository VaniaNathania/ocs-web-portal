import React, { useCallback, useState } from "react";
import AddPrivateOfferGroup from "../../blocks/AddPrivateOfferGroup";
import PublicOfferGroup from "./PublicOfferGroupSubsPlan";
import { useSubscriptionPlanOfferListContext } from "../../hooks/useSubscriptionPlanOfferListContext";

const PrivateOfferGroupContent: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPublicOfferGroupOpen, setIsPublicOfferGroupOpen] = useState(false);

  const { detailModalData } = useSubscriptionPlanOfferListContext();

  const handleShowAddDialog = useCallback((open: boolean) => {
    setIsAddDialogOpen(open);
  }, []);

  const handleShowPublicOfferGroup = useCallback((open: boolean) => {
    setIsPublicOfferGroupOpen(open);
  }, []);

  return (
    <div className="p-2 bg-white min-h-screen">
      <div className="flex flex-wrap gap-3">
        <button
          className="px-5 py-2 text-sm font-medium bg-blue-500 text-white border border-blue-500 rounded-md hover:bg-blue-600 transition-all"
          onClick={() => handleShowAddDialog(true)}
        >
          Add Group
        </button>

        <button
          className="px-5 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-all"
          onClick={() => handleShowPublicOfferGroup(true)}
        >
          Public Offer Group
        </button>
      </div>

      <AddPrivateOfferGroup
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        group={detailModalData}
      />

      <PublicOfferGroup
        isOpen={isPublicOfferGroupOpen}
        onClose={() => setIsPublicOfferGroupOpen(false)}
        rowData={detailModalData}
      />
    </div>
  );
};

export default PrivateOfferGroupContent;
