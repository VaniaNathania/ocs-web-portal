import { useCompList } from "../../hook/useComp";
import { ImportContent } from "../content/import";
import { DirMenuDialogWrapper } from "../DirMenuDialogWraper";

export const DirMenuImport = () => {
  const { showImport, setShowImport } = useCompList();

  return (
    <DirMenuDialogWrapper
      title="Import"
      onClose={() => setShowImport(false)}
      detail={false}
      size={{ width: "md", height: "" }}
      isOpen={showImport}
      handleDialog={setShowImport}
    >
      <ImportContent />
    </DirMenuDialogWrapper>
  );
};
