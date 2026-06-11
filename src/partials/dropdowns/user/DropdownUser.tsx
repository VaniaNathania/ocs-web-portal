import { Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { getAuth, useAuthContext } from "@/auth";

import { toAbsoluteUrl } from "@/utils";
// import { DropdownUserLanguages } from './DropdownUserLanguages';
import { KeenIcon } from "@/components";
import {
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuSeparator,
  MenuArrow,
  MenuIcon,
} from "@/components/menu";
import useMultiTab from "@/layouts/multiTab/hooks/useContext";
import { Button } from "@/components/ui/button";

interface IDropdownUserProps {
  menuItemRef: any;
}

// const cachedUser = getAuth()?.user;
// console.log('cachedUser :', cachedUser);
// const parsedUser = cachedUser ? cachedUser : null;

const DropdownUser = ({ menuItemRef }: IDropdownUserProps) => {
  const { logout, auth } = useAuthContext();
  const { openProfile } = useMultiTab();
  // const navigate = useNavigate();

  const buildHeader = () => {
    return (
      <div className="flex items-center justify-between px-5 py-1.5 gap-1.5">
        <div className="flex items-center gap-2">
          {/* <img
            className="size-9 rounded-full border-2 border-success"
            src={toAbsoluteUrl('/media/avatars/300-2.png')}
            alt=""
          /> */}
          <div className="flex flex-col">
            <p className="text-[14px] text-gray-800 font-semibold">
              {auth?.user.name}
            </p>
            <p className="text-xs text-gray-600 hover:text-primary font-medium leading-none">
              {auth?.user.email}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const buildMenu = () => {
    return (
      <Fragment>
        <MenuSeparator />
        <div className="flex flex-col">
          {/* <MenuItem>
            <MenuLink handleClick={openProfile}>
              <MenuIcon>
                <KeenIcon icon="profile-circle" />
              </MenuIcon>
              <MenuTitle>
                <FormattedMessage id="USER.MENU.MY_PROFILE" />
              </MenuTitle>
            </MenuLink>
          </MenuItem> */}
          <Button
            variant={"ghost"}
            className="flex flex-row justify-start gap-5"
            onClick={openProfile}
          >
            <KeenIcon icon="profile-circle" />
            <FormattedMessage id="USER.MENU.MY_PROFILE" />
          </Button>
          {/* <DropdownUserLanguages menuItemRef={menuItemRef} /> */}
          <MenuSeparator />
        </div>
      </Fragment>
    );
  };

  const buildFooter = () => {
    return (
      <div className="flex flex-col">
        <div className="menu-item px-4 py-1.5">
          <a
            onClick={() => {
              logout();
              // navigate("/auth/login");
            }}
            className="btn btn-sm btn-light justify-center"
          >
            <FormattedMessage id="USER.MENU.LOGOUT" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <MenuSub
      className="menu-default light:border-gray-300 w-[200px] md:w-[250px]"
      rootClassName="p-0"
    >
      {buildHeader()}
      {buildMenu()}
      {buildFooter()}
    </MenuSub>
  );
};

export { DropdownUser };
