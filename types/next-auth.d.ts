import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      currency?: string;
      onboardingDone?: boolean;
    } & DefaultSession["user"];
  }
}