import axios from "axios";
import { apiConfig } from "@/config/api.config";
import { capitalizeWords } from "@/utils";
import { useAuthContext } from "@/auth";
const API_URL = apiConfig.service_price_plan;

export async function doGetNavbarMenu(
  path: string,
): Promise<ActionMenuReponseTypes> {
  const { auth } = useAuthContext();
  try {
    const storedToken = localStorage.getItem(
      "ocs-portal-web-telkomcel-auth-v1=9.1.1",
    );
    const token = storedToken ? JSON.parse(storedToken) : null;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(`${API_URL}/priceplan/menu/list`, {
      headers: {
        Authorization: `Bearer ${auth?.access_token}`,
      },
    });

    if (response.data.code !== "200") {
      throw new Error(response.data.message ?? "Failed to fetch navbar menu");
    }

    const menuList: any[] = [];

    // if (response?.data?.data && Array.isArray(response.data.data)) {
    //   response.data.data.forEach((menuItem: any) => {
    //     if (menuItem?.parentName == "Subscription") {
    //       menuItem.list[0].forEach((item: any, index: number) => {
    //         const data = {
    //           icon: "",
    //           id: item?.id,
    //           id_parent: "",
    //           link: `/main/price-plan/subscribe/${item?.pricePlanTypeName}`,
    //           module: capitalizeWords(item.pricePlanTypeName),
    //           name: capitalizeWords(item.pricePlanTypeName),
    //           pricePlanTypeName: capitalizeWords(item.pricePlanTypeName),
    //           order_number: index,
    //         };

    //         menuList.push(data);
    //       });
    //     }
    //   });
    // }

    return {
      status: true,
      message: "Successfully retrieved navbar menu",
      data: {
        menu: menuList,
      },
    };
  } catch (error: any) {
    console.error("Error fetching navbar menu:", error.message);
    //  console.log("udin");
    return {
      status: false,
      message: error.message,
      data: null,
    };
  }
}
