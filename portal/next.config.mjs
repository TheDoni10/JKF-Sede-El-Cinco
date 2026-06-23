/** @type {import('next').NextConfig} */
const portalBasePath = process.env.NEXT_PUBLIC_PORTAL_BASE_PATH ?? "/portal";

const nextConfig = {
  reactStrictMode: true,
  ...(portalBasePath ? { basePath: portalBasePath } : {}),
};

export default nextConfig;
