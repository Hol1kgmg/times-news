import { useEffect } from "react";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { Provider } from "jotai";

import { NotFoundPage } from "#/pages/NotFound";

import appCss from "../styles.css?url";
import kleeOne400Css from "@fontsource/klee-one/400.css?url";
import kleeOne600Css from "@fontsource/klee-one/600.css?url";

const RootLayout = () => {
  useEffect(() => {
    if (import.meta.env.DEV) {
      import("react-scan").then(({ scan }) => scan({ enabled: true }));
    }
  }, []);

  return (
    <Provider>
      <Outlet />
    </Provider>
  );
};

const RootDocument = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <head>
      <HeadContent />
    </head>
    <body>
      {children}
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
      <Scripts />
    </body>
  </html>
);

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start FSD Template",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: kleeOne400Css,
      },
      {
        rel: "stylesheet",
        href: kleeOne600Css,
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});
