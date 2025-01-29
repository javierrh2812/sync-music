"use client"

import { useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSpotifyLogin = async () => {
    setIsLoading(true)
    await signIn("spotify", { callbackUrl: "/dashboard" })
  }

  const handleYouTubeLogin = async () => {
    setIsLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-6 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 relative">
            <div className="absolute inset-0 bg-green-500 rounded-full opacity-70"></div>
            <div className="absolute inset-0 bg-red-500 rounded-full opacity-70 translate-x-2"></div>
          </div>
          <h1 className="text-xl font-bold">MusicSync</h1>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="card max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-8">Conecta tus cuentas</h2>

          <div className="space-y-4">
            <button
              onClick={handleSpotifyLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-full flex items-center justify-center gap-3 transition-all disabled:opacity-70"
            >
              <div className="w-6 h-6 relative">
                <div className="absolute inset-0 rounded-full bg-black flex items-center justify-center">
                  <span className="text-[#1DB954] text-xs font-bold">S</span>
                </div>
              </div>
              <span className="font-medium">Continuar con Spotify</span>
            </button>

            <button
              onClick={handleYouTubeLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#FF0000] hover:bg-red-600 text-white rounded-full flex items-center justify-center gap-3 transition-all disabled:opacity-70"
            >
              <div className="w-6 h-6 relative">
                <div className="absolute inset-0 rounded-full bg-white flex items-center justify-center">
                  <span className="text-[#FF0000] text-xs font-bold">YT</span>
                </div>
              </div>
              <span className="font-medium">Continuar con YouTube</span>
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-gray-400">
            <p>Al iniciar sesión, aceptas nuestros</p>
            <p>
              <Link href="/terminos" className="text-green-500 hover:underline">
                Términos de servicio
              </Link>
              {" y "}
              <Link href="/privacidad" className="text-green-500 hover:underline">
                Política de privacidad
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

