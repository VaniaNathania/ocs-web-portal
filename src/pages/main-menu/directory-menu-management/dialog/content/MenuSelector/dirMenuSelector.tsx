import { DirMenuSelectorProvider } from "./hook/DirMenuSelectoProvider";
import { DirMenuSelectorMain } from "./main";

const DirMenuSelectorContent = () => {
  return (
    <DirMenuSelectorProvider>
      <DirMenuSelectorMain />
    </DirMenuSelectorProvider>
  );
};

export default DirMenuSelectorContent;
