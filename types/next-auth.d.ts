import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    spotify?: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
    youtube?: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
    google?: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    spotify?: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
    youtube?: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
  }
}
