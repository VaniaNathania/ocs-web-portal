import Main from "./blocks/main";
import { OneWayBlockOweProvider } from "./hooks/context";

const OneWayBlockOwe = () => {
  return (
    <OneWayBlockOweProvider>
      <Main />
    </OneWayBlockOweProvider>
  );
};

export default OneWayBlockOwe;
