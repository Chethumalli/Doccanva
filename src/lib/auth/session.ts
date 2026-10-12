import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export async function getServerUser(): Promise<AuthenticatedUser | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return null;
    }

    const userObj = session.user as { id?: string; name?: string | null; email?: string | null; image?: string | null };
    return {
      id: userObj.id || "",
      name: userObj.name || "User",
      email: userObj.email || "",
      image: userObj.image || "",
    };
  } catch (error) {
    console.error("Error retrieving server session:", error);
    return null;
  }
}
