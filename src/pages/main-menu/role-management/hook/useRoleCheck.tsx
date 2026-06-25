import { AUTH_LOCAL_STORAGE_KEY } from "@/auth";
import { cloneElement, ReactElement } from "react";
import { DefaultTooltip } from "@/components";
import { getData } from "@/utils";

export interface menuAuth {
  privId: number;
  privName: string;
  addStatus: "N" | "Y";
  deleteStatus: "N" | "Y";
  editStatus: "N" | "Y";
  readStatus: "N" | "Y";
  comments: string;
  url: string;
  iconUrl: string;
}

export interface menuAccess {
  addStatus: boolean;
  deleteStatus: boolean;
  editStatus: boolean;
  readStatus: boolean;
}

export const useRoleCheck = () => {
  const authData = getData(AUTH_LOCAL_STORAGE_KEY);
  const menus: menuAuth[] = authData?.menus ?? [];

  // //  console.log(menus);

  const checkMenus = (key: string): boolean => {
    return (
      menus?.some((menu: menuAuth) =>
        menu.privName.toLowerCase().includes(key.toLowerCase()),
      ) ?? false
    );
  };

  const checkMenusPriv = (
    url: string,
    priv: "addStatus" | "readStatus" | "deleteStatus" | "editStatus",
  ): boolean => {
    const menusPriv = menus.filter((data) =>
      data?.url?.toLowerCase().includes(url.toLowerCase()),
    );

    const havePrivilege = menusPriv.some(
      (menu: menuAuth) => menu[priv] === "Y",
    );
    // console.log(menusPriv, havePrivilege, namePriv);

    return havePrivilege;
  };

  const isHaveMenu = menus != undefined;

  return { checkMenus, isHaveMenu, checkMenusPriv };
};

interface AccessWrapperProps {
  hasAccess?: boolean; // whether user has access
  tooltipText?: string; // optional tooltip
  enabledText?: string;
  children: ReactElement; // must be a single component (e.g. Button)
  type?: "card" | "button";
  className?: string;
}

export const AccessWrapper = ({
  hasAccess = false,
  tooltipText = "you need access",
  children,
  enabledText = "",
  type = "button",
  className = "",
}: AccessWrapperProps) => {
  const shouldDisable = false;
  // console.log(hasAccess);

  return (
    <DefaultTooltip
      placement="top"
      title={shouldDisable ? tooltipText : enabledText}
    >
      <div className={"relative" + " " + className}>
        {type === "card" && shouldDisable && (
          <div
            className={`absolute inset-0 backdrop-blur-sm bg-white/30 z-10 rounded-lg`}
          />
        )}
        {cloneElement(children, {
          disabled: shouldDisable || children.props.disabled,
          // className: children.props.className + " " + className,
        })}
      </div>
    </DefaultTooltip>
  );
};
