import { CSNProvider } from "./hooks/context";
import Main from "./blocks/main";

const ChangeSubsProf = () => {
  return (
    <CSNProvider>
      <Main />
    </CSNProvider>
  );
};

export default ChangeSubsProf;
