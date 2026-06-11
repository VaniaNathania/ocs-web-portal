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
