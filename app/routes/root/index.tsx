import { redirect } from "react-router";
import { account } from "~/appwrite/client";
import { getExistingUser } from "~/appwrite/auth";

export async function clientLoader() {
  try {
    const user = await account.get();
    if (!user.$id) return redirect("/sign-in");
    const existingUser = await getExistingUser(user.$id);
    if (existingUser?.status === "admin") {
      return redirect("/dashboard");
    }
    return redirect("/trips");
  } catch (error) {
    return redirect("/sign-in");
  }
}

export default function Index() {
  return null;
}
