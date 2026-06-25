import { BasicSettings, Password } from "./blocks";
import { AccountUserProfileContextProvider } from "./hooks";

const AccountUserProfileContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5 xl:w-[38.75rem] mx-auto p-5">
      <AccountUserProfileContextProvider>
        {/* <BasicSettings /> */}
        <Password />
        {/* <DeleteAccount /> */}
      </AccountUserProfileContextProvider>
    </div>
  );
};

export { AccountUserProfileContent };
