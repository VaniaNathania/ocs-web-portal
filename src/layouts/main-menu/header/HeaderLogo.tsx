import { Link, useLocation, useNavigate } from "react-router-dom";
import { KeenIcon } from "@/components/keenicons";
import { toAbsoluteUrl } from "@/utils";
import {
  IMenuItemConfig,
  Menu,
  MenuArrow,
  MenuIcon,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuToggle,
  TMenuConfig,
} from "@/components/menu";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/i18n";
import { useMenuRoot } from "@/hooks/useMenuRoot";
import clsx from "clsx";
import { useLoaders } from "@/providers";

interface props {
  headerSticky?: boolean;
  isScrolled?: boolean;
}

const HeaderLogo = ({ headerSticky = false, isScrolled = false }: props) => {
  const MENU_ROOT = useMenuRoot();
  const { setScreenLoader } = useLoaders();
  const { pathname } = useLocation();
  const { isRTL } = useLanguage();
  const [selectedMenuItem, setSelectedMenuItem] = useState(MENU_ROOT[0]);
  const [activeChildItem, setActiveChildItem] = useState<any>(null);
  const [allItem, setAllItem] = useState<TMenuConfig>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const rootPath = "/" + pathSegments.slice(0, 2).join("/");

    // console.log("ini menu root", MENU_ROOT);

    // const tempItem: TMenuConfig = [];

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
        // tempItem.push(item);
        setSelectedMenuItem(item);
        const childItem = item.children?.find(
          (child) => child.path === pathname,
        );
        setActiveChildItem(childItem || null);
        document.title = `${item.title}${childItem ? " | " + childItem.title : item.rootPath?.replace("/", "") !== pathSegments[pathSegments.length - 1] ? " | " + pathSegments[pathSegments.length - 1].replace("-", " ") : ""}`;
      } else if (item.children?.some((child) => child.path === pathname)) {
        setSelectedMenuItem(item);
        const childItem = item.children.find(
          (child) => child.path === pathname,
        );
        setActiveChildItem(childItem || null);
        document.title = `${item.title} | ${childItem?.title || ""}`;
      }
      // if (item.children) {
      //   if (item.children?.length > 0) {
      //     item.children.forEach((ch) => tempItem.push(ch));
      //   }
      // } else {
      //   tempItem.push(item);
      // }
    });
    // setAllItem(tempItem);
  }, [pathname]);

  useEffect(() => {
    const temp: TMenuConfig = [];
    MENU_ROOT.forEach((item) => {
      if (item.children) {
        if (item.children?.length > 0) {
          item.children.forEach((ch) => temp.push(ch));
        }
      } else {
        temp.push(item);
      }
    });
    setAllItem(temp);
  }, []);

  const suggestions = useMemo(() => {
    if (!showSuggestions) return [];
    if (!search) return [];
    const q = search.toLowerCase();

    return allItem.filter(
      (p) => p.title?.toLowerCase().includes(q) && p.path !== pathname,
    );
  }, [showSuggestions, search, allItem, pathname]); // Add all dependencies

  const handleSelect = (item: IMenuItemConfig) => {
    //  console.log(item);
    // console.log(item);
    setScreenLoader(true);
    navigate(item.path ?? "");
  };

  return (
    <div className="flex items-center gap-4 lg:gap-6">
      {/* Logo minimal dengan subtle hover */}
      <Link
        to="/"
        className="shrink-0 group relative"
        onClick={() => {
          if (location.pathname != "/") setScreenLoader(true);
        }}
      >
        <img
          src={
            isScrolled
              ? toAbsoluteUrl("/media/logo/Telkomcel.png")
              : toAbsoluteUrl("/media/logo/telkomcel_putih.png")
          }
          className={clsx(
            "h-9 transition-all duration-300 ease-out",
            "group-hover:brightness-110",
          )}
          alt="Telkomcel Logo"
        />
      </Link>

      {/* Separator minimalis */}
      <div className="flex items-center gap-3 min-w-fit">
        <div
          className={clsx(
            "w-px h-8 hidden md:block transition-colors duration-300",
            isScrolled ? "bg-gray-300 dark:bg-gray-600" : "bg-white/30",
          )}
        />

        {/* Menu Dropdown minimalis */}
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
                  : "hover:bg-white/10",
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2">
                  {(activeChildItem?.icon || selectedMenuItem.icon) && (
                    <div
                      className={clsx(
                        "w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-300",
                        isScrolled
                          ? "bg-red-500 text-white"
                          : "bg-white/20 text-white",
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
                        : "text-white",
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
                      "group-hover:rotate-180",
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
                "dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500",
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
                            : "hover:bg-red-50 dark:hover:bg-red-900/20",
                        )}
                      >
                        <MenuLink
                          path={item.path}
                          // path="#"
                          className={clsx(
                            "flex items-center gap-3 px-3 py-2.5",
                            "text-sm font-medium transition-colors duration-200",
                            isActive
                              ? "text-white"
                              : "text-gray-700 dark:text-gray-200",
                          )}
                        >
                          {item.icon && (
                            <MenuIcon>
                              <div
                                className={clsx(
                                  "w-8 h-8 rounded-md flex items-center justify-center",
                                  "transition-colors duration-200",
                                  "bg-gray-100 dark:bg-coal-400",
                                )}
                              >
                                <KeenIcon
                                  icon={item.icon}
                                  className={clsx(
                                    "text-base transition-colors duration-200",
                                    isActive
                                      ? "!text-red-500 !font-bold"
                                      : "text-gray-600 dark:text-gray-300",
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
                                : "hover:bg-red-50 dark:hover:bg-red-900",
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
                            "rounded-lg",
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
                                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700",
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
                        isActive ? "" : "",
                      )}
                    >
                      <MenuLink
                        path={item.path}
                        // path="#"
                        className={clsx(
                          "flex items-center gap-3 px-3 py-2.5",
                          "text-sm font-medium transition-colors duration-200",
                          isActive
                            ? "text-white"
                            : "text-gray-700 dark:text-gray-200",
                        )}
                      >
                        {item.icon && (
                          <MenuIcon>
                            <div
                              className={clsx(
                                "w-8 h-8 rounded-md flex items-center justify-center",
                                "transition-colors duration-200",
                                "bg-gray-100 dark:bg-coal-400",
                              )}
                            >
                              <KeenIcon
                                icon={item.icon}
                                className={clsx(
                                  "text-base transition-colors duration-200",
                                  isActive
                                    ? "!text-red-500 !font-bold"
                                    : "text-gray-600 dark:text-gray-300",
                                )}
                              />
                            </div>
                          </MenuIcon>
                        )}

                        <MenuTitle
                          className={clsx(
                            "flex-1 font-semibold",
                            "transition-colors duration-200 rounded-md",
                            isActive ? "!text-red-500" : "",
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

      <div className="flex flex-col w-full relative">
        <label className="input input-sm w-full flex items-center gap-2 bg-white">
          <KeenIcon icon="magnifier" />
          <input
            type="text"
            placeholder="Module name.."
            className="w-full"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!showSuggestions) setShowSuggestions(true);
            }}
            // onKeyDownCapture={(e) => {
            //   if (e.key === "Enter") setShowSuggestions(true);
            // }}
            onBlur={() => setShowSuggestions(false)} // delay so click still works
            onFocus={() => search && setShowSuggestions(true)}
          />
        </label>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-md z-20 max-h-40 overflow-auto">
            {suggestions.map((p, idx) => (
              <li
                key={idx}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={() => handleSelect(p)} // use onMouseDown so blur doesn’t hide it first
              >
                {p.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export { HeaderLogo };
