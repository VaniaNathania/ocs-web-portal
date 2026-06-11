import Main from "./blocks/Main";
import { SimNumberBindUnbindContextProvider } from "./hooks/SimNumberBindUnbindContext";

const SimNumberBindUnbindPage = () => {
  return (
    <SimNumberBindUnbindContextProvider>
      <Main />
    </SimNumberBindUnbindContextProvider>
  );
};

export default SimNumberBindUnbindPage;
