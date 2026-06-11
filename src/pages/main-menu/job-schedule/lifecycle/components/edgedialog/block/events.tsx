import { useEffect, useState } from "react";
import { edgeData, EventList, UserData } from "../../../interface";
import { useEdgeDialog } from "../hooks/context";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
import { useLifeCycle } from "../../../hooks/context";

const Events = () => {
  const {
    eventList,
    addEvent,
    selectedEvent,
    recordEvent,
    setSelectedEvent,
    delEvent,
    moveEvent,
  } = useEdgeDialog();
  const { isEditing } = useLifeCycle();

  return (
    <div className="flex flex-row overflow-x-auto w-full items-center gap-2">
      {eventList?.map((item, index) => {
        const isSelected = selectedEvent?.subsEventId === item.subsEventId;
        return (
          <div
            className={`cursor-pointer text-sm relative flex-shrink-0
              ${isSelected ? "border-primary border-b-2" : "border-none"}`}
            key={index}
          >
            {isSelected && (
              <Button
                className="absolute top-0 right-0 translate-x-1/2  bg-primary rounded-full p-0
            text-white w-[14px] h-[14px] flex items-center text-2xs justify-center hover:w-[15px] hover:h-[15px]"
                onClick={() => delEvent(item)}
                disabled={!isEditing}
              >
                <KeenIcon icon="cross" />
              </Button>
            )}
            <div
              key={index}
              className="text-sm"
              onClick={() => moveEvent(item)}
            >
              {recordEvent.current
                ? (recordEvent.current[item.subsEventId] ?? "New Event")
                : "New Event"}
            </div>
          </div>
        );
      })}
      <Button
        size={"sm"}
        variant={"ghost"}
        onClick={addEvent}
        disabled={!isEditing}
      >
        <KeenIcon icon="plus" /> Add Event
      </Button>
    </div>
  );
};

export default Events;
