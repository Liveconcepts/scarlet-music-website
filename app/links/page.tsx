"use client"

import Image from "next/image"
import Link from "next/link"
import { Instagram, Globe, ArrowRight } from "lucide-react"

export default function LinksPage() {
  const links = [
    {
      name: "Apple Music",
      url: "https://music.apple.com/us/artist/scarlet-music/1865668894",
      icon: "/images/apple-music-icon.png",
      color: "hover:shadow-[0_0_20px_rgba(250,35,59,0.3)]", // Brand color hint
    },
    {
      name: "Spotify",
      url: "https://open.spotify.com/artist/4G5MlnCz82h2XWi6ZvY91c?si=9NzOP2gPQAWspkPCeNswqw",
      icon: "/images/spotify-icon.png",
      color: "hover:shadow-[0_0_20px_rgba(29,185,84,0.3)]",
    },
    {
      name: "YouTube Music",
      url: "https://music.youtube.com/channel/UCf1wp-PLA4ldSyTZgrEtSjQ",
      icon: "/images/youtube-icon.png",
      color: "hover:shadow-[0_0_20px_rgba(255,0,0,0.3)]",
    },
    {
      name: "Amazon Music",
      url: "https://music.amazon.com/artists/B0GF9RR3XL/scarlet-made-it",
      icon: "/images/amazon-music-logo.png",
      color: "hover:shadow-[0_0_20px_rgba(35,212,236,0.2)]",
    },
    {
      name: "Pandora",
      url: "https://www.pandora.com/artist/scarlet-made-it/AR3pxZX93vr39x9",
      icon: "/images/pandora-20icon.png",
      color: "hover:shadow-[0_0_20px_rgba(50,85,190,0.3)]",
    },
    {
      name: "Official Website",
      url: "https://scarletsyndicate.com",
      icon: "/icon.png", // Using the Syndicate Icon favicon
      color: "hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] border-red-600/50 hover:border-red-600",
      customClass: "border border-red-500/30",
    },
  ]

  const socials = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/scarlet.made.it/",
      icon: <Instagram className="w-6 h-6" />,
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@scarlet.made.it",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-hidden flex flex-col items-center py-16 px-6">
      {/* Video Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-50 scale-110" // Increased opacity slightly
          >
            <source src="/media/hero-loop.mp4" type="video/mp4" />
          </video>
          {/* Darker gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center gap-10">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in duration-700">
          <div className="relative w-72 h-32">
            <Image 
              src="/images/scarlet-logo-current.png"
              alt="Scarlet"
              fill
              className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              priority
            />
          </div>
        </div>

        {/* Music Links */}
        <div className="w-full space-y-4 animate-in slide-in-from-bottom-4 duration-700 delay-200">
          {links.map((link, i) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                group relative w-full h-20 flex items-center justify-between px-6 
                bg-white/5 hover:bg-white/10 
                border-l-2 border-transparent hover:border-white
                backdrop-blur-md rounded-r-xl
                transition-all duration-300
                ${link.color}
                ${(link as any).customClass || ""}
              `}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 relative opacity-80 group-hover:opacity-100 transition-opacity">
                   <Image 
                     src={link.icon} 
                     alt={link.name}
                     fill
                     className="object-contain" // Some are oblong logos, contain is safer
                   />
                </div>
                <span className="text-lg font-bold uppercase tracking-wider">{link.name}</span>
              </div>
              <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-gray-400" />
            </a>
          ))}
        </div>

        {/* Socials */}
        <div className="flex items-center gap-8 animate-in slide-in-from-bottom-4 duration-700 delay-300">
          {socials.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-full bg-white/5 hover:bg-white/20 hover:scale-110 hover:text-red-500 transition-all duration-300 border border-white/5"
              aria-label={social.name}
            >
              {social.icon}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Footer */}
        <div className="mt-8 opacity-40">
           <Image
             src="/images/scarlet-20syndicate-20logo-20-28white-tagline-29.png"
             alt="Scarlet Syndicate"
             width={120}
             height={40}
           />
        </div>
      </div>
    </div>
  )
}
