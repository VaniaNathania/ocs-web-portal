import { useRef } from "react";
import { KeenIcon } from "@/components/keenicons";
import { toAbsoluteUrl } from "@/utils";
import {
  DefaultTooltip,
  Menu,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuToggle,
} from "@/components";
import { DropdownUser } from "@/partials/dropdowns/user";
import { useLanguage } from "@/i18n";
import useMultiTab from "../../hooks/useContext";
import { PortalData } from "@/pages/main-menu/role-management/outlet/portal/hook/PortalProvider";
import clsx from "clsx";

interface props {
  isScrolled?: boolean;
}

const HeaderTopbar = ({ isScrolled = false }: props) => {
  const itemUserRef = useRef<any>(null);
  const { isRTL } = useLanguage();
  const { userPortalQuery, setActivePortal, activePortal } = useMultiTab();

  // console.log(itemUserRef);

  return (
    <div className="flex items-center gap-3.5">
      <DefaultTooltip title="User Portal">
              <div>
                <Menu>
                  <MenuItem
                    toggle="dropdown"
                    trigger="click"
                    dropdownProps={{
                      placement: isRTL() ? "bottom-start" : "bottom-end",
                      modifiers: [
                        {
                          name: "offset",
                          options: { offset: [20, 10] },
                        },
                      ],
                    }}
                  >
                    <MenuToggle
                      className={clsx(
                        "group relative rounded-lg transition-all duration-300",
                        isScrolled
                          ? "text-gray-900 dark:text-gray-100"
                          : "text-white",
                      )}
                    >
                      <KeenIcon icon="abstract-26" />
                    </MenuToggle>
      
                    <MenuSub className="menu-default w-[200px] p-2">
                      {userPortalQuery?.data?.map((portal: PortalData) => {
                        const isActive = portal.portalId === activePortal?.portalId;
                        return (
                          <MenuItem
                            key={portal.portalId}
                            onClick={() => setActivePortal(portal)}
                          >
                            <MenuLink
                              // path={item.path}
                              // path="#"
                              className={clsx(
                                "flex items-center gap-3 px-3 py-2.5",
                                "text-sm font-medium transition-colors duration-200",
                                isActive
                                  ? "text-white"
                                  : "text-gray-700 dark:text-gray-200",
                              )}
                            >
                              <MenuTitle
                                className={clsx(
                                  "flex-1 font-semibold",
                                  "transition-colors duration-200 rounded-md",
                                  isActive ? "!text-red-500" : "",
                                )}
                              >
                                {portal.portalName}
                              </MenuTitle>
      
                              {isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </MenuLink>
                          </MenuItem>
                        );
                      })}
      
                      {!userPortalQuery?.data?.length && (
                        <MenuItem>
                          <MenuLink className="text-gray-400">
                            No portal available
                          </MenuLink>
                        </MenuItem>
                      )}
                    </MenuSub>
                  </MenuItem>
                </Menu>
              </div>
            </DefaultTooltip>
      <DefaultTooltip title="Profile">
        <div>
          <Menu>
            <MenuItem
              ref={itemUserRef}
              toggle="dropdown"
              trigger="click"
              dropdownProps={{
                placement: isRTL() ? "bottom-start" : "bottom-end",
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [20, 10], // [skid, distance]
                    },
                  },
                ],
              }}
            >
              <MenuToggle className="btn btn-icon rounded-full">
                <img
                  className="size-9 rounded-full justify-center border border-gray-500 shrink-0"
                  src={toAbsoluteUrl("/media/avatars/blank.png")}
                  alt=""
                />
              </MenuToggle>
              {DropdownUser({ menuItemRef: itemUserRef })}
            </MenuItem>
          </Menu>
        </div>
      </DefaultTooltip>
    </div>
  );
};

export { HeaderTopbar };
