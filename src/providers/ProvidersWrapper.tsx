import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/auth/providers/JWTProvider";
import {
  LayoutProvider,
  LoadersProvider,
  MenusProvider,
  SettingsProvider,
  TranslationProvider,
} from "@/providers";
import { HelmetProvider } from "react-helmet-async";
import { ConfirmDialogProvider } from "./ConfirmDialogProvider";

const queryClient = new QueryClient();

const ProvidersWrapper = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <TranslationProvider>
            <HelmetProvider>
              <LayoutProvider>
                <ConfirmDialogProvider>
                  <LoadersProvider>
                    <MenusProvider>{children}</MenusProvider>
                  </LoadersProvider>
                </ConfirmDialogProvider>
              </LayoutProvider>
            </HelmetProvider>
          </TranslationProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export { ProvidersWrapper };
