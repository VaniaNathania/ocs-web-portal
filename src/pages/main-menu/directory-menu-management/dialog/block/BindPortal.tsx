import { useCompList } from "../../hook/useComp";
import { DirMenuBindPortalContent } from "../content/BindPortal/grantPortal";
import { DirMenuBindPortalContext } from "../content/BindPortal/hook/DirMenuBindPortalProvider";
import { DirMenuDialogWrapper } from "../DirMenuDialogWraper";

export const DirMenuBindPortal = () => {
  const { showBindPortal, setShowBindPortal } = useCompList();

  return (
    <DirMenuDialogWrapper
      title="User Bind Portal"
      onClose={() => setShowBindPortal(false)}
      isOpen={showBindPortal}
      handleDialog={setShowBindPortal}
    >
      <DirMenuBindPortalContent />
    </DirMenuDialogWrapper>
  );
};
