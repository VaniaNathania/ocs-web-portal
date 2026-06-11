import Main from "./blocks/main";
import { PFDialProvider } from "./hooks/context";

const PFDial = () => {
  return (
    <PFDialProvider>
      <Main />
    </PFDialProvider>
  );
};

export default PFDial;
