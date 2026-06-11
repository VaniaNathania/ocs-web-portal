// import { apiConfig } from "@/config/api.config";
// import { useCallApi } from "@/hooks";
// import { useEffect, useState } from "react";
// import { toast } from "sonner";
// import { useMainProductOfferListContext } from "../hooks";
// import { useDataGrid } from "@/components";

// interface PricePlanMenu {
//   parentName: string;
//   name: string;
//   list: string[];
// }

// const API_URL = apiConfig.service_price_plan;

// const MenuList = () => {
//   const { GetData } = useCallApi();
//   const { reload } = useDataGrid();
//   // const { selectedMenuPricePlan, setSelectedMenuPricePlan } =
//     // useMainProductOfferListContext();
//   const [menus, setMenus] = useState<PricePlanMenu[]>([]);

//   const getListMenu = async () => {
//     try {
//       const response = await GetData(`${API_URL}/priceplan/menu/list`, {});

//       if (response?.status) {
//         setMenus(response.data);
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       toast.error("Error get menu price plan");
//     }
//   };

//   const handleMenuClick = (item: PricePlanMenu) => {
//     setSelectedMenuPricePlan(item.name);
//     reload();
//   };

//   useEffect(() => {
//     getListMenu();
//   }, []);

//   useEffect(() => {
//     if (selectedMenuPricePlan) {
//       reload();
//     }
//   }, [selectedMenuPricePlan]);

//   return (
//     <div className="flex flex-wrap gap-x-7 mb-5 border-b border-slate-300">
//       {menus.map((item, index) => {
//         const isActive = selectedMenuPricePlan === item.name;
//         return (
//           <button
//             key={index}
//             onClick={() => handleMenuClick(item)}
//             className={`relative text-base font-medium  pb-2 transition-colors duration-200 
//           ${isActive ? "text-slate-800" : "text-slate-500 hover:text-slate-700"}
//         `}
//           >
//             {item.parentName}

//             {isActive && (
//               <span className="absolute left-0 bottom-0 w-full h-0.5 bg-slate-800 rounded-full transition-all duration-300"></span>
//             )}
//           </button>
//         );
//       })}
//     </div>
//   );
// };

// export default MenuList;
