import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const { handlers, auth: nextAuth, signIn: nextSignIn, signOut: nextSignOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;

        // Fetch fresh so a currency change in Settings shows up
        // immediately without waiting for the JWT to rotate.
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { preferredCurrency: true },
        });
        session.user.currency = dbUser?.preferredCurrency ?? "USD";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Force any relative or same-origin redirect to stay on baseUrl,
      // preventing a stale/incorrect NEXTAUTH_URL from sending users
      // to the wrong host (e.g. localhost) after login/logout.
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // ignore invalid URL
      }
      return baseUrl;
    },
  },
});

export const { GET, POST } = handlers;

export const auth = nextAuth;
export const signIn = nextSignIn;
export const signOut = nextSignOut;