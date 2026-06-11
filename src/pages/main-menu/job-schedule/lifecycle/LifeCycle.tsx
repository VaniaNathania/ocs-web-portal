import Main from "./blocks/main";
import PopUpAddLifeCycle from "./components/popUpAddLifeCycle";
import { LifeCycleProvider } from "./hooks/context";

const LifeCycleType = () => {
  return (
    <LifeCycleProvider>
      <PopUpAddLifeCycle />

      <Main />
    </LifeCycleProvider>
  );
};

export default LifeCycleType;
