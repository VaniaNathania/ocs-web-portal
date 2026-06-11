import clsx from "clsx";
import { Container } from "@/components/container";
import { HeaderLogo, HeaderTopbar } from ".";
import { useEffect, useState } from "react";

interface headerProps {
  headerSticky: boolean;
}

const Header = ({ headerSticky }: headerProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // useEffect(() => {
  //   if (headerSticky) {
  //     document.body.setAttribute("data-sticky-header", "on");
  //   } else {
  //     document.body.removeAttribute("data-sticky-header");
  //   }
  // }, [headerSticky]);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger pas scroll > 20px aja biar lebih responsif
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Spacer untuk fixed header */}
      {/* {headerSticky && <div className="h-16" />} */}
      <div className={`min-h-[64px] static w-full -z-50`}></div>
      <header
        className={clsx(
          // "w-full h-16 flex items-center shrink-0",
          // headerSticky && "fixed top-0 left-0 right-0 z-[50]",
          // 👇 SIMPLE: Cuma ganti warna + shadow, smooth transition
          "transition-all duration-300 ease-in-out w-full z-50 fixed h-[64px]",
          isScrolled
            ? "bg-white dark:bg-coal-500 shadow-md border-b  border-gray-200 dark:border-coal-400 "
            : "bg-red-700 dark:bg-red-700 shadow-none",
        )}
      >
        <Container className="flex justify-between items-center w-full">
          <HeaderLogo isScrolled={isScrolled} />
          <HeaderTopbar />
        </Container>
      </header>
    </>
  );
};

export { Header };
