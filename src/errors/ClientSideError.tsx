import useBodyClasses from "@/hooks/useBodyClasses";
import { toAbsoluteUrl } from "@/utils";
import { Fragment } from "react/jsx-runtime";

const ClientSideError = () => {
  useBodyClasses("dark:bg-coal-500");

  const reload = () => {
    window.location.reload();
  };

  return (
    <Fragment>
      <div className="flex flex-col w-full h-full items-center justify-center">
        <div className="mb-10">
          <img
            src={toAbsoluteUrl("/media/illustrations/20.svg")}
            className="dark:hidden"
            alt="Client Error"
          />
          <img
            src={toAbsoluteUrl("/media/illustrations/20-dark.svg")}
            className="light:hidden"
            alt="Client Error"
          />
        </div>

        <span className="badge badge-primary badge-outline mb-3">Oops..</span>

        <h3 className="text-2.5xl font-semibold text-gray-900 text-center mb-2">
          Something went wrong
        </h3>

        <div className="text-md text-center text-gray-700 mb-6">
          We have a client side issue. Please try reloading the page.
        </div>

        {/* Reload action */}
        <button onClick={reload} className="btn btn-primary">
          Reload Page
        </button>
      </div>
    </Fragment>
  );
};

export { ClientSideError };
