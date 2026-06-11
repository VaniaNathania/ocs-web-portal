import Main from "./blocks/main";
import { RegisterCustInfoProvider } from "./hooks/context";

const RegisterCustInfo = () => {
  return (
    <RegisterCustInfoProvider>
      <Main />
    </RegisterCustInfoProvider>
  );
};

export default RegisterCustInfo;
