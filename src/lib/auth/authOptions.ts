import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/models";

export function getAuthOptions(): NextAuthOptions {
  const googleId = process.env.AUTH_GOOGLE_ID?.trim();
  const googleSecret = process.env.AUTH_GOOGLE_SECRET?.trim();
  const hasGoogle = Boolean(googleId && googleSecret);

  return {
    secret: process.env.AUTH_SECRET || "development_secret_32_characters_random_docucanvas_key_2025",
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
      ...(hasGoogle
        ? [
            GoogleProvider({
              clientId: googleId!,
              clientSecret: googleSecret!,
            }),
          ]
        : []),
      // Development & quick sign-in credentials provider
      CredentialsProvider({
        id: "dev-login",
        name: "Demo Account",
        credentials: {
          email: { label: "Email", type: "email", placeholder: "demo@docucanvas.com" },
          name: { label: "Name", type: "text", placeholder: "Demo Designer" },
          avatar: { label: "Avatar", type: "text" },
          provider: { label: "Provider", type: "text" },
        },
        async authorize(credentials) {
          const email = credentials?.email?.toLowerCase().trim() || "demo@docucanvas.com";
          const name = credentials?.name?.trim() || "Demo Designer";
          const isGoogle = credentials?.provider === "google" || email.endsWith("@gmail.com");
          let userId = "usr-" + Buffer.from(email).toString("hex").slice(0, 16);
          let image =
            credentials?.avatar?.trim() ||
            (isGoogle
              ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4285F4&textColor=ffffff`
              : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`);

          try {
            await connectToDatabase();
            let user = await UserModel.findOne({ email });
            if (!user) {
              user = await UserModel.create({
                name,
                email,
                emailVerified: new Date(),
                image,
              });
            }
            userId = user._id.toString();
            image = user.image || image;
          } catch (err) {
            console.warn("MongoDB offline, using local dev credentials session:", (err as any)?.message);
          }

          return {
            id: userId,
            name,
            email,
            image,
          };
        },
      }),
    ],
    callbacks: {
      async signIn({ user, account }) {
        if (account?.provider === "google") {
          try {
            await connectToDatabase();
            const existingUser = await UserModel.findOne({ email: user.email?.toLowerCase() });
            if (!existingUser) {
              await UserModel.create({
                name: user.name || "Google User",
                email: user.email?.toLowerCase(),
                emailVerified: new Date(),
                image: user.image || "",
              });
            } else {
              // Update image / name if updated in Google
              existingUser.name = user.name || existingUser.name;
              if (user.image) existingUser.image = user.image;
              await existingUser.save();
            }
          } catch (error) {
            console.warn("DB offline during Google sign-in, proceeding with session:", (error as any)?.message);
            // Return true so user sign-in is not blocked even if local DB is offline
            return true;
          }
        }
        return true;
      },
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.picture = user.image;
        }

        // If user ID is missing from token, fetch from DB by email
        if (!token.id && token.email) {
          token.id = "usr-" + Buffer.from(token.email).toString("hex").slice(0, 16);
          try {
            await connectToDatabase();
            const dbUser = await UserModel.findOne({ email: token.email.toLowerCase() });
            if (dbUser) {
              token.id = dbUser._id.toString();
            }
          } catch {
            // Offline fallback active
          }
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          (session.user as any).id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.user.image = token.picture as string;
        }
        return session;
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
  };
}

export const authOptions: NextAuthOptions = getAuthOptions();
export default authOptions;
