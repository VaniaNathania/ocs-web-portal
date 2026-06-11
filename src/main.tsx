import "@/components/keenicons/assets/styles.css";
import "./styles/globals.css";

import axios from "axios";
import ReactDOM from "react-dom/client";

import { App } from "./App";
import { setupAxios } from "./auth";
import { ProvidersWrapper } from "./providers";
import React from "react";
import ErrorBoundary from "./providers/ErrorBoundary";
import { ClientSideError } from "./errors/ClientSideError";

/**
 * Inject interceptors for axios.
 *
 * @see https://github.com/axios/axios#interceptors
 */
setupAxios(axios);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <ErrorBoundary fallback={<ClientSideError />}>
      <ProvidersWrapper>
        <App />
      </ProvidersWrapper>
    </ErrorBoundary>
  </React.StrictMode>,
);
