import clsx from "clsx";
import { Container } from "@/components/container";
import { HeaderLogo, HeaderTopbar } from ".";
import { useEffect, useState } from "react";
import useMultiTab from "../../hooks/useContext";
import { Button } from "@/components/ui/button";
import { DefaultTooltip } from "@/components/tooltip";

import { KeenIcon } from "@/components/keenicons";
import { DirMenuManagementData } from "@/pages/main-menu/directory-menu-management/hook/CompProvider";
import { useCallApi } from "@/hooks";

const Header = () => {
  const { tabs, setActiveTab, closeTab, activeTab } = useMultiTab();
  const [isScrolled, setIsScrolled] = useState(false);
  const { GetData } = useCallApi();
  const [allDir, setAllDir] = useState<DirMenuManagementData[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger pas scroll > 20px aja biar lebih responsif
      setIsScrolled(window.scrollY > 0);
    };
    // console.log(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [window.scrollY]);

  const handleTabClick = (tabId: string) => setActiveTab(tabId);

  return (
    <div className="flex flex-col border-b-2 sticky z-[100] top-0 h-fit">
      {/* Spacer untuk fixed header */}
      {/* {headerSticky && <div className="h-16" />} */}
      {/* <div className={`min-h-[64px] static w-full -z-50`}></div> */}
      <header
        className={clsx(
          "transition-all duration-300 ease-in-out w-full z-50 ",
          isScrolled
            ? "bg-white dark:bg-coal-500 shadow-md border-b  border-gray-200 dark:border-coal-400"
            : "bg-red-700 dark:bg-red-700 shadow-none",
        )}
      >
        <Container className="flex justify-between items-center w-full">
          <HeaderLogo isScrolled={isScrolled} />
          <HeaderTopbar isScrolled={isScrolled} />
        </Container>
      </header>
      {/* 🔹 TAB HEADERS */}

      <div className="flex flex-row overflow-x-auto items-center gap-2 px-5 pt-1 bg-white overflow-y-hidden scroll-dynamic">
        {tabs?.map((item, index) => {
          const isSelected = activeTab == item.id;
          return (
            <DefaultTooltip title={item.title} key={index}>
              <div
                className={`cursor-pointer text-sm border-red-700 transition-all duration-100 hover:scale-105 flex flex-row items-center h-max px-1 border-primary shrink-0
              ${isSelected ? "border-b-2" : "border-none"}`}
              >
                <div
                  key={index}
                  className="text-md"
                  onClick={() => handleTabClick(item.id)}
                >
                  {item.title}
                </div>
                {item.closable && (
                  <Button
                    size="sm"
                    variant={"ghost"}
                    className="w-[25px] h-[25px] p-0 flex items-center justify-center text-red-600   border-red-600 hover:bg-red-600 hover:text-white rounded-full text-xl scale-[70%]"
                    onClick={() => closeTab(item)}
                  >
                    <KeenIcon icon="cross" />
                  </Button>
                )}
              </div>
            </DefaultTooltip>
          );
        })}
      </div>
    </div>
  );
};

export { Header };
