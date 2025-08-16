"use client";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "./store";
import { TokenInitializer } from "../components/TokenInitializer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <TokenInitializer />
      <Toaster
        position="top-right"
        expand={true}
        richColors={true}
        closeButton={true}
        toastOptions={{
          style: {
            background: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          },
          className: 'sonner-toast',
          duration: 4000,
        }}
      />
      {children}
    </Provider>
  );
}
