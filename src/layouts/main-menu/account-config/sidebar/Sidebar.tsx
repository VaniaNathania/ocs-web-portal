import {
  CreditCard,
  Package,
  UserCheck,
  DollarSign,
  Calendar,
  Building,
  Bookmark,
  ChevronRight,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAccountConfigLayout } from "../AccountConfigLayoutProvider";

const sidebarMenuItems = [
  {
    id: "account-balance",
    label: "Account Balance Type",
    icon: CreditCard,
    hasSubmenu: false,
    link: "/account-config/account-balance",
  },
  {
    id: "account-item",
    label: "Account Item Type",
    icon: Package,
    hasSubmenu: false,
    link: "/account-config/account-item",
  },
  {
    id: "account-feature",
    label: "Account Feature",
    icon: UserCheck,
    hasSubmenu: false,
    link: "/account-config/account-feature",
  },
  {
    id: "payment-method",
    label: "Payment Method",
    icon: DollarSign,
    hasSubmenu: false,
    link: "/account-config/payment-method",
  },
  {
    id: "installment",
    label: "Installment Type",
    icon: Calendar,
    hasSubmenu: false,
    link: "/account-config/installment",
  },
  {
    id: "billing-cycle",
    label: "Billing Cycle",
    icon: Calendar,
    hasSubmenu: false,
    link: "/account-config/billing-cycle",
  },
  {
    id: "bank",
    label: "Bank",
    icon: Building,
    hasSubmenu: false,
    link: "/account-config/bank",
  },
  {
    id: "deposit",
    label: "Deposit Type",
    icon: Bookmark,
    hasSubmenu: false,
    link: "/account-config/deposit",
  },
];

const Sidebar = () => {
  const { activeTab, setActiveTab } = useAccountConfigLayout();

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeItemId = sidebarMenuItems.find((item) =>
    pathname.startsWith(item.link || ""),
  )?.id;

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <nav aria-label="Sidebar menu">
          <ul className="space-y-2">
            {sidebarMenuItems.map((item) => {
              const isActive = item.id === activeTab;
              return (
                <li key={item.id}>
                  <button
                    // onClick={() => item.link && navigate(item.link)}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-50 text-red-600 border-l-4 border-red-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    title={item.label}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="text-sm">{item.label}</span>
                    {item.hasSubmenu && (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
