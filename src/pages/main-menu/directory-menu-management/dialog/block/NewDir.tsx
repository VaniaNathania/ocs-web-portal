import { useCompList } from "../../hook/useComp";
import { NewDirContent } from "../content/newDir";
import { DirMenuDialogWrapper } from "../DirMenuDialogWraper";

export const DirMenuNewDir = () => {
  const { showNewDir, setShowNewDir } = useCompList();

  return (
    <DirMenuDialogWrapper
      title="New Directory"
      onClose={() => setShowNewDir(false)}
      detail={false}
      size={{ width: "sm", height: "" }}
      isOpen={showNewDir}
      handleDialog={setShowNewDir}
    >
      <NewDirContent />
    </DirMenuDialogWrapper>
  );
};
