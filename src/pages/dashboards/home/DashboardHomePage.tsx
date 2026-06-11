import { Container, KeenIcon } from "@/components";
import moment from "moment";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRoleCheck } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useAuthContext } from "@/auth";
import { get5LastYear } from "@/utils/Date";
import { useLoaders } from "@/providers";

const DashboardHomePage = () => {
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const { setScreenLoader } = useLoaders();
  const { checkMenusPriv } = useRoleCheck();

  const selectYear = get5LastYear();
  const latestYear = Math.max(
    ...selectYear.map((item) => parseInt(item, 10)),
  ).toString();

  const [selectedYear, setSelectedYear] = useState<string>(latestYear);
  const [dateRange, setDateRange] = useState({
    from: moment(`${latestYear}-01-01`).toDate(),
    to: moment(`${latestYear}-12-31`).toDate(),
  });

  useEffect(() => {
    setDateRange({
      from: moment(`${selectedYear}-01-01`).toDate(),
      to: moment(`${selectedYear}-12-31`).toDate(),
    });
  }, [selectedYear]);

  const data = [
    {
      privName: "TCEL Balance Adjustment",
      path: "/tcel-balance-adjustment",
      title: "Tcel Balance Adjustment",
      description: "Manage balance adjustments for TCEL accounts.",
      icon: "more-2",
    },
    {
      privName: "Price Plan",
      path: "/main/price-plan",
      title: "Price Plan",
      description: "Handle and manage price plans efficiently.",
      icon: "price-tag",
    },
    {
      privName: "Account Config",
      path: "/account-config/account-balance",
      title: "Account Config",
      description: "Configure and manage account settings.",
      icon: "user-edit",
    },
    {
      privName: "Offer",
      path: "/main/offer/main-product",
      title: "Offer",
      description: "Manage offers and product configurations.",
      icon: "discount",
    },
    {
      privName: "Order Entry",
      path: "/order-entry",
      title: "Order Entry",
      description: "Process and track customer orders.",
      icon: "handcart",
    },
    {
      privName: "Role Management",
      path: "/role-management",
      title: "Role Management",
      description: "Control user access and roles.",
      icon: "setting",
    },
    {
      privName: "User Management",
      path: "/user-management",
      title: "User Management",
      description: "Manage user accounts and permissions.",
      icon: "wrench",
    },
    {
      privName: "Directory Menu Management",
      path: "/directory-menu-management",
      title: "Directory Menu Management",
      description: "Manage navigation and directory structure.",
      icon: "menu",
    },
    {
      privName: "Portal Management",
      path: "/portal-management",
      title: "Portal Management",
      description: "Customize and control portal settings.",
      icon: "setting-3",
    },
    {
      privName: "Log Management",
      path: "/log-management",
      title: "Log Management",
      description: "Monitor and review system logs.",
      icon: "setting-2",
    },
    {
      privName: "Payment",
      path: "/payment",
      title: "Payment",
      description: "Handle and manage Payment efficiently.",
      icon: "bill",
    },
    {
      privName: "LifeCycle Type",
      path: "/lifecycle-type",
      title: "LifeCycle Type",
      description: "Manage LifeCycle.",
      icon: "watch",
    },
    {
      privName: "Change Number Profile",
      path: "/change-number-profile",
      title: "Change Number Profile",
      description: "Manage Change Number Profile.",
      icon: "simcard-2",
    },
    {
      privName: "Upload Sim Card File",
      path: "/upload-simcard",
      title: "Upload Simcard File",
      description: "Manage Upload Simcard File for TCEL accounts",
      icon: "simcard",
    },
    {
      privName: "Sim Card Profile",
      path: "/simcard-profile",
      title: "Sim Card Profile",
      description: "Manage Simcard Profile for TCEL accounts",
      icon: "simcard",
    },
    {
      privName: "CVBS SIM & Number Binding/Unbinding",
      path: "/cvbs-sim-number-binding-unbinding",
      title: "CVBS SIM & Number Binding/Unbinding",
      description: "Manage Sim & Number Binding/Unbinding",
      icon: "simcard",
    },
    {
      privName: "PreNewConnection",
      path: "/pre-new-connection",
      title: "Pre New Connection",
      description: "Batch subscribe account into the order.",
      icon: "abstract-17",
    },
    {
      privName: "Wholesale Monitor",
      title: "Wholesale Monitor",
      icon: "screen",
      path: "/wholesale-monitor",
      description: "desc",
    },
  ];

  const dataRef = [
    {
      privName: "zone",
      path: "/data-reference/zone-time",
      title: "Zone Time",
      description: "Manage Time Zone for TCEL accounts.",
      icon: "map",
    },
    {
      privName: "time span",
      path: "/data-reference/time-span",
      title: "Time Span",
      description: "Manage Time Span for TCEL accounts.",
      icon: "time",
    },
    {
      privName: "accm type",
      path: "/data-reference/accm-type",
      title: "Accm Type",
      description: "Manage Accm Type for TCEL accounts.",
      icon: "cube-3",
    },
    {
      privName: "event",
      path: "/data-reference/event",
      title: "Event",
      description: "Manage Event for TCEL accounts.",
      icon: "colors-square",
    },
    {
      privName: "ratable event action",
      path: "/data-reference/ratable-event-action",
      title: "Ratable Event Action",
      description: "Manage Ratable Event Action for TCEL accounts.",
      icon: "abstract-39",
    },
    {
      privName: "advice type",
      path: "/data-reference/advice-type",
      title: "Advice Type",
      description: "Manage Advice Type for TCEL accounts",
      icon: "abstract-27",
    },
    {
      privName: "advice monitor",
      path: "/data-reference/advice-monitor",
      title: "Advice Monitor",
      description: "Manage Advice Monitor for TCEL accounts",
      icon: "screen",
    },
    {
      privName: "WorkFlow Rule & Recurring Event",
      path: "/data-reference/workflow-rule-recurring-event",
      title: "WorkFlow Rule",
      description: "Manage WorkFlow Rule for TCEL accounts",
      icon: "abstract-24",
    },
    {
      privName: "Billing WorkFlow",
      path: "/data-reference/billing-workflow",
      title: "Billing WorkFlow",
      description: "Manage Billing WorkFlow for TCEL accounts",
      icon: "bill",
    },
    {
      privName: "channel",
      path: "/data-reference/channel",
      title: "Channel",
      description: "Manage Channel for TCEL accounts",
      icon: "abstract-21",
    },
    {
      privName: "all features",
      path: "/data-reference/all-features",
      title: "All Features",
      description: "Manage All Features for TCEL accounts",
      icon: "square-brackets",
    },
    {
      privName: "reservation rule",
      path: "/data-reference/reservation-rule",
      title: "Reservation Rule",
      description: "Manage All Features for TCEL accounts",
      icon: "square-brackets",
    },
  ];

  const filteredData = data.filter((item) =>
    checkMenusPriv(item.path, "readStatus"),
  );

  const filteredDataRef = dataRef.filter((item) =>
    checkMenusPriv(item.path, "readStatus"),
  );

  const handleBackClick = (url: string) => {
    // start();
    setScreenLoader(true);
    navigate(url);
  };

  return (
    <Container>
      <div className="rounded-md">
        {filteredData.length === 0 ? (
          <div className="text-center py-10 text-gray-600 w-full">
            <p className="text-lg font-semibold mb-2">
              You don't have access to any dashboard menus.
            </p>
            <p className="text-sm">
              Please contact your administrator to assign the necessary
              permissions.
            </p>
            <p className="text-sm mt-2">
              After menus have been assigned, try{" "}
              <span
                className="text-blue-600 font-medium cursor-pointer"
                onClick={logout}
              >
                logging out
              </span>{" "}
              and logging back in to refresh your access.
            </p>
          </div>
        ) : (
          <div className="flex flex-col max-w-7xl p-5 gap-5 mx-auto">
            <h1 className="font-bold text-2xl">Main Menu</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-20 mb-5">
              {filteredData.map((item) => (
                <div
                  key={item.privName}
                  onClick={() => handleBackClick(item.path)}
                  className="bg-white p-6 rounded-xl shadow-md border-2 flex items-start gap-4 hover:shadow-md transition cursor-pointer"
                >
                  <div className=" p-3 rounded-md">
                    <KeenIcon icon={item.icon} className=" text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <hr className="border-2"></hr>
            <h1 className="font-bold text-2xl mt-5">Business Common</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-20">
              {filteredDataRef.map((item) => (
                <div
                  key={item.privName}
                  onClick={() => handleBackClick(item.path)}
                  className="bg-white p-6 rounded-xl shadow-md border-2 flex items-start gap-4 hover:shadow-md transition cursor-pointer"
                >
                  <div className=" p-3 rounded-md">
                    <KeenIcon icon={item.icon} className=" text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default DashboardHomePage;
