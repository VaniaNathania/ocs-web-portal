import { apiConfig } from "@/config/api.config";

const API_URL = apiConfig.service_price_plan;

export const endpoints = {
  accountFeature: {
    list: `${API_URL}/account-feature/list`,
    detail: `${API_URL}/account-feature/list/qryAttrDetail`,
    attrValue: `${API_URL}/account-feature/list/qryAttrValue`,
    optionValue: `${API_URL}/account-feature/list/attrName`,
    create: `${API_URL}/account-feature/modAcctAttrNew`,
    delete: (id: number | string) =>
      `${API_URL}/account-feature/delAcctAttr?attrId=${id}`,
    updateDispOrder: `${API_URL}/account-feature/updateAcctAttrDispOrder`,
    updateAttrValue: (attrId: number | string) =>
      `${API_URL}/account-feature/modAcctAttrValue?attrId=${attrId}`,
  },
  depositType: {
    list: `${API_URL}/depositType/list`,
    create: `${API_URL}/depositType/add`,
    update: (depositTypeId: number | string) =>
      `${API_URL}/depositType/mod?depositTypeId=${depositTypeId}`,
    delete: (id: number | string) => `${API_URL}/depositType/delete?id=${id}`,
  },
  installmentType: {
    list: `${API_URL}/instalment-type/qry-instalment-type1`,
    create: `${API_URL}/instalment-type/create`,
    update: (installmentTypeId: number | string) =>
      `${API_URL}/instalment-type/update/${installmentTypeId}`,
    delete: (id: number | string) => `${API_URL}/instalment-type/delete/${id}`,
    detail: `${API_URL}/instalment-type/qry-instalment-type-detail`,
  },
  paymentMethod: {
    list: `${API_URL}/payment/method/list`,
    paymentTypeList: `${API_URL}/payment/type/list`,
    parameterDetail: `${API_URL}/payment/list/DDParam`,
    createPaymentMethod: `${API_URL}/payment/create`,
    createPaymentParameter: `${API_URL}/payment/addDDParam`,
    updatePaymentMethod: (paymentMethodId: number | string) =>
      `${API_URL}/payment/modPaymentMethod?paymentMethodId=${paymentMethodId}`,
    updatePaymentParameter: (paymentMethodId: number | string) =>
      `${API_URL}/payment/modDDParam?paymentMethodId=${paymentMethodId}`,
    deletePaymentMethod: (paymentMethodId: number | string) =>
      `${API_URL}/payment/delPaymentMethod?paymentMethodId=${paymentMethodId}`,
    deletePaymentParameter: (paymentMethodId: number | string) =>
      `${API_URL}/payment/delDDParam?paymentMethodId=${paymentMethodId}`,
  },
};
