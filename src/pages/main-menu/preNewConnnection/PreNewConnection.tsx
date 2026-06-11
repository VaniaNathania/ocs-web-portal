import Main from "./blocks/main";
import { PreNewProvider } from "./hooks/context";

const PreNewConection = () => {
  return (
    <PreNewProvider>
      <Main />
    </PreNewProvider>
  );
};

export default PreNewConection;
