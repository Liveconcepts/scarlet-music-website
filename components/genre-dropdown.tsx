"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface GenreDropdownProps {
  title: string
  description: string
  genres: string[]
}

export function GenreDropdown({ title, description, genres }: GenreDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-white/10 bg-black/40 backdrop-blur-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <h4 className="text-lg md:text-xl font-bold text-white tracking-wider">{title}</h4>
        <ChevronDown className={`w-6 h-6 text-white transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-6 border-t border-white/10">
          <p className="text-gray-300 leading-relaxed mb-6">{description}</p>
          <div className="space-y-2">
            <p className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3">Genres & Styles:</p>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
