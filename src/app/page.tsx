import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen">
      <header className="w-full py-6 px-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 relative">
            <div className="absolute inset-0 bg-green-500 rounded-full opacity-70"></div>
            <div className="absolute inset-0 bg-red-500 rounded-full opacity-70 translate-x-2"></div>
          </div>
          <h1 className="text-xl font-bold">MusicSync</h1>
        </div>
        <Link href="/login" className="btn-primary">
          Iniciar Sesión
        </Link>
      </header>

      <section className="flex-1 w-full max-w-6xl px-4 md:px-8 flex flex-col md:flex-row items-center justify-center gap-12 py-12">
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">Sincroniza tus playlists favoritas</h2>
          <p className="text-lg text-gray-300">
            Conecta tus cuentas de YouTube y Spotify para mantener tus playlists sincronizadas automáticamente entre
            ambas plataformas.
          </p>
          <div className="flex gap-4">
            <Link href="/login" className="btn-primary">
              Comenzar
            </Link>
            <Link href="#como-funciona" className="btn-outline border-white text-white">
              Cómo funciona
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 relative h-64 md:h-96 w-full">
          <div className="absolute top-0 right-0 w-4/5 h-4/5 bg-green-500/20 rounded-lg transform rotate-3"></div>
          <div className="absolute bottom-0 left-0 w-4/5 h-4/5 bg-red-500/20 rounded-lg transform -rotate-3"></div>
          <div className="absolute inset-0 m-auto w-4/5 h-4/5 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center"></div>
        </div>
      </section>

      <section id="como-funciona" className="w-full max-w-6xl px-4 md:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Cómo funciona</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card">
            <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Conecta tus cuentas</h3>
            <p className="text-gray-300">
              Inicia sesión con tus cuentas de YouTube y Spotify para dar acceso a tus playlists.
            </p>
          </div>
          <div className="card">
            <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Selecciona tus playlists</h3>
            <p className="text-gray-300">Elige qué playlists quieres sincronizar entre ambas plataformas.</p>
          </div>
          <div className="card">
            <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-bold mb-2">¡Sincroniza!</h3>
            <p className="text-gray-300">Mantén tus playlists actualizadas automáticamente en ambas plataformas.</p>
          </div>
        </div>
      </section>

      <footer className="w-full py-8 border-t border-gray-800 mt-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400">© 2025 MusicSync. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="/terminos" className="text-gray-400 hover:text-white">
              Términos
            </Link>
            <Link href="/privacidad" className="text-gray-400 hover:text-white">
              Privacidad
            </Link>
            <Link href="/contacto" className="text-gray-400 hover:text-white">
              Contacto
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

