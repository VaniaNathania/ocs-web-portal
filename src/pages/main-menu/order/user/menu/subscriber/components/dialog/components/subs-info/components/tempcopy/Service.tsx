import Main from "./blocks/main";
import { ServiceProvider } from "./hooks/ServiceContext";

const Service = () => {
  return (
    <ServiceProvider>
      <Main />
    </ServiceProvider>
  );
};

export default Service;
