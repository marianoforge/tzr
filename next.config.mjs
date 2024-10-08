/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tailwindui.com",
        port: "",
        pathname: "/img/logos/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/dashboard",
        destination: "/tracker/dashboard",
      },
      {
        source: "/agents",
        destination: "/tracker/agents",
      },
      {
        source: "/calendar",
        destination: "/tracker/calendar",
      },
      {
        source: "/eventForm",
        destination: "/tracker/eventForm",
      },
      {
        source: "/expenses",
        destination: "/tracker/expenses",
      },
      {
        source: "/expensesBroker",
        destination: "/tracker/expensesBroker",
      },
      {
        source: "/expensesList",
        destination: "/tracker/expensesList",
      },
      {
        source: "/operationsList",
        destination: "/tracker/operationsList",
      },
      {
        source: "/reservationInput",
        destination: "/tracker/reservationInput",
      },
      {
        source: "/settings",
        destination: "/tracker/settings",
      },
      {
        source: "/reset-password",
        destination: "/tracker/reset-password",
      },
    ];
  },
};

export default nextConfig;
