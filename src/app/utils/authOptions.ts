import SpotifyProvider from "next-auth/providers/spotify"
import GoogleProvider from "next-auth/providers/google"

const scopes = {
  spotify: [
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-private",
    "playlist-modify-public",
  ].join(" "),
  youtube: [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.force-ssl",
  ].join(" "),
}

export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: { scope: scopes.spotify },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile '+scopes.youtube,
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, trigger, session}: any) {
      if (account) {
        token[account.provider] = {
          accessToken : account.access_token,
          refreshToken : account.refresh_token,
          provider : account.provider,
          expiresAt : account.expires_at,
          idToken : account.id_token 
        }
      }
      if (trigger === 'update') {
        token = {
          ...session,
          ...token,
        }
      }
      return token
    },
    async session({ session, token }: any) {
      session.spotify = token.spotify
      session.google = token.google
      session.youtube = token.youtube
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

