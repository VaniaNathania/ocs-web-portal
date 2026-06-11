import Main from "./blocks/main";
import { ModSubsProvider } from "./hooks/context";

const ModSubsForm = () => {
  return (
    <ModSubsProvider>
      <Main />
    </ModSubsProvider>
  );
};

export default ModSubsForm;
