import { ShareToOtherProvider } from "./hooks/context";
import Main from "./blocks/main";

const ShareToOtherTable = () => {
  return (
    <ShareToOtherProvider>
      <Main />
    </ShareToOtherProvider>
  );
};

export default ShareToOtherTable;
