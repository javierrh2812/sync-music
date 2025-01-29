import { authOptions } from "@/app/utils/authOptions"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function GET() {
  const {google: session}: any = await getServerSession(authOptions)

  if (!session || !session.accessToken ) {
    return NextResponse.json({ error: "No estás autenticado con Google" }, { status: 401 })
  }

  try {
    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50",
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Error al obtener playlists: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error al obtener playlists de YouTube:", error)
    return NextResponse.json({ error: "Error al obtener playlists de YouTube" }, { status: 500 })
  }
}

