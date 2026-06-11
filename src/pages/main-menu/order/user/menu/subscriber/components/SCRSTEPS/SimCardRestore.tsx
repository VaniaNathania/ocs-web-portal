import { SCRProvider } from "./hooks/context";
import Main from "./blocks/main";

const SimCardRestore = () => {
  return (
    <SCRProvider>
      <Main />
    </SCRProvider>
  );
};

export default SimCardRestore;
