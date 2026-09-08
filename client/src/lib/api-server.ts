import { cookies } from "next/headers";
import { API_URL } from "./api";

/** Server Component fetch that forwards the accessToken cookie for authenticated reads. */
export async function fetchServer<T>(path: string): Promise<T | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = {};
    if (token) {
      headers.Cookie = `accessToken=${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
      headers
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
