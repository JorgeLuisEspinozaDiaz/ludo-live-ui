import { useEffect, useState } from "react";

export function useFetch<T, P = unknown>(
  fetcher: (params?: P) => Promise<{ data?: T } | T>,
  params?: P,
  key?: string | number,
) {
  const [data, setData] = useState<T | null>(null);

  const load = async () => {
    const response = await fetcher(params);
    if (response && typeof response === "object" && "data" in response) {
      setData((response as { data?: T }).data ?? null);
    } else {
      setData((response as T) ?? null);
    }
  };

  useEffect(() => {
    load();
  }, [key]);

  return { data, load };
}
