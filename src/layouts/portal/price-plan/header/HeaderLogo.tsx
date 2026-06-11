import { Link, useLocation } from "react-router-dom";
import { KeenIcon } from "@/components/keenicons";
import { toAbsoluteUrl } from "@/utils";
import {
  Menu,
  MenuArrow,
  MenuIcon,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuToggle,
} from "@/components/menu";
// import { MENU_ROOT } from "@/config";
import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n";
import { useMenuRoot } from "@/hooks/useMenuRoot";
import clsx from "clsx";

interface props {
  headerSticky?: boolean;
  isScrolled?: boolean;
}

const HeaderLogo = ({ headerSticky = false, isScrolled = false }: props) => {
  const MENU_ROOT = useMenuRoot();

  const { pathname } = useLocation();
  const { isRTL } = useLanguage();
  const [selectedMenuItem, setSelectedMenuItem] = useState(MENU_ROOT[0]);
  const [activeChildItem, setActiveChildItem] = useState<any>(null);

  useEffect(() => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const rootPath = "/" + pathSegments.slice(0, 2).join("/");

    if (rootPath === "/" && pathSegments.length === 0) {
      const dashboardItem = MENU_ROOT.find((item) => item.rootPath === "/");
      if (dashboardItem) {
        setSelectedMenuItem(dashboardItem);
        setActiveChildItem(null);
        document.title = dashboardItem.title || "Dashboard";
        return;
      }
    }

    MENU_ROOT.forEach((item) => {
      if (item.rootPath != "/" && rootPath.includes(item.rootPath ?? "")) {
        setSelectedMenuItem(item);
        const childItem = item.children?.find(
          (child) => child.path === pathname
        );
        setActiveChildItem(childItem || null);
        document.title = `${item.title}${childItem ? " | " + childItem.title : item.rootPath?.replace("/", "") !== pathSegments[pathSegments.length - 1] ? " | " + pathSegments[pathSegments.length - 1].replace("-", " ") : ""}`;
      } else if (item.children?.some((child) => child.path === pathname)) {
        setSelectedMenuItem(item);
        const childItem = item.children.find(
          (child) => child.path === pathname
        );
        setActiveChildItem(childItem || null);
        document.title = `${item.title} | ${childItem?.title || ""}`;
      }
    });
  }, [pathname]);

  return (
    // <div className="flex items-center gap-2 lg:gap-5 2xl:-ml-[60px]">
    <div className="flex items-center gap-2 lg:gap-5">
      <Link to="/" className="shrink-0">
        {/* <img
          src={toAbsoluteUrl('/media/app/mini-logo-circle.svg')}
          className="dark:hidden min-h-[42px]"
          alt="logo"
        />
        <img
          src={toAbsoluteUrl('/media/app/mini-logo-circle-dark.svg')}
          className="hidden dark:inline-block min-h-[42px]"
          alt="logo"
        /> */}
        <img
          src={toAbsoluteUrl("/media/logo/Telkomcel.png")}
          className="dark:hidden h-10"
          alt="logo"
        />
        <img
          src={toAbsoluteUrl("/media/logo/Telkomcel.png")}
          className="hidden dark:inline-block min-h-[42px]"
          alt="logo"
        />
      </Link>

      <div className="flex items-center">
        <h3 className="text-gray-700 text-base hidden md:block">Telkomcel</h3>
        <span className="text-sm text-gray-400 font-medium px-2.5 hidden md:inline">
          /
        </span>

        <Menu className="menu-default">
          <MenuItem
            toggle="dropdown"
            trigger="hover"
            dropdownProps={{
              placement: isRTL() ? "bottom-end" : "bottom-start",
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, 10],
                  },
                },
              ],
            }}
          >
            <MenuToggle
              className={clsx(
                "group relative px-4 py-2 rounded-lg transition-all duration-300",
                isScrolled
                  ? "hover:bg-red-50 dark:hover:bg-red-900/20"
                  : "hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2">
                  {(activeChildItem?.icon || selectedMenuItem.icon) && (
                    <div
                      className={clsx(
                        "w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-300",
                        isScrolled
                          ? "bg-red-500 text-black"
                          : "bg-white/20 text-black"
                      )}
                    >
                      <KeenIcon
                        icon={activeChildItem?.icon || selectedMenuItem.icon}
                        className="text-sm"
                      />
                    </div>
                  )}

                  <span
                    className={clsx(
                      "font-semibold text-base transition-colors duration-300",
                      isScrolled
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-black"
                    )}
                  >
                    {activeChildItem
                      ? activeChildItem.title
                      : selectedMenuItem.title}
                  </span>
                </div>

                <MenuArrow>
                  <div
                    className={clsx(
                      "transition-all duration-300",
                      isScrolled
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-white/90",
                      "group-hover:rotate-180"
                    )}
                  >
                    <KeenIcon icon="down" className="text-sm" />
                  </div>
                </MenuArrow>
              </div>
            </MenuToggle>

            {/* Dropdown menu minimalis dengan scroll internal */}
            <MenuSub
              className={clsx(
                "menu-default w-56",
                "shadow-lg border border-gray-200 dark:border-gray-700",
                "bg-white dark:bg-coal-500",
                "rounded-lg",
                "max-h-[calc(100vh-100px)] overflow-y-auto overflow-x-hidden",
                // Custom scrollbar - modern & minimal
                "[&::-webkit-scrollbar]:w-1.5",
                "[&::-webkit-scrollbar-track]:bg-transparent",
                "[&::-webkit-scrollbar-thumb]:bg-gray-300",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                "[&::-webkit-scrollbar-thumb]:hover:bg-gray-400",
                "dark:[&::-webkit-scrollbar-thumb]:bg-gray-600",
                "dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500"
              )}
            >
              <div className="p-2 space-y-1">
                {MENU_ROOT.map((item, index) => {
                  const hasChildren = item.children && item.children.length > 0;
                  const isActive =
                    item.title === selectedMenuItem.title ||
                    item.children?.some((child) => child.path === pathname);

                  if (hasChildren) {
                    return (
                      <MenuItem
                        key={index}
                        toggle="dropdown"
                        trigger="hover"
                        dropdownProps={{
                          placement: isRTL() ? "left-start" : "right-start",
                          modifiers: [
                            {
                              name: "offset",
                              options: { offset: [-10, 0] },
                            },
                          ],
                        }}
                        className={clsx(
                          "transition-colors duration-200 rounded-md overflow-hidden",
                          isActive
                            ? ""
                            : "hover:bg-red-50 dark:hover:bg-red-900/20"
                        )}
                      >
                        <MenuLink
                          path={item.path}
                          className={clsx(
                            "flex items-center gap-3 px-3 py-2.5",
                            "text-sm font-medium transition-colors duration-200",
                            isActive
                              ? "text-white"
                              : "text-gray-700 dark:text-gray-200"
                          )}
                        >
                          {item.icon && (
                            <MenuIcon>
                              <div
                                className={clsx(
                                  "w-8 h-8 rounded-md flex items-center justify-center",
                                  "transition-colors duration-200",
                                  "bg-gray-100 dark:bg-coal-400"
                                )}
                              >
                                <KeenIcon
                                  icon={item.icon}
                                  className={clsx(
                                    "text-base transition-colors duration-200",
                                    isActive
                                      ? "!text-red-500 !font-bold"
                                      : "text-gray-600 dark:text-gray-300"
                                  )}
                                />
                              </div>
                            </MenuIcon>
                          )}

                          <MenuTitle
                            className={clsx(
                              "flex-1 font-semibold",
                              "transition-colors duration-200 rounded-md",
                              isActive
                                ? "!text-red-500"
                                : "hover:bg-red-50 dark:hover:bg-red-900"
                            )}
                          >
                            {item.title}
                          </MenuTitle>

                          <MenuArrow>
                            <KeenIcon
                              icon="right"
                              className="text-xs text-gray-500"
                            />
                          </MenuArrow>

                          {isActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </MenuLink>

                        <MenuSub
                          className={clsx(
                            "menu-default w-48",
                            "shadow-lg border border-gray-200 dark:border-gray-700",
                            "bg-white dark:bg-coal-500",
                            "rounded-lg"
                          )}
                        >
                          {item.children?.map((child, childIndex) => (
                            <MenuItem key={childIndex}>
                              <MenuLink
                                path={child.path}
                                className={clsx(
                                  "flex items-center gap-2 px-3 py-2",
                                  "text-sm font-medium transition-colors duration-200",
                                  pathname === child.path
                                    ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                                )}
                              >
                                {child.icon && (
                                  <MenuIcon>
                                    <KeenIcon
                                      icon={child.icon}
                                      className="text-sm"
                                    />
                                  </MenuIcon>
                                )}

                                <MenuTitle>{child.title}</MenuTitle>
                              </MenuLink>
                            </MenuItem>
                          ))}
                        </MenuSub>
                      </MenuItem>
                    );
                  }

                  return (
                    <MenuItem
                      key={index}
                      className={clsx(
                        "transition-colors duration-200 rounded-md",
                        isActive ? "" : ""
                      )}
                    >
                      <MenuLink
                        path={item.path}
                        className={clsx(
                          "flex items-center gap-3 px-3 py-2.5",
                          "text-sm font-medium transition-colors duration-200",
                          isActive
                            ? "text-white"
                            : "text-gray-700 dark:text-gray-200"
                        )}
                      >
                        {item.icon && (
                          <MenuIcon>
                            <div
                              className={clsx(
                                "w-8 h-8 rounded-md flex items-center justify-center",
                                "transition-colors duration-200",
                                "bg-gray-100 dark:bg-coal-400"
                              )}
                            >
                              <KeenIcon
                                icon={item.icon}
                                className={clsx(
                                  "text-base transition-colors duration-200",
                                  isActive
                                    ? "!text-red-500 !font-bold"
                                    : "text-gray-600 dark:text-gray-300"
                                )}
                              />
                            </div>
                          </MenuIcon>
                        )}

                        <MenuTitle
                          className={clsx(
                            "flex-1 font-semibold",
                            "transition-colors duration-200 rounded-md",
                            isActive ? "!text-red-500" : ""
                          )}
                        >
                          {item.title}
                        </MenuTitle>

                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </MenuLink>
                    </MenuItem>
                  );
                })}
              </div>
            </MenuSub>
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export { HeaderLogo };
