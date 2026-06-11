import { useSubscriberListContext } from "../../../hooks";
import { X } from "lucide-react";

const Header = () => {
  const { setSelectedOperation, selectedSubs } = useSubscriberListContext();
  return (
    <div className=" bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">
          {selectedSubs?.subsPlanName}
        </h1>
        <button
          onClick={() => setSelectedOperation(undefined)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Service Info */}
      <div className="flex gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">📱</span>
          <span>Service Number: {selectedSubs?.accNbr}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">📋</span>
          <span>Offer Name:{selectedSubs?.offerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">📊</span>
          <span>Subscription Plan Name: {selectedSubs?.subsPlanName}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
