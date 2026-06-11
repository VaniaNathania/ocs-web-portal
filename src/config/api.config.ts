// api.config.js - Versi yang menggunakan proxy untuk development
interface apiConfigProps {
  service_user: string;
  service_master_data: string;
  service_assets: string;
  service_price_plan: string;
  service_payment: string;
}

interface apiConfigPropsOffer {
  offer: string;
}

interface apiConfigRoleProps {
  login: string;
  role: string;
}

interface apiConfigOrderProps {
  order: string;
}

// FINAL: Gunakan path yang sesuai dengan endpoint server
const API_URL_OFFER = import.meta.env.VITE_APP_API_URL_OFFER;
const API_URL_ROLE = import.meta.env.VITE_APP_API_URL_ROLE;
const API_URL_ORDER = import.meta.env.VITE_APP_API_URL_ORDER;
const API_URL_LOG = import.meta.env.VITE_APP_API_URL_LOG;
const API_URL_REF = import.meta.env.VITE_APP_API_URL_REF;
const API_URL_PYTHON = import.meta.env.VITE_APP_API_URL_PYTHON;

const API_URL = import.meta.env.VITE_APP_API_URL;
const API_BASE = import.meta.env.VITE_APP_API_COMMON;

/*
  di apiConfig 2 props tidak terpakai yakni service_assets dan master_data, tidak bisa dihapus
  karena masih banyak digunakan di beberapa komponen di offer main-product
*/
const apiConfig: apiConfigProps = {
  service_user: `${API_URL}`,
  service_master_data: `${API_URL}/m`,
  service_assets: `${API_URL}/a`,
  service_price_plan: `${API_URL}/api`,
  service_payment: `${API_BASE}8089`,
};

const apiConfigOffer: apiConfigPropsOffer = {
  offer: `${API_URL_OFFER}/api`,
};

const apiConfigRole: apiConfigRoleProps = {
  login: `${API_URL_ROLE}`,
  role: `${API_URL_ROLE}`,
};

const apiConfigOrder: apiConfigOrderProps = {
  order: `${API_URL_ORDER}`,
};

const apiConfigLog = API_URL_LOG;

const apiConfigRef = {
  ref: API_URL_REF,
};

const apiConfigPython = {
  python: API_URL_PYTHON,
};

export {
  apiConfig,
  apiConfigOffer,
  apiConfigRole,
  apiConfigOrder,
  apiConfigLog,
  apiConfigRef,
  apiConfigPython,
};
