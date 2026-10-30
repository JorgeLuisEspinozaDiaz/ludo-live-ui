export const getTenantDomain = (): string | null => {
  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0];

  if (hostname === "localhost") return "";
  if (subdomain.length > 0) return subdomain;
  return null;
};
