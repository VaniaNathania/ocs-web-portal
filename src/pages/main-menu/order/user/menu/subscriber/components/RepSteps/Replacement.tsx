import { ReplacementProvider } from "./hooks/context";
import Main from "./blocks/main";

const Replacement = () => {
  return (
    <ReplacementProvider>
      <Main />
    </ReplacementProvider>
  );
};

export default Replacement;
