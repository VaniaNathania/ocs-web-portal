import Main from "./blocks/main";
import { ProdStateStackProvider } from "./hooks/ProdStateStackContext";

const ProdStateStack = () => {
  return (
    <ProdStateStackProvider>
      <Main />
    </ProdStateStackProvider>
  );
};

export default ProdStateStack;
