"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

type Playlist = {
  id: string
  name: string
  images: { url: string }[]
  tracks?: { total: number }
  itemCount?: number
}

export default function Dashboard() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const [realSession, setRealSession] = useState();

  const [spotifyPlaylists, setSpotifyPlaylists] = useState<Playlist[]>([])
  const [youtubePlaylists, setYoutubePlaylists] = useState<Playlist[]>([])
  const [selectedSpotifyPlaylist, setSelectedSpotifyPlaylist] = useState<string>("")
  const [selectedYoutubePlaylist, setSelectedYoutubePlaylist] = useState<string>("")
  const [syncDirection, setSyncDirection] = useState<"spotify-to-youtube" | "youtube-to-spotify">("spotify-to-youtube")
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResults, setSyncResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [integrated, setIntegrated] = useState(false)

  useEffect(()=>{
    const prevSession = JSON.parse(localStorage.getItem('session_auth') ?? '{}')
    console.log({integrated, session})
    if (!session || integrated) return;
    const allSessions = {...session, ...prevSession}
    localStorage.setItem('session_auth', JSON.stringify(allSessions))

    if (
      (prevSession.spotify && !session.spotify) ||
      (prevSession.google && !session.google) || 
      (prevSession.google && prevSession.spotify) 
     ) {
      console.log({allSessions, integrated})
      update(allSessions);
      setIntegrated(true)
     }
  }, [session])

  useEffect(()=>{
    if (realSession) {
      update(realSession)
    }
  }, [realSession])
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function fetchPlaylists() {
      setIsLoading(true)
      setError(null)

      if (session?.spotify) {
        try {
          const spotifyRes = await fetch("/api/spotify/playlists")
          if (spotifyRes.ok) {
            const data = await spotifyRes.json()
            setSpotifyPlaylists(data.items || [])
          }
        } catch (err) {
          console.error("Error al cargar playlists de Spotify:", err)
        }
      }

      if (session?.google) {
        try {
          const youtubeRes = await fetch("/api/youtube/playlists")
          if (youtubeRes.ok) {
            const data = await youtubeRes.json()
            setYoutubePlaylists(
              data.items?.map((item: any) => ({
                id: item.id,
                name: item.snippet.title,
                images: [{ url: item.snippet.thumbnails?.high?.url || "/placeholder.svg?height=60&width=60" }],
                itemCount: item.contentDetails.itemCount,
              })) || [],
            )
          }
        } catch (err) {
          console.error("Error al cargar playlists de YouTube:", err)
        }
      }

      setIsLoading(false)
    }

    if (session) {
      fetchPlaylists()
    }
  }, [session])

  const handleSync = async () => {
    if (!selectedSpotifyPlaylist && syncDirection === "spotify-to-youtube") {
      setError("Selecciona una playlist de Spotify")
      return
    }

    if (!selectedYoutubePlaylist && syncDirection === "youtube-to-spotify") {
      setError("Selecciona una playlist de YouTube")
      return
    }

    if (!selectedYoutubePlaylist && syncDirection === "spotify-to-youtube") {
      setError("Selecciona una playlist de YouTube de destino")
      return
    }

    if (!selectedSpotifyPlaylist && syncDirection === "youtube-to-spotify") {
      setError("Selecciona una playlist de Spotify de destino")
      return
    }

    setIsSyncing(true)
    setError(null)
    setSyncResults(null)

    try {
      const endpoint = `/api/sync/${syncDirection}`
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spotifyPlaylistId: selectedSpotifyPlaylist,
          youtubePlaylistId: selectedYoutubePlaylist,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error en la sincronización")
      }

      setSyncResults(data)
    } catch (err: any) {
      console.error("Error en la sincronización:", err)
      setError(err.message || "Error en la sincronización. Por favor, intenta de nuevo.")
    } finally {
      setIsSyncing(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-green-500 rounded-full border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-4 px-4 md:px-8 border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 relative">
              <div className="absolute inset-0 bg-green-500 rounded-full opacity-70"></div>
              <div className="absolute inset-0 bg-red-500 rounded-full opacity-70 translate-x-2"></div>
            </div>
            <h1 className="text-xl font-bold">MusicSync</h1>
          </Link>
          <div className="flex items-center gap-4">
            {session?.user?.image && (
              <Image
                src={session.user.image || "/placeholder.svg"}
                alt={session.user.name || "Usuario"}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <span className="hidden md:inline">{session?.user?.name}</span>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-gray-400 hover:text-white">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-6">Sincronizar Playlists</h2>

        {error && <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-white">{error}</div>}

        {syncResults && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 text-white">
            <h3 className="font-bold mb-2">{syncResults.message}</h3>
            <div className="max-h-40 overflow-y-auto">
              <ul className="space-y-1 text-sm">
                {syncResults.results.map((result: any, index: number) => (
                  <li
                    key={index}
                    className={`flex items-center gap-2 ${result.status === "success" ? "text-green-400" : "text-red-400"}`}
                  >
                    {result.status === "success" ? (
                      <>✅ {syncDirection === "spotify-to-youtube" ? result.track : result.video} - Sincronizado</>
                    ) : (
                      <>
                        ❌ {syncDirection === "spotify-to-youtube" ? result.track : result.video} - {result.message}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Spotify Playlists */}
          <div className="card">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">S</span>
                </div>
                <h3 className="text-xl font-bold">Spotify</h3>
              </div>
              {!session?.spotify && (
                <button onClick={() => signIn("spotify")} className="btn-primary text-sm">
                  Conectar Spotify
                </button>
              )}
            </div>

            {session?.spotify ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {spotifyPlaylists.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No se encontraron playlists</p>
                ) : (
                  spotifyPlaylists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className={`flex items-center p-3 rounded-lg transition-all cursor-pointer ${
                        selectedSpotifyPlaylist === playlist.id
                          ? "bg-green-500/20 border border-green-500/50"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                      onClick={() => setSelectedSpotifyPlaylist(playlist.id)}
                    >
                      <div className="flex-shrink-0 mr-3">
                        <Image
                          src={playlist.images?.[0]?.url || "/placeholder.svg?height=60&width=60"}
                          alt={playlist.name}
                          width={60}
                          height={60}
                          className="rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{playlist.name}</h4>
                        <p className="text-sm text-gray-400">{playlist.tracks?.total || 0} canciones</p>
                      </div>
                      <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center">
                        {selectedSpotifyPlaylist === playlist.id && (
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">Conecta tu cuenta de Spotify para ver tus playlists</p>
            )}
          </div>

          {/* YouTube Playlists */}
          <div className="card">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FF0000] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">YT</span>
                </div>
                <h3 className="text-xl font-bold">YouTube</h3>
              </div>
              {!session?.google && (
                <button onClick={() => signIn("google")} className="btn-primary text-sm">
                  Conectar YouTube
                </button>
              )}
            </div>
            {session?.google? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {youtubePlaylists.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No se encontraron playlists</p>
                ) : (
                  youtubePlaylists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className={`flex items-center p-3 rounded-lg transition-all cursor-pointer ${
                        selectedYoutubePlaylist === playlist.id
                          ? "bg-red-500/20 border border-red-500/50"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                      onClick={() => setSelectedYoutubePlaylist(playlist.id)}
                    >
                      <div className="flex-shrink-0 mr-3">
                        <Image
                          src={playlist.images[0]?.url || "/placeholder.svg?height=60&width=60"}
                          alt={playlist.name}
                          width={60}
                          height={60}
                          className="rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{playlist.name}</h4>
                        <p className="text-sm text-gray-400">{playlist.itemCount || 0} videos</p>
                      </div>
                      <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center">
                        {selectedYoutubePlaylist === playlist.id && (
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">Conecta tu cuenta de YouTube para ver tus playlists</p>
            )}
          </div>
        </div>

        {/* Sync Controls */}
        <div className="mt-8 card">
          <h3 className="text-xl font-bold mb-4">Opciones de sincronización</h3>

          <div className="mb-6">
            <p className="mb-2 font-medium">Dirección de sincronización:</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="direction"
                  checked={syncDirection === "spotify-to-youtube"}
                  onChange={() => setSyncDirection("spotify-to-youtube")}
                  className="w-4 h-4 accent-green-500"
                />
                <span>Spotify → YouTube</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="direction"
                  checked={syncDirection === "youtube-to-spotify"}
                  onChange={() => setSyncDirection("youtube-to-spotify")}
                  className="w-4 h-4 accent-red-500"
                />
                <span>YouTube → Spotify</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={
              isSyncing ||
              !session?.spotify ||
              !session?.google ||
              (!selectedSpotifyPlaylist && syncDirection === "spotify-to-youtube") ||
              (!selectedYoutubePlaylist && syncDirection === "youtube-to-spotify") ||
              (!selectedYoutubePlaylist && syncDirection === "spotify-to-youtube") ||
              (!selectedSpotifyPlaylist && syncDirection === "youtube-to-spotify")
            }
            className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSyncing ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Sincronizando...</span>
              </>
            ) : (
              <span>Sincronizar playlists</span>
            )}
          </button>
        </div>
      </main>
    </div>
  )
}

