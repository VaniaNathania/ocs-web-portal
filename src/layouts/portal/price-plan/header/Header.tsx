import clsx from "clsx";
import { Container } from "@/components/container";
import { HeaderLogo, HeaderTopbar } from ".";
import { usePortalLayout } from "../";
import { useEffect } from "react";
import { toAbsoluteUrl } from "@/utils";

const Header = () => {
  const { headerSticky } = usePortalLayout();

  useEffect(() => {
    if (headerSticky) {
      document.body.setAttribute("data-sticky-header", "on");
    } else {
      document.body.removeAttribute("data-sticky-header");
    }
  }, [headerSticky]);

  return (
    <header
      className={clsx(
        "flex items-center transition-[height] shrink-0 py-6  bg-[length:600px] border-b-[1px] border-red-500 mb-2 shadow-sm bg-no-repeat ",
        headerSticky &&
          "transition-[height] fixed z-10 top-0 left-0 right-0 shadow-sm backdrop-blur-md bg-white/70 dark:bg-coal-500/70 dark:border-b dark:border-b-coal-100"
      )}
      style={{
        backgroundImage: `url('${toAbsoluteUrl("/media/images/2600x1200/bg-14.png")}')`,
      }}
    >
      <Container className="flex justify-between items-center lg:gap-4">
        <HeaderLogo />
        <HeaderTopbar />
      </Container>
    </header>
  );
};

export { Header };

// h - [--tw - header - height];
