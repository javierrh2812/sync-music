import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Music Playlist Sync",
  description: "Sincroniza tus playlists entre YouTube y Spotify",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}

