import Main from "./blocks/main";
import { WholesaleMonitorProvider } from "./hooks/context";

const WholesaleMonitor = () => {
  return (
    <WholesaleMonitorProvider>
      <Main />
    </WholesaleMonitorProvider>
  );
};

export default WholesaleMonitor;
