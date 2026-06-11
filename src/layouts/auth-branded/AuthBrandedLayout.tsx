import { Link, Outlet } from "react-router-dom";
import { Fragment, useState, useEffect } from "react";
import { toAbsoluteUrl } from "@/utils";
import useBodyClasses from "@/hooks/useBodyClasses";
import { AuthBrandedLayoutProvider } from "./AuthBrandedLayoutProvider";

const Layout = () => {
  const backgroundImages = [
    "/media/login-image/img_01.jpg",
    "/media/login-image/img_02.jpg",
    "/media/login-image/img_03.jpg",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  useBodyClasses("dark:bg-coal-500");
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentImageIndex + 1) % backgroundImages.length;
      setNextImageIndex(nextIndex);
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentImageIndex(nextIndex);
        setIsTransitioning(false);
      }, 3000);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentImageIndex, backgroundImages.length]);

  return (
    <Fragment>
      <style>
        {`
          .branded-bg {
            background-image: url('${toAbsoluteUrl("/media/logo/7.png")}');
          }
          .dark .branded-bg {
            background-image: url('${toAbsoluteUrl("/media/images/2600x1600/1-dark.png")}');
          }
        `}
      </style>

      <div className="grid lg:grid-cols-2 grow">
        <div className="flex justify-center items-center p-8 lg:p-10 order-2 lg:order-1">
          <Outlet />
        </div>

        <div className="lg:rounded-xl lg:border lg:border-gray-200 lg:m-5 order-1 lg:order-2 bg-top xxl:bg-center xl:bg-cover bg-no-repeat branded-bg">
          <div className="flex flex-col p-8 lg:p-16 gap-4">
            <Link to="/">
              <img
                src={toAbsoluteUrl("/media/app/app-logo.png")}
                className="h-12 max-w-none"
                alt=""
              />
            </Link>

            <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-semibold text-gray-900">
                OCS Dashboard Portal
              </h3>
              <div className="text-base font-medium text-gray-600">
                A user-friendly interface providing seamless access to OCS
                <span className="text-gray-900 font-semibold">
                  <br />
                  transaction management, reporting tools, and configuration
                  settings.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

const AuthBrandedLayout = () => (
  <AuthBrandedLayoutProvider>
    <Layout />
  </AuthBrandedLayoutProvider>
);

export { AuthBrandedLayout };
