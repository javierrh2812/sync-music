import { authOptions } from "@/app/utils/authOptions"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: any) {
  const {spotify: session}: any = await getServerSession(authOptions)

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "No estás autenticado con Spotify" }, { status: 401 })
  }

  const {id: playlistId} = await params

  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Error al obtener canciones: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error al obtener canciones de la playlist:", error)
    return NextResponse.json({ error: "Error al obtener canciones de la playlist" }, { status: 500 })
  }
}

