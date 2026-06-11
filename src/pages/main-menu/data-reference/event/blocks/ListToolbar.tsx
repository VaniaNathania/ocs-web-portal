import { useEffect, useState } from "react";
import DynamicFeatureTab from "../component/DynamicFeatureContent";
import StaticFeatureTab from "../component/StaticFeature";
import TagFeatureTab from "../component/TagFeatureContent";
import { useEventListContext } from "../hooks/useEventContext";
import UsageEventContent from "../component/UsageEventContent";
import SubscriptionEventContent from "../component/SubscriptionEventContent";
import RecurringEventContent from "../component/RecurringEventContent";

const ListToolbar = () => {
  const { selectedItem, setMode } = useEventListContext();

  const [selectedTab, setSelectedTab] = useState<"dynamic" | "static" | "tag">(
    "dynamic",
  );

  useEffect(() => {
    //  console.log("item: ", selectedItem);
  }, [selectedItem]);

  if (selectedItem) {
    if (selectedItem.reType === "1" || selectedItem.reType === "B") {
      return <UsageEventContent />;
    }
    if (selectedItem.reType === "2" || selectedItem.reType === "D") {
      return <RecurringEventContent />;
    }
    if (selectedItem.reType === "3" || selectedItem.reType === "C") {
      return <SubscriptionEventContent />;
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex gap-8 px-6">
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm ${selectedTab === "dynamic" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            onClick={() => {
              setSelectedTab("dynamic");
              setMode("view");
            }}
          >
            Dynamic Feature
          </button>
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm ${selectedTab === "static" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            onClick={() => {
              setSelectedTab("static");
              setMode("view");
            }}
          >
            Static Feature
          </button>
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm ${selectedTab === "tag" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            onClick={() => {
              setSelectedTab("tag");
              setMode("view");
            }}
          >
            Tag Feature
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === "dynamic" && <DynamicFeatureTab />}
      {selectedTab === "static" && <StaticFeatureTab />}
      {selectedTab === "tag" && <TagFeatureTab />}
    </div>
  );
};

export default ListToolbar;
