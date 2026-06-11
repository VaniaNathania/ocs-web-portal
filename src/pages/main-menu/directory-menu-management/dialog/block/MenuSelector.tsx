import { useCompList } from "../../hook/useComp";
import DirMenuSelectorContent from "../content/MenuSelector/dirMenuSelector";
import { DirMenuDialogWrapper } from "../DirMenuDialogWraper";

export const DirMenuMenuSelector = () => {
  const { showMenuSelector, setShowMenuSelector } = useCompList();

  return (
    <DirMenuDialogWrapper
      title="Menu Selector"
      onClose={() => setShowMenuSelector(false)}
      detail={false}
      size={{ width: "6xl", height: "" }}
      isOpen={showMenuSelector}
      handleDialog={setShowMenuSelector}
    >
      <DirMenuSelectorContent />
    </DirMenuDialogWrapper>
  );
};
