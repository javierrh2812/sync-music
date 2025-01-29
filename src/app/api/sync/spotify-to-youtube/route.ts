import { authOptions } from "@/app/utils/authOptions"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const {spotify: session, google} = await getServerSession(authOptions)

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "No estás autenticado" }, { status: 401 })
  }

  try {
    const { spotifyPlaylistId, youtubePlaylistId } = await request.json()

    if (!spotifyPlaylistId || !youtubePlaylistId) {
      return NextResponse.json({ error: "Se requieren IDs de playlists" }, { status: 400 })
    }

    // 1. Obtener canciones de Spotify
    const spotifyResponse = await fetch(
      `${process.env.NEXTAUTH_URL}/api/spotify/playlist/${spotifyPlaylistId}/tracks`,
      {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
      },
    )

    if (!spotifyResponse.ok) {
      throw new Error(`Error al obtener canciones de Spotify: ${spotifyResponse.statusText}`)
    }

    const spotifyData = await spotifyResponse.json()
    const tracks = spotifyData.items.map((item: any) => ({
      name: item.track.name,
      artist: item.track.artists.map((artist: any) => artist.name).join(", "),
      query: `${item.track.name} ${item.track.artists[0].name}`,
    }))

    // 2. Para cada canción, buscar en YouTube y añadir a la playlist
    const results = []

    for (const track of tracks) {
      // Buscar video en YouTube
      const searchQuery = encodeURIComponent(track.query)
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=1`,
        {
          headers: {
            Authorization: `Bearer ${google.accessToken}`,
          },
        },
      )

      if (!searchResponse.ok) {
        console.error(`Error al buscar "${track.query}" en YouTube: ${searchResponse.statusText}`)
        results.push({
          track: track.name,
          status: "error",
          message: `Error al buscar en YouTube: ${searchResponse.statusText}`,
        })
        continue
      }

      const searchData = await searchResponse.json()

      if (!searchData.items || searchData.items.length === 0) {
        results.push({
          track: track.name,
          status: "error",
          message: "No se encontraron resultados en YouTube",
        })
        continue
      }

      const videoId = searchData.items[0].id.videoId

      // Añadir video a la playlist de YouTube
      const addResponse = await fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${google.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            playlistId: youtubePlaylistId,
            resourceId: {
              kind: "youtube#video",
              videoId: videoId,
            },
          },
        }),
      })

      if (!addResponse.ok) {
        console.error(`Error al añadir "${track.name}" a la playlist: ${addResponse.statusText}`)
        results.push({
          track: track.name,
          status: "error",
          message: `Error al añadir a la playlist: ${addResponse.statusText}`,
        })
        continue
      }

      results.push({
        track: track.name,
        status: "success",
        videoId: videoId,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${results.filter((r) => r.status === "success").length} de ${tracks.length} canciones sincronizadas`,
      results,
    })
  } catch (error) {
    console.error("Error en la sincronización:", error)
    return NextResponse.json({ error: "Error en la sincronización" }, { status: 500 })
  }
}

