import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import { useLifeCycle } from "../../hooks/context";
import { nodeData } from "../nodeLifecycle";
import { edgeData } from "../../interface";
import Main from "./block/main";
import { EdgeDialogProvider } from "./hooks/context";

const EdgeDialog = () => {
  const { edgeDialog, setEdgeDialog, selectedEdge } = useLifeCycle();

  if (!selectedEdge?.data) return;
  const data: any = selectedEdge?.data;
  const { jsonData } = data as edgeData;
  //   typeof selectedEdge?.label === "string" ? selectedEdge?.label : ""

  return (
    <DialogWrapper
      isOpen={edgeDialog}
      handleDialog={setEdgeDialog}
      title="Product Event Diagram"
      desc={`${jsonData.userData.startState?.prodStateName}->${jsonData.userData.endState?.prodStateName}`}
      size={{ width: "2xl" }}
    >
      <EdgeDialogProvider>
        <Main />
      </EdgeDialogProvider>
    </DialogWrapper>
  );
};

export default EdgeDialog;
