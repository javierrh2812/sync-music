# 🎵 Sync Music
Sincroniza tus playlists de Spotify y YT.
---


🔗 **Demo en vivo**: [sync-music-gold.vercel.app](https://sync-music-gold.vercel.app/)

---

## 🚀 Tecnologías utilizadas

- [Next.js](https://nextjs.org/) – Framework React moderno
- [NextAuth.js](https://next-auth.js.org/) – Autenticación con OAuth (Spotify y Google)
- [Vercel](https://vercel.com/) – Hosting y despliegue continuo

---

## ⚙️ Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto y agrega las siguientes variables:

```env
NEXTAUTH_URL=your-app-url
NEXTAUTH_SECRET=your-nextauth-secret

SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
````

> 📌 Asegúrate de haber registrado correctamente tus proveedores OAuth en sus respectivas consolas.

---

## 🔐 Autenticación

Este proyecto utiliza [NextAuth.js](https://next-auth.js.org/) para el manejo de sesiones y autenticación con proveedores OAuth como Spotify y Google.

* Guía rápida para usar NextAuth: [next-auth.js.org/getting-started/introduction](https://next-auth.js.org/getting-started/introduction)

---

## 🛠 Instalación local

```bash
git clone https://github.com/javierrh2812/sync-music.git
cd tu-repo
npm install
# o
yarn install

# Asegúrate de definir tus variables en .env.local
npm run dev
```
