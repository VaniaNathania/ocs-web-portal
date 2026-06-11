import { Button } from "@/components/ui/button";
import { useLifeCycle } from "../../../hooks/context";
import { useEdgeDialog } from "../hooks/context";
import { Edge } from "@xyflow/react";
import { edgeData } from "../../../interface";
import { toast } from "sonner";

const FooterBtn = () => {
  const {
    edges,
    selectedEdge,
    setEdges,
    setEdgeDialog,
    isEditing,
    deleteSelected,
  } = useLifeCycle();
  const { eventList, edge, FormValid, watch, updateEventList, recAdvice } =
    useEdgeDialog();
  const formVal = watch();

  const SaveEdge = async () => {
    if (eventList.length === 0) {
      deleteSelected();
      setEdgeDialog(false);
    }

    const isFormValid = await FormValid();
    if (!isFormValid) return toast.error("Form Not Valid");
    if (!selectedEdge) return toast.error("Please Select Edge");
    // updateEventList(formVal);
    const edgeIdx = edges.findIndex((item) => item.id === selectedEdge?.id);
    if (!edge?.data) return;
    const data: any = edge?.data;
    const { jsonData } = data as edgeData;
    const edgeData: edgeData = {
      jsonData: {
        ...jsonData,
        userData: {
          ...jsonData.userData,
          eventList: eventList.map((evl) => {
            if (evl.subsEventId != formVal.subsEventId) return evl;
            return {
              ...formVal,
              adviceType: recAdvice.map((item) => item.adviceType.toString()),
            };
          }),
        },
      },
    };
    const updatedEdge: Edge = {
      ...selectedEdge,
      data: {
        jsonData: edgeData.jsonData,
      },
    };
    const temp = [...edges]; // ✅ copy array
    temp[edgeIdx] = updatedEdge;
    if (edgeIdx >= 0) {
      setEdges(temp); // ✅ new reference
      setEdgeDialog(false);
    } else {
      setEdges((prev) => [...prev, updatedEdge]);
    }
  };

  return (
    <div className="flex flex-row gap-2 justify-end">
      <Button size={"sm"} onClick={SaveEdge} disabled={!isEditing}>
        Save
      </Button>
      <Button
        size={"sm"}
        variant={"outline"}
        disabled={!isEditing}
        onClick={() => setEdgeDialog(false)}
      >
        Cancel
      </Button>
    </div>
  );
};

export default FooterBtn;
