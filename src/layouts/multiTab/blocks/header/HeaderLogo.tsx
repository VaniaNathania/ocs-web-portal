import { KeenIcon } from "@/components/keenicons";
import {
  Menu,
  MenuArrow,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuToggle,
} from "@/components/menu";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import useMultiTab from "../../hooks/useContext";
import { Party } from "@/pages/main-menu/directory-menu-management/hook/CompProvider";
import { apiConfigRole } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getData, toAbsoluteUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { AUTH_LOCAL_STORAGE_KEY } from "@/auth";
import { menuAuth } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface props {
  headerSticky?: boolean;
  isScrolled?: boolean;
}

const API_POT = apiConfigRole.role;

const HeaderLogo = ({ headerSticky = false, isScrolled = false }: props) => {
  const { allTab, activeTab, openTab, activePortal, openByPath, openHome } =
    useMultiTab();
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const authData = getData(AUTH_LOCAL_STORAGE_KEY);
  const menus: menuAuth[] = authData?.menus ?? [];
  const [tabConvert, setTabConvert] = useState<Party[]>([]);
  const [search, setSearch] = useState<string>("");
  const { GetData } = useCallApi();

  const fetchAllDirMenu = async (): Promise<Party[]> => {
    try {
      if (!activePortal) return [];
      const resp = await GetData(
        `${API_POT}/api/portals/${activePortal.portalId}/dirMenus`,
        { spId: 0, portal: activePortal.portalId },
      );

      if (!resp.status) {
        toast.error(resp.message);

        return [];
      }
      const temp: Party[] = resp.data;

      // console.log(temp);

      // console.log("ini data nya", temp);

      return temp;
    } catch (error) {
      console.error("Failed to fetch All Dir");
      return [];
    }
  };

  const HeaderAllDirQuery: UseQueryResult<Party[]> = useQuery({
    queryKey: ["header-all-dir", activePortal],
    queryFn: fetchAllDirMenu,
    enabled: !!activePortal,
    staleTime: 1000 * 60 * 10, // 10 minutes (master data rarely changes)
    refetchOnWindowFocus: false,
  });

  const getDirChild = (partyId: number) => {
    return HeaderAllDirQuery.data?.filter((item) => item.parentId === partyId);
  };

  const RenderMenu = (parentId: number | null) => {
    return HeaderAllDirQuery.data
      ?.filter((item) => item.parentId === parentId)
      .map((item) => {
        if (
          item.type === "1" &&
          !menus.find((m) => m.readStatus === "Y" && m.url === item.url)
        ) {
          return;
        }
        const children = item.type == "1" ? [] : getDirChild(item.partyId);
        const hasChildren = children && children.length > 0;

        return (
          <MenuItem
            key={item.partyId}
            className="relative"
            onClick={() => {
              if (item.type === "1") openByPath(item);
            }}
            // containerProps={{es}}
            toggle={hasChildren ? "dropdown" : undefined}
            trigger={hasChildren ? "hover" : undefined}
            dropdownProps={
              hasChildren
                ? {
                    placement: "right-start",
                    modifiers: [
                      {
                        name: "offset",
                        // options: { offset: [0, 10] }, // prevent flicker
                      },
                    ],
                  }
                : undefined
            }
          >
            <MenuLink className="px-3 py-2 flex flex-row items-center justify-between">
              <MenuTitle className="gap-1">
                <KeenIcon icon={item.type === "0" ? "folder" : "document"} />
                <span>{item.partyName}</span>
              </MenuTitle>

              {hasChildren && (
                <KeenIcon icon="right" className="text-xs opacity-60" />
              )}
            </MenuLink>

            {hasChildren && (
              <MenuSub
                className={clsx(
                  "menu-default w-56",
                  // "h-[calc(100vh-100px)]",
                  "max-h-[calc(100vh-100px)]",

                  "overflow-y-auto overflow-x-visible",

                  "relative",

                  "shadow-lg border border-gray-200 dark:border-gray-700",
                  "bg-white dark:bg-coal-500",
                  "rounded-lg",
                )}
              >
                {RenderMenu(item.partyId)}
              </MenuSub>
            )}
          </MenuItem>
        );
      });
  };

  useEffect(() => {
    const temp: Party[] = [];

    // allTab.forEach((tab) => {
    //   const tempMenu: menuAuth | undefined = menus.find(
    //     (m) => m.url === tab.path && m.readStatus === "Y",
    //   );
    //   if (tempMenu) {
    //     temp.push({
    //       ...tab,
    //       id: tempMenu.privName,
    //       title: tempMenu.privName,
    //     });
    //   }
    // });
    HeaderAllDirQuery.data?.forEach((item) => {
      if (
        item.type === "1" &&
        menus.find((m) => m.addStatus === "Y" && m.url === item.url) &&
        !temp.find((m) => m.partyId == item.partyId)
      ) {
        temp.push(item);
      }
    });
    setTabConvert(temp);
  }, [HeaderAllDirQuery.data]);

  const suggestions = useMemo(() => {
    if (!showSuggestions) return [];
    if (!search) return [];
    const q = search.toLowerCase();

    return tabConvert.filter(
      (p) =>
        p.partyName?.toLowerCase().includes(q) && p.partyName !== activeTab,
    );
  }, [showSuggestions, search, tabConvert, activeTab]); // Add all dependencies

  const handleSelect = (item: Party) => {
    // console.log(item);
    openByPath(item);
  };
  return (
    <div className="flex items-center gap-4 lg:gap-6">
      <Link
        to="/"
        className="shrink-0 group relative"
        onClick={() => {
          openHome();
        }}
      >
        
      </Link>
      {/* Separator minimalis */}
      <div className="flex items-center gap-3 min-w-fit relative">

        {/* Menu Dropdown minimalis */}
        <Menu className="menu-default">
          <MenuItem
            toggle="dropdown"
            trigger="hover"
            dropdownProps={{
              // placement: isRTL() ? "bottom-end" : "bottom-start",
              placement: "top-start",
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
                "group relative rounded-lg transition-all duration-300",
                isScrolled
                  ? "hover:bg-red-50 dark:hover:bg-red-900/20"
                  : "hover:bg-white/10",
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "font-semibold text-base transition-colors duration-300",
                      isScrolled
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-white",
                    )}
                  >
                    {activeTab}
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
                "max-h-[calc(100vh-100px)]",
                // "w-[calc(100vw-100px)]",

                "overflow-y-auto overflow-x-visible",

                "relative",

                "shadow-lg border border-gray-200 dark:border-gray-700",
                "bg-white dark:bg-coal-500",
                "rounded-lg",
              )}
            >
              {/* <div className="p-2 space-y-1"> */}
              {/* {allTab.map((item, index) => {
                const isActive = item.id === activeTab;

                return (
                  <MenuItem
                    key={index}
                    className={clsx(
                      "transition-colors duration-200 rounded-md",
                      isActive ? "" : "",
                    )}
                    onClick={() => openTab(item)}
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
                        {item.title}
                      </MenuTitle>

                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </MenuLink>
                  </MenuItem>
                );
              })} */}
              {/* {HeaderAllDirQuery.data
                  ?.filter((item) => item.parentId === null)
                  .map((item, index) => {
                    // const isActive = item.partyId === activeTab;

                    return (
                      <MenuItem
                        key={index}
                        className={clsx(
                          "transition-colors duration-200 rounded-md",
                          // isActive ? "" : "",
                        )}
                        // onClick={() => openTab(item)}
                      >
                        <MenuLink
                          className={clsx(
                            "flex items-center gap-3 px-3 py-2.5",
                            "text-sm font-medium transition-colors duration-200",
                            // isActive
                            //   ? "text-white"
                            //   : "text-gray-700 dark:text-gray-200",
                          )}
                        >
                          <MenuTitle
                            className={clsx(
                              "flex-1 font-semibold",
                              "transition-colors duration-200 rounded-md",
                              // isActive ? "!text-red-500" : "",
                            )}
                          >
                            {item.name}
                          </MenuTitle>


                        </MenuLink>
                        <MenuSub
                          className={clsx(
                            "menu-default w-48",
                            "shadow-lg border border-gray-200 dark:border-gray-700",
                            "bg-white dark:bg-coal-500",
                            "rounded-lg",
                          )}
                        >
                          {getDirChild(item.partyId)?.map((child, childIndex) => (
                            <MenuItem key={childIndex}>
                              <MenuLink
                                // path={child.path}
                                className={clsx(
                                  "flex items-center gap-2 px-3 py-2",
                                  "text-sm font-medium transition-colors duration-200",
                                  // pathname === child.path
                                  //   ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                                  //   : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700",
                                )}
                              >
                                <MenuTitle>{child.name}</MenuTitle>
                              </MenuLink>
                            </MenuItem>
                          ))}
                        </MenuSub>
                      </MenuItem>
                    );
                  })} */}

              {/* </div> */}
              {RenderMenu(null)}
            </MenuSub>
          </MenuItem>
        </Menu>
      </div>

      <div className="flex flex-col w-full relative">
        <label className="input input-sm w-full flex items-center gap-2 bg-white">
          <KeenIcon icon="magnifier" />
          <Input
            type="text"
            placeholder="Module name.."
            size={"sm"}
            className="w-full border-none"
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
          {search && (
            <Button
              size={"sm"}
              variant={"ghost"}
              className="p-1 w-[14px] h-[14px]"
              onClick={() => setSearch("")}
            >
              <KeenIcon icon="cross" />
            </Button>
          )}
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
                {p.partyName}
              </li>
            ))}
          </ul>
        )}
      
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-md z-20 max-h-40 overflow-auto">
            {suggestions.map((p, idx) => (
              <li
                key={idx}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={() => handleSelect(p)} // use onMouseDown so blur doesn’t hide it first
              >
                {p.partyName}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export { HeaderLogo };
