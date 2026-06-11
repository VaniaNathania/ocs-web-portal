import Main from "./blocks/main";
import { MultiTabProvider } from "./hooks/provider";

export const MultiTab = () => {
  return (
    <MultiTabProvider>
      <Main />
    </MultiTabProvider>
  );
};

export default MultiTab;
