import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "missing_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "missing_secret",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "default_development_secret_key_123",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
