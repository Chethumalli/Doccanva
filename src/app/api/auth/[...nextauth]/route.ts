import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth/authOptions";

const handler = (req: any, ctx: any) => NextAuth(req, ctx, getAuthOptions());

export { handler as GET, handler as POST };
