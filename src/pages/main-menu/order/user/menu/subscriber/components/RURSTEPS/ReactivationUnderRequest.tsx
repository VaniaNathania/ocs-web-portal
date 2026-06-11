import { RURProvider } from "./hooks/context";
import Main from "./block/main";
const ReactivationUnderRequest = () => {
  return (
    <RURProvider>
      <Main />
    </RURProvider>
  );
};

export default ReactivationUnderRequest;
