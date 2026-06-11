import { SURProvider } from "./hooks/context";
import Main from "./block/main";
const SuspensionUnderRequest = () => {
  return (
    <SURProvider>
      <Main />
    </SURProvider>
  );
};

export default SuspensionUnderRequest;
