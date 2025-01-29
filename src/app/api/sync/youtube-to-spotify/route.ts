import { authOptions } from "@/app/utils/authOptions"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const {google: session, spotify} = await getServerSession(authOptions)

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "No estás autenticado" }, { status: 401 })
  }

  try {
    const { youtubePlaylistId, spotifyPlaylistId } = await request.json()

    if (!youtubePlaylistId || !spotifyPlaylistId) {
      return NextResponse.json({ error: "Se requieren IDs de playlists" }, { status: 400 })
    }

    // 1. Obtener videos de YouTube
    const youtubeResponse = await fetch(
      `${process.env.NEXTAUTH_URL}/api/youtube/playlist/${youtubePlaylistId}/videos`,
      {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
      },
    )

    if (!youtubeResponse.ok) {
      throw new Error(`Error al obtener videos de YouTube: ${youtubeResponse.statusText}`)
    }

    const youtubeData = await youtubeResponse.json()
    const videos = youtubeData.items.map((item: any) => ({
      title: item.snippet.title,
      query: cleanYouTubeTitle(item.snippet.title),
    }))

    // 2. Para cada video, buscar en Spotify y añadir a la playlist
    const results = []

    for (const video of videos) {
      // Buscar canción en Spotify
      const searchQuery = encodeURIComponent(video.query)
      const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=1`, {
        headers: {
          Authorization: `Bearer ${spotify.accessToken}`,
        },
      })

      if (!searchResponse.ok) {
        console.error(`Error al buscar "${video.query}" en Spotify: ${searchResponse.statusText}`)
        results.push({
          video: video.title,
          status: "error",
          message: `Error al buscar en Spotify: ${searchResponse.statusText}`,
        })
        continue
      }

      const searchData = await searchResponse.json()

      if (!searchData.tracks || !searchData.tracks.items || searchData.tracks.items.length === 0) {
        results.push({
          video: video.title,
          status: "error",
          message: "No se encontraron resultados en Spotify",
        })
        continue
      }

      const trackUri = searchData.tracks.items[0].uri

      // Añadir canción a la playlist de Spotify
      // TODO: Manejar el caso de que la canción ya esté en la playlist
      // TODO: Manejar si la cancion encontrada no es la correcta, no es del artista o no es la versión correcta
      const addResponse = await fetch(`https://api.spotify.com/v1/playlists/${spotifyPlaylistId}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${spotify.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [trackUri],
        }),
      })

      if (!addResponse.ok) {
        console.error(`Error al añadir "${video.title}" a la playlist: ${addResponse.statusText}`)
        results.push({
          video: video.title,
          status: "error",
          message: `Error al añadir a la playlist: ${addResponse.statusText}`,
        })
        continue
      }

      results.push({
        video: video.title,
        status: "success",
        trackName: searchData.tracks.items[0].name,
        artist: searchData.tracks.items[0].artists.map((a: any) => a.name).join(", "),
      })
    }

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${results.filter((r) => r.status === "success").length} de ${videos.length} videos sincronizados`,
      results,
    })
  } catch (error) {
    console.error("Error en la sincronización:", error)
    return NextResponse.json({ error: "Error en la sincronización" }, { status: 500 })
  }
}

// Función para limpiar títulos de YouTube (eliminar cosas como "Official Video", etc.)
function cleanYouTubeTitle(title: string): string {
  return title
    .replace(/$$Official Video$$/i, "")
    .replace(/$$Official Music Video$$/i, "")
    .replace(/$$Official Audio$$/i, "")
    .replace(/$$Lyrics$$/i, "")
    .replace(/$$Lyric Video$$/i, "")
    .replace(/\[Official Video\]/i, "")
    .replace(/\[Official Music Video\]/i, "")
    .replace(/\[Official Audio\]/i, "")
    .replace(/\[Lyrics\]/i, "")
    .replace(/\[Lyric Video\]/i, "")
    .replace(/$$HD$$/i, "")
    .replace(/\[HD\]/i, "")
    .replace(/$$HQ$$/i, "")
    .replace(/\[HQ\]/i, "")
    .replace(/$$.*?Remix$$/i, "")
    .replace(/\[.*?Remix\]/i, "")
    .replace(/$$ft\..*?$$/i, "")
    .replace(/$$feat\..*?$$/i, "")
    .replace(/\[ft\..*?\]/i, "")
    .replace(/\[feat\..*?\]/i, "")
    .trim()
}

