"use server";

import { getUser } from "@/lib/queries";

export async function getSettingsData() {
  const user = await getUser();
  return {
    name: user.name || "",
    email: user.email,
    defaultCurrency: user.defaultCurrency,
  };
}
