import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/utils/authOptions"
export async function GET(request: Request, { params }: any) {
  const {google: session}:any = await getServerSession(authOptions)

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "No estás autenticado con Google" }, { status: 401 })
  }

  const {id: playlistId} = await params

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Error al obtener videos: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error al obtener videos de la playlist:", error)
    return NextResponse.json({ error: "Error al obtener videos de la playlist" }, { status: 500 })
  }
}

