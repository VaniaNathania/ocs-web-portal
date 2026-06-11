import useBodyClasses from "@/hooks/useBodyClasses";
import { OrderLayoutProvider, Main } from ".";
import { OrderProvider } from "@/pages/main-menu/order/hooks/orderContext";
import { OrderUserProvider } from "@/pages/main-menu/order/user/hooks/context";

const OrderLayout = () => {
  // Using the custom hook to set multiple CSS variables and class properties
  useBodyClasses(`
    [--tw-page-bg:var(--tw-light)]
    [--tw-page-bg-dark:var(--tw-coal-500)]
    [--tw-header-height-default:64px]
    [[data-sticky-header=on]&]:[--tw-header-height:64px]
    [--tw-header-height:--tw-header-height-default]	
    bg-[--tw-page-bg]
    dark:bg-[--tw-page-bg-dark]
  `);

  return (
    // Providing layout context and rendering the main content
    <OrderLayoutProvider>
      <OrderProvider>
        <OrderUserProvider>
          <Main />
        </OrderUserProvider>
      </OrderProvider>
    </OrderLayoutProvider>
  );
};

export { OrderLayout };
export default OrderLayout;
