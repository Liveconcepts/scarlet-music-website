"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"

interface GenreDropdownProps {
  title: string
  description: string
  genres: string[]
}

export default function GenreDropdown({ title, description, genres }: GenreDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="group relative">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left relative overflow-hidden">
        {/* Background with subtle glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative px-8 py-6 flex items-center justify-between border-l-2 border-white/20 group-hover:border-white transition-colors duration-300">
          <div className="flex-1">
            <h4 className="text-2xl md:text-3xl font-light text-white tracking-[0.2em] uppercase mb-2">{title}</h4>
            <div className="h-px w-16 bg-white/40 group-hover:w-32 transition-all duration-500" />
          </div>

          <ChevronRight
            className={`w-8 h-8 text-white/60 group-hover:text-white transition-all duration-500 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-700 ease-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-8 py-8 ml-8 border-l border-white/10">
          <p className="text-gray-400 text-lg leading-relaxed mb-8 font-light max-w-4xl">{description}</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {genres.map((genre, idx) => (
              <div
                key={idx}
                className="group/tag relative overflow-hidden"
                style={{
                  animationDelay: `${idx * 50}ms`,
                  animation: isOpen ? "fadeInUp 0.5s ease-out forwards" : "none",
                }}
              >
                <div className="px-4 py-3 bg-black/60 border border-white/10 hover:border-white/40 hover:bg-white/5 transition-all duration-300 backdrop-blur-sm">
                  <span className="text-sm text-gray-300 group-hover/tag:text-white font-light tracking-wide transition-colors">
                    {genre}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
