import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [

    ],
    domains: ['i.scdn.co',
       'mosaic.scdn.co', 
       'image-cdn-fa.spotifycdn.com', 
       '*.com', '*.co', 
       'image-cdn-ak.spotifycdn.com',
       'lh3.googleusercontent.com',
       'i.ytimg.com'
      ]
  }
};

export default nextConfig;
