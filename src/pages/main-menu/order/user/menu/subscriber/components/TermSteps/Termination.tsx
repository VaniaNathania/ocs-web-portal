import { TerminationProvider } from "./hooks/context";
import Main from "./block/main";
const Termination = () => {
  return (
    <TerminationProvider>
      <Main />
    </TerminationProvider>
  );
};

export default Termination;
