import { Button } from "@/components/ui/button";
import { ReUsageList } from "../hooks/EventContext";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { ChevronRight, ChevronDown } from "lucide-react";
import { DefaultTooltip, KeenIcon } from "@/components";
import { useEventListContext } from "../hooks/useEventContext";
import { useRef } from "react";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface EventNodeProps {
  item: ReUsageList;
  expandedIds: number[];
  toggleExpand: (id: number) => void;
  selectedRef: React.RefObject<HTMLDivElement>;
}

const EventNode: React.FC<EventNodeProps> = ({
  item,
  expandedIds,
  toggleExpand,
  selectedRef,
}) => {
  const {
    handleSelectedItem,
    setSelectedItem,
    selectedItem,
    setAddTrigger,
    setSelectedReType,
    setMode,
    menuPrivAccess,
  } = useEventListContext();
  const isExpanded = expandedIds.includes(item.reId);
  const hasChildren = item.children && item.children.length > 0;
  const triggerNewUsage = () => {
    setAddTrigger((prev: any) => ({ type: "usage", count: prev.count + 1 }));
  };
  const isSelected = selectedItem?.reName === item.reName;

  return (
    <li>
      <div
        ref={isSelected ? selectedRef : null}
        className={`flex items-center group justify-between pl-6 pr-2 py-1 rounded cursor-pointer
      ${isSelected ? "bg-red-500 text-white" : "hover:bg-white hover:text-gray-900"}`}
        onClick={() => {
          handleSelectedItem(item);
          setMode("view");
          setSelectedReType("999");
        }}
      >
        {/* icon & label */}
        <div className="flex items-center min-w-0">
          <div
            className="mr-2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              hasChildren && toggleExpand(item.reId);
            }}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="size-5" />
              ) : (
                <ChevronRight className="size-5" />
              )
            ) : (
              <span className="w-4" />
            )}
          </div>

          <RiMoneyDollarCircleLine className="shrink-0" />
          <DefaultTooltip title={item.reName}>
            <span className="ml-2 text-sm max-w-[180px] truncate">
              {item.reName}
            </span>
          </DefaultTooltip>
        </div>

        {/* plus button */}
        <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
          <Button
            variant="ghost"
            className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 ml-2 ${isSelected ? "hover:bg-red-500 hover:text-white" : "hover:bg-white"}`}
            onClick={(e) => {
              e.stopPropagation();
              if (item.reType === "1") {
                setSelectedReType("999");
                setSelectedItem({ reId: item.reId, reType: item.reType });
                triggerNewUsage();
              }
            }}
          >
            <KeenIcon icon="plus" />
          </Button>
        </AccessWrapper>
      </div>

      {/* children */}
      {hasChildren && isExpanded && (
        <ul className="ml-6">
          {item.children.map((child) => (
            <EventNode
              key={child.reId}
              item={child}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              selectedRef={selectedRef}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default EventNode;
