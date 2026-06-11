import clsx from "clsx";
import { Link } from "react-router-dom";
import { IMenuLinkProps } from "./";
import { useLoaders } from "@/providers";

const MenuLink = ({
  path,
  newTab,
  hasItemSub = false,
  externalLink,
  className,
  handleToggle,
  handleClick,
  children,
  linkState,
}: IMenuLinkProps) => {
  const { setScreenLoader } = useLoaders();
  if (!hasItemSub && path) {
    if (externalLink) {
      const target = newTab ? "_blank" : "_self";

      return (
        <a
          href={path}
          onClick={(e) => {
            e.preventDefault();
            //  console.log("clicked");

            handleClick;
          }}
          target={target}
          rel="noopener"
          className={clsx("menu-link", className && className)}
        >
          {children}
        </a>
      );
    } else {
      return (
        <Link
          onClick={(e) => {
            // start();
            if (location.pathname != path) setScreenLoader(true);
          }}
          to={path}
          state={linkState}
          className={clsx("menu-link", className && className)}
        >
          {children}
        </Link>
      );
    }
  } else {
    if (hasItemSub) {
      return (
        <div
          className={clsx("menu-link", className && className)}
          onClick={handleToggle}
        >
          {children}
        </div>
      );
    } else {
      return (
        <div
          className={clsx("menu-link", className && className)}
          onClick={handleClick}
        >
          {children}
        </div>
      );
    }
  }
};

export { MenuLink };
