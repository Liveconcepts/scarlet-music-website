"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Menu, X, Instagram, ChevronDown, Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react"
import GenreDropdown from "./GenreDropdown" // Import GenreDropdown component
import Equalizer from "@/components/equalizer"

export default function ScarletPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTrack, setCurrentTrack] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const [volume, setVolume] = useState(1) // Declare volume state

  const tracks = [
    {
      title: "ANA10G H3LL",
      note: "(Unreleased Preview)",
      artist: "Scarlet",
      album: "decadance.",
      duration: "3:42",
      file: "/media/ana10g-h311.mp3",
    },
    {
      title: "Say My Name",
      artist: "Scarlet",
      album: "decadance.",
      duration: "3:28",
      file: "/media/say-my-name.mp3",
      albumArt: "/images/say-my-name-album-art.png",
    },
    {
      title: "Phantom",
      artist: "Scarlet",
      album: "Single",
      duration: "3:00",
      file: "/media/Phantom-Singe.wav",
      albumArt: "/images/Phantom Album Cover.png",
    },
    {
      title: "Bring It Back",
      artist: "Scarlet",
      album: "Single",
      duration: "3:00",
      file: "/media/Bring It Back-Single.wav",
      albumArt: "/images/Scarlet Bring It Back Album Cover.png",
    },
    {
      title: "Pitfire (Feat. Zanaii)",
      artist: "Scarlet",
      album: "Single",
      duration: "3:00",
      file: "/media/pitfire. (Feat. Zanaii).wav",
      albumArt: "/images/Pitfire Album Art.png",
    },
  ]

  useEffect(() => {
    setIsVisible(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
    }
  }, [])

  useEffect(() => {
    if (!audioRef.current) return

    // Initialize audio context only once
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 2048 // Increased for better bass resolution
      analyserRef.current.smoothingTimeConstant = 0.5 // Lowered for faster, snappier visuals

      // Only create source node once
      if (!sourceNodeRef.current) {
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current)
        sourceNodeRef.current.connect(analyserRef.current)
        analyserRef.current.connect(audioContextRef.current.destination)
      }
    }

    // Resume context if suspended
    if (isPlaying && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume()
    }

    return () => {
      // Cleanup if needed
    }
  }, [isPlaying])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) {
      console.log("[v0] No audio ref")
      return
    }

    if (currentTrack === null) {
      console.log("[v0] No track selected, playing first track")
      playTrack(0)
      return
    }

    console.log("[v0] Audio src:", audio.src)
    console.log("[v0] Current playing state:", isPlaying)

    if (isPlaying) {
      console.log("[v0] Pausing audio")
      audio.pause()
    } else {
      console.log("[v0] Attempting to play audio")
      // Ensure audio context is resumed before playing
      if (audioContextRef.current?.state === "suspended") {
        console.log("[v0] Resuming suspended audio context")
        audioContextRef.current.resume().then(() => {
          audio.play().catch((error) => {
            console.error("[v0] Error playing audio:", error)
          })
        })
      } else {
        audio.play().catch((error) => {
          console.error("[v0] Error playing audio:", error)
        })
      }
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number.parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const playTrack = (index: number) => {
    console.log("[v0] playTrack called with index:", index)
    console.log("[v0] Track file:", tracks[index].file)

    setCurrentTrack(index)
    const audio = audioRef.current

    if (audio) {
      // Pause current playback if any
      audio.pause()

      // Set new source
      audio.src = tracks[index].file

      // Load and play
      audio.load()

      // Resume audio context if suspended
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume()
      }

      // Play after a short delay to ensure load has started
      setTimeout(() => {
        audio
          .play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch((error) => {
            console.error("[v0] Error playing audio:", error)
          })
      }, 100)
    }
  }

  const nextTrack = () => {
    const next = (currentTrack + 1) % tracks.length
    playTrack(next)
  }

  const previousTrack = () => {
    const prev = (currentTrack - 1 + tracks.length) % tracks.length
    playTrack(prev)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 lg:px-12">
        <div className="flex items-center justify-between">
          <div />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-12">
            <a
              href="#music"
              className="text-sm uppercase tracking-[0.2em] hover:text-white transition-colors duration-300"
            >
              Music
            </a>
            <a
              href="#about"
              className="text-sm uppercase tracking-[0.2em] hover:text-white transition-colors duration-300"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-sm uppercase tracking-[0.2em] hover:text-white transition-colors duration-300"
            >
              Contact
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-white transition-colors duration-300"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-black z-40 flex items-center justify-center transition-all duration-500 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="flex flex-col items-center gap-8">
          <a
            href="#music"
            onClick={() => setIsMenuOpen(false)}
            className="text-2xl uppercase tracking-[0.3em] hover:text-white transition-colors duration-300"
          >
            Music
          </a>
          <a
            href="#about"
            onClick={() => setIsMenuOpen(false)}
            className="text-2xl uppercase tracking-[0.3em] hover:text-white transition-colors duration-300"
          >
            About
          </a>
          <a
            href="#contact"
            onClick={() => setIsMenuOpen(false)}
            className="text-2xl uppercase tracking-[0.3em] hover:text-white transition-colors duration-300"
          >
            Contact
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div
          className="fixed inset-0 top-0 transition-transform duration-1000 ease-out z-0 pointer-events-none"
          style={{ transform: `translateY(0)` }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-90 scale-110"
          >
            <source src="/media/hero-loop.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black" />
        </div>

        <div
          className="relative z-10 text-center transition-all duration-1000 ease-out delay-300"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: `translateY(${isVisible ? 0 : 40}px)`,
          }}
        >
          <div className="mb-12">
            <Image
              src="/images/scarlet-20logo-20-28blur-29.png"
              alt="Scarlet"
              width={600}
              height={200}
              className="mx-auto w-full max-w-md md:max-w-2xl h-auto"
            />
          </div>

          <div className="animate-bounce">
            <ChevronDown size={32} className="mx-auto text-white" />
          </div>
        </div>
      </section>

      {/* Audio Player Section */}
      <div className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
            <Equalizer analyser={analyserRef.current} isPlaying={isPlaying} />
            <div className="relative z-10 grid lg:grid-cols-[280px_1fr] gap-0">
              {/* Album Art - Compact */}
              <div className="relative bg-black p-6 border-r border-white/10">
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  {currentTrack !== null && tracks[currentTrack].albumArt ? (
                    <Image
                      src={tracks[currentTrack].albumArt || "/placeholder.svg"}
                      alt="decadance. Album Cover"
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <Image
                      src="/images/scarlet-20album-20cover.png"
                      alt="decadance. Album Cover"
                      fill
                      className="object-cover"
                      priority
                    />
                  )}
                </div>
                <div className="mt-4 text-center">
                  <h4 className="text-lg font-bold uppercase tracking-wider">decadance.</h4>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Scarlet • 2026</p>
                </div>
              </div>

              {/* Main Player Area */}
              <div className="p-8 space-y-6">
                {/* Tracklist - Now at top */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">Tracks</h4>
                  <div className="space-y-1">
                    {tracks.map((track, index) => (
                      <button
                        key={index}
                        onClick={() => playTrack(index)}
                        className={`w-full text-left px-4 py-3 rounded transition-all duration-200 flex items-center gap-4 group ${
                          currentTrack === index
                            ? "bg-white/10 text-white"
                            : "hover:bg-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-xs font-mono">
                          {currentTrack === index && isPlaying ? (
                            <Pause size={14} />
                          ) : (
                            <span>{String(index + 1).padStart(2, "0")}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold uppercase tracking-wide truncate">
                            {track.title}
                            {(track as any).note && (
                              <span className="text-[10px] font-normal normal-case text-gray-400 ml-2">
                                {(track as any).note}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 uppercase tracking-wide truncate">{track.artist}</p>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">{track.duration}</span>
                      </button>
                    ))}
                  </div>
                </div>


                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-6 pt-2">
                  <button
                    onClick={previousTrack}
                    className="text-white/60 hover:text-white transition-colors duration-200"
                    aria-label="Previous track"
                  >
                    <SkipBack size={24} fill="currentColor" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause size={24} fill="currentColor" />
                    ) : (
                      <Play size={24} fill="currentColor" className="ml-1" />
                    )}
                  </button>
                  <button
                    onClick={nextTrack}
                    className="text-white/60 hover:text-white transition-colors duration-200"
                    aria-label="Next track"
                  >
                    <SkipForward size={24} fill="currentColor" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-white/10 appearance-none cursor-pointer rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <div className="flex items-center gap-3">
                      <Volume2 size={14} className="text-gray-500" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-white/10 appearance-none cursor-pointer rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                      />
                    </div>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Album Section */}
      <section id="music" className="relative py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div
              className="relative aspect-square transition-all duration-700 ease-out hover:scale-105"
              style={{
                opacity: scrollY > 200 ? 1 : 0,
                transform: `translateX(${scrollY > 200 ? 0 : -50}px)`,
              }}
            >
              <Image
                src="/images/scarlet-20album-20cover.png"
                alt="Decadance Album Cover"
                fill
                className="object-cover"
              />
            </div>

            <div
              className="space-y-8 transition-all duration-700 ease-out delay-200"
              style={{
                opacity: scrollY > 200 ? 1 : 0,
                transform: `translateX(${scrollY > 200 ? 0 : 50}px)`,
              }}
            >
              <h2 className="text-5xl md:text-6xl font-bold uppercase tracking-[0.2em] text-balance">
                Decadance<span className="text-white">.</span>
              </h2>
              <p className="text-xl tracking-[0.15em] text-white uppercase">Debut Album — Coming 2026</p>
              <div className="space-y-4">
                <p className="text-lg leading-relaxed text-gray-300 font-bold">
                  DECADANCE is not an EP; it is a weapon.
                </p>
                <p className="text-base leading-relaxed text-gray-400">
                  The debut project from Scarlet is a scorched-earth tactical assault on conventional sound, serving as
                  the definitive statement on Maximum Impact and Zero Boundaries.
                </p>
                <p className="text-base leading-relaxed text-gray-400">
                  This collection of tracks is an explosion of meticulously engineered chaos. Scarlet forces the
                  crushing, raw power of Hard Trap and relentless Aggressive Electronic Sound Design to collide with the
                  structural violence of Industrial and Metal. Below the wreckage, high-tension Electronicore bleeds
                  into reconstructed Hip Hop and distorted R&B forms.
                </p>
                <p className="text-base leading-relaxed text-gray-400 font-bold">
                  This record doesn&apos;t borrow from genres—it pillages them. Prepare for an unprecedented surge of
                  innovation and a total sonic demolition.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-32 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <h2
            className="text-5xl md:text-7xl font-bold uppercase tracking-[0.2em] mb-20 transition-all duration-700 ease-out"
            style={{
              opacity: scrollY > 800 ? 1 : 0,
              transform: `translateY(${scrollY > 800 ? 0 : 40}px)`,
            }}
          >
            Discover The Sound
          </h2>

          <div className="space-y-16">
            {/* Maximum Impact */}
            <div
              className="space-y-6 transition-all duration-700 ease-out delay-100"
              style={{
                opacity: scrollY > 900 ? 1 : 0,
                transform: `translateY(${scrollY > 900 ? 0 : 40}px)`,
              }}
            >
              <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-[0.15em] text-white text-pretty">
                Maximum Impact
              </h3>
              <p className="text-lg md:text-xl leading-relaxed text-gray-300 text-pretty">
                Scarlet, forged in Pennsylvania, USA, is a hybrid force dismantling the barriers between genres—a
                producer and DJ bound by a single doctrine: Maximum Impact. From skull-crushing bass drops to sweeping
                cinematic grandeur, every production is engineered to hit harder, cut deeper, and leave a lasting mark.
                This isn&apos;t about fitting into a lane. It&apos;s about owning every lane and building new ones where
                none exist.
              </p>
            </div>

            {/* Sonic Warfare */}
            <div
              className="space-y-6 transition-all duration-700 ease-out delay-200"
              style={{
                opacity: scrollY > 1100 ? 1 : 0,
                transform: `translateY(${scrollY > 1100 ? 0 : 40}px)`,
              }}
            >
              <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-[0.15em] text-white text-pretty">
                Sonic Warfare
              </h3>
              <p className="text-lg md:text-xl leading-relaxed text-gray-300 text-pretty">
                Conventional labels don&apos;t apply here. Scarlet architects deliberate collisions—melding the
                theatrical weight of orchestral scoring with the raw devastation of electronic production. Metalcore
                breakdowns slam into festival trap. Industrial grit bleeds through melodic dubstep. Hard trap 808s shake
                beneath layers of progressive complexity. The result is a sound that refuses to be categorized:
                aggressive yet emotional, chaotic yet calculated, familiar yet entirely its own. This is music built for
                mosh pits, main stages, headphones at 2AM, and everything in between.
              </p>
            </div>

            {/* Beyond the Chaos */}
            <div
              className="space-y-6 transition-all duration-700 ease-out delay-300"
              style={{
                opacity: scrollY > 1300 ? 1 : 0,
                transform: `translateY(${scrollY > 1300 ? 0 : 40}px)`,
              }}
            >
              <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-[0.15em] text-white text-pretty">
                Beyond the Chaos
              </h3>
              <p className="text-lg md:text-xl leading-relaxed text-gray-300 text-pretty">
                But impact isn&apos;t only measured in decibels. Scarlet moves with equal precision through the quiet
                and the colossal—crafting somber, introspective soundscapes that breathe with emotional weight. Lush R&B
                productions. Smooth, melodic hip-hop. Atmospheric synth-driven pop. Haunting darkwave. Sweeping
                orchestral epics that belong in film scores and trailers. Deep house grooves built for late nights.
                Future bass anthems dripping with euphoria.
              </p>
              <p className="text-lg md:text-xl leading-relaxed text-gray-300 text-pretty">
                The spectrum is infinite: from intimate and vulnerable to grand and triumphant. From dancefloor heat to
                headphone intimacy. Whether it&apos;s a melancholic ballad, a radio-ready pop record, a progressive rock
                odyssey, or a genre-defying fusion that hasn&apos;t been named yet—Scarlet delivers with the same
                uncompromising vision.
              </p>
              <p className="text-lg md:text-xl leading-relaxed text-gray-300 text-pretty italic">
                Power doesn&apos;t always roar. Sometimes it whispers—and still leaves you shattered.
              </p>
            </div>

            {/* Demolition & Creation */}
            <div
              className="space-y-6 transition-all duration-700 ease-out delay-400"
              style={{
                opacity: scrollY > 1500 ? 1 : 0,
                transform: `translateY(${scrollY > 1500 ? 0 : 40}px)`,
              }}
            >
              <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-[0.15em] text-white text-pretty">
                Demolition & Creation
              </h3>
              <p className="text-lg md:text-xl leading-relaxed text-gray-300 text-pretty">
                The mission is evolution. Scarlet deconstructs hip-hop, R&B, rock, and electronic music—then rebuilds
                them with cinematic tension, electronic fury, and unrelenting innovation. Collaboration fuels the fire;
                versatility sharpens the blade. What exists today is just the beginning. Every genre is a future
                territory. Every sound is a weapon waiting to be forged.
              </p>
              <p className="text-lg md:text-xl leading-relaxed text-gray-300 text-pretty font-bold">
                This is demolition. This is creation. <span className="font-light">This is Scarlet.</span>
              </p>
            </div>

            {/* Genres Section */}
            <div className="mt-16 max-w-5xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">SONIC TERRITORIES</h3>
              <div className="space-y-4">
                {[
                  {
                    title: "TRAP, BASS & ELECTRONIC",
                    description:
                      "Raw. Aggressive. Unapologetic. Scarlet takes heavy inspiration from the screechy, distorted, in-your-face sound that turned trap EDM into a weapon—the kind of production that makes you want to break something. Gritty synths rip through pounding 808s. Every drop hits like a statement. No polish, no apologies—just pure sonic aggression designed to overwhelm. Beyond that foundation, Scarlet pulls from the Hard Trap movement, the golden era of festival trap, and the SoundCloud underground that proved electronic music could be just as raw and rebellious as any mosh pit. From skull-crushing bass to mainstage-ready warfare, this is high-octane production built for chaos.",
                    genres: [
                      "Hard Trap",
                      "Raw Trap",
                      "Festival Trap",
                      "Melodic Dubstep",
                      "Hybrid Trap",
                      "Dubstep",
                      "Riddim",
                      "Hardstyle",
                      "Rawstyle",
                      "Bass House",
                      "Electro House",
                      "Industrial Bass",
                      "Acid Trap",
                      "Metal-EDM Hybrid",
                      "Future Bass",
                    ],
                  },
                  {
                    title: "ROCK, METALCORE & SCENE",
                    description:
                      "Perpetually stuck in 2010—and proud of it. Scarlet channels the golden era of the scene: the MySpace generation, the rise of electronicore, and the infamous crabcore stance that defined a movement. Crushing breakdowns collide with auto-tuned cleans, synth stabs crash into screamed catharsis, and soaring choruses lift arena-sized hooks to anthemic heights. This is the collision of electronic production and guitar-driven devastation—theatrical intensity, gothic darkness, raw emotion, and an unapologetic love for the era that shaped it all. From pit-ready chaos to neon-soaked nostalgia.",
                    genres: [
                      "Metalcore",
                      "Post-Hardcore",
                      "Electronicore",
                      "Industrial Metal",
                      "Deathcore",
                      "Nu-Metal",
                      "Emo",
                      "Theatrical",
                      "Pop-Punk",
                      "Hard Rock",
                      "Gothic / Horror Metal",
                      "Rap-Metal",
                      "Party Metal",
                    ],
                  },
                  {
                    title: "MAINSTREAM EDM & HOUSE",
                    description:
                      "Main stage energy, engineered for millions. Scarlet crafts radio-ready anthems and explosive festival sounds—euphoric builds, massive drops, and groove-driven club heat. Polished, infectious, and built to dominate speakers worldwide.",
                    genres: [
                      "Progressive House",
                      "Electro House",
                      "Big Room",
                      "Dance-Pop",
                      "Pop-EDM",
                      "Future Bass",
                      "Deep House",
                      "Melbourne Bounce",
                      "Dirty Dutch",
                      "Techno",
                      "Synthpop",
                      "Electro-Punk",
                    ],
                  },
                  {
                    title: "SOUTHERN RAP & TRAP",
                    description:
                      "Raised on the architects of the South. Scarlet's foundation was built on early 2000s Atlanta hunger, Houston swagger, and the raw, unpolished grit that defined an era before trap went mainstream. The Snowman era. The King of the South reign. Zone 6 origins. Block anthems with heavy snares and basslines that rattled trunks before the world caught on. This is where it started—808s hitting like earthquakes, dark melodies carrying undeniable weight, and that unmistakable Southern drawl that shaped modern hip-hop. Raw, unapologetic, and forever rooted in the streets that started it all.",
                    genres: [
                      "Trap",
                      "Southern Hip-Hop",
                      "Atlanta Trap",
                      "Memphis Trap",
                      "Gangsta Rap",
                      "Dark Trap",
                      "Street Rap",
                      "Crunk",
                      "Hype Trap",
                      "Houston Rap / Chopped & Screwed",
                      "Club Rap",
                    ],
                  },
                  {
                    title: "HIP-HOP, POP-RAP & R&B",
                    description:
                      "Built on the blueprints of the greats. Scarlet draws from the legendary production lineage—the cinematic drama of Toomp's strings, the unmistakable bounce of Storch's keys, and the dark, atmospheric weight that redefined modern trap production. This is polished yet soulful, melodic yet hard-hitting. Smooth R&B grooves sit next to pop-forward hooks. Conscious lyricism meets infectious club energy. Introspective storytelling collides with anthems built for windows down and speakers blown. From timeless soul samples to cutting-edge sound design—every track carries the DNA of the producers who shaped hip-hop's evolution.",
                    genres: [
                      "Pop-Rap",
                      "R&B",
                      "Alt-R&B",
                      "Contemporary R&B",
                      "Conscious Hip-Hop",
                      "Lyrical Hip-Hop",
                      "Synth-Pop",
                      "West Coast Hip-Hop",
                      "East Coast Hip-Hop",
                      "Midwest Hip-Hop",
                      "Country Rap",
                      "Rap-Rock",
                      "Cinematic Rap",
                    ],
                  },
                  {
                    title: "ROCK, ALT-METAL, NU-METAL",
                    description:
                      "Raised in the shadow of industrial darkness. Scarlet's rock foundation was built on the shock, theatricality, and mechanical aggression that defined an era—the unsettling beauty of distorted riffs wrapped in provocative, unapologetic artistry. That influence bleeds into everything: the brooding weight of alt-metal, the arena-sized hooks of post-grunge, the emotional gut-punches that made 2000s rock radio unforgettable. Cello-driven metal epics. Synth-laced post-hardcore. Progressive complexity meets raw, explosive catharsis. From dark, industrial chaos to anthemic, emotionally-charged soundscapes—Scarlet produces rock that lingers long after the last note fades. Powerful riffs. Crushing depth. Music that hits hard and haunts harder",
                    genres: [
                      "Alt-Metal",
                      "Post-Grunge",
                      "Hard Rock",
                      "Pop-Rock",
                      "Industrial Metal",
                      "Progressive Rock",
                      "Alt-Rock",
                      "Synth-Rock",
                      "Shock Rock",
                      "Cello Metal",
                    ],
                  },
                  {
                    title: "CINEMATIC, GENRE-BENDING, EXPERIMENTAL",
                    description:
                      "Limitless by design. Scarlet weaves orchestral grandeur, sweeping strings, and heart-pounding cinematic tension into the DNA of every production—regardless of genre. But impact isn't only found in intensity. The same precision that builds chest-rattling climaxes also crafts the quiet devastation of somber, tearjerking compositions. Deep, thought-provoking soundscapes that sit with you at 3AM. Melodies that ache. Scores that haunt. This is where experimentation thrives and convention dissolves—fusing the unexpected, defying categorization, and proving that emotional weight hits just as hard as any drop. Whether it's triumphant orchestral swells, avant-garde sonic exploration, or intimate moments of vulnerability, Scarlet delivers with the same uncompromising vision: Maximum Impact—felt in the mosh pit and in the soul.",
                    genres: [
                      "Cinematic / Orchestral",
                      "Progressive Metal",
                      "Metal-Step",
                      "Darkwave",
                      "Synthpop",
                      "Ambient R&B",
                      "Dark R&B",
                      "Emo Rap",
                      "Trap Metal",
                      "Jazz Fusion",
                      "Classical Crossover",
                    ],
                  },
                ].map((category, index) => (
                  <GenreDropdown
                    key={index}
                    title={category.title}
                    description={category.description}
                    genres={category.genres}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-32 px-6 lg:px-12">
        <div className="max-w-2xl mx-auto text-center space-y-12">
          <h2 className="text-5xl md:text-6xl font-bold uppercase tracking-[0.2em]">Connect</h2>

          <div className="flex items-center justify-center gap-8">
            <a
              href="https://www.instagram.com/scarlet.made.it/"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              aria-label="Instagram"
            >
              <Instagram size={32} className="text-white group-hover:scale-110 transition-transform duration-300" />
            </a>
            <a
              href="https://www.tiktok.com/@scarlet.made.it"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              aria-label="TikTok"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </a>
          </div>

          <div className="pt-12 space-y-8">
            <h3 className="text-3xl md:text-4xl font-bold uppercase tracking-[0.2em]">Listen</h3>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <a href="https://music.apple.com/us/artist/scarlet-music/1865668894" target="_blank" rel="noopener noreferrer" className="group" aria-label="Apple Music">
                <Image
                  src="/images/apple-music-icon.png"
                  alt="Apple Music"
                  width={40}
                  height={40}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </a>
              <a href="https://open.spotify.com/artist/4G5MlnCz82h2XWi6ZvY91c?si=9NzOP2gPQAWspkPCeNswqw" target="_blank" rel="noopener noreferrer" className="group" aria-label="Spotify">
                <Image
                  src="/images/spotify-icon.png"
                  alt="Spotify"
                  width={40}
                  height={40}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </a>
              <a href="https://music.youtube.com/channel/UCf1wp-PLA4ldSyTZgrEtSjQ" target="_blank" rel="noopener noreferrer" className="group" aria-label="YouTube Music">
                <Image
                  src="/images/youtube-icon.png"
                  alt="YouTube Music"
                  width={40}
                  height={40}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </a>
              <a href="https://music.amazon.com/artists/B0GF9RR3XL/scarlet-made-it" target="_blank" rel="noopener noreferrer" className="group" aria-label="Amazon Music">
                <Image
                  src="/images/amazon-music-logo.png"
                  alt="Amazon Music"
                  width={40}
                  height={40}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </a>
              <a href="https://www.pandora.com/artist/scarlet-made-it/AR3pxZX93vr39x9" target="_blank" rel="noopener noreferrer" className="group" aria-label="Pandora">
                <Image
                  src="/images/pandora-20icon.png"
                  alt="Pandora"
                  width={40}
                  height={40}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </a>
            </div>
          </div>

          <div className="pt-8">
            <a
              href="mailto:Scarletproductions@proton.me"
              className="px-6 py-3 border border-white/30 text-lg tracking-[0.2em] uppercase hover:bg-white/10 hover:border-white transition-all duration-300"
            >
              Contact
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 lg:px-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
          <Image
            src="/images/scarlet-20syndicate-20logo-20-28white-tagline-29.png"
            alt="Scarlet Syndicate"
            width={200}
            height={60}
            className="opacity-60"
          />
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500 uppercase tracking-wider">
              Copyright © 2025-2026 Scarlet/Scarlet Syndicate Productions.
            </p>
            <p className="text-xs text-gray-600 uppercase tracking-wider">All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Sticky Listen Now Dock */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="bg-black border border-white/20 rounded-lg px-6 py-4 backdrop-blur-sm shadow-2xl">
          <div className="flex flex-col items-center gap-4">
            <span className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">Listen Now</span>
            <div className="flex items-center gap-3">
              <a href="https://music.apple.com/us/artist/scarlet-music/1865668894" target="_blank" rel="noopener noreferrer" className="group" aria-label="Apple Music">
                <Image
                  src="/images/apple-music-icon.png"
                  alt="Apple Music"
                  width={32}
                  height={32}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </a>
              <a href="https://open.spotify.com/artist/4G5MlnCz82h2XWi6ZvY91c?si=9NzOP2gPQAWspkPCeNswqw" target="_blank" rel="noopener noreferrer" className="group" aria-label="Spotify">
                <Image
                  src="/images/spotify-icon.png"
                  alt="Spotify"
                  width={32}
                  height={32}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </a>
              <a href="https://music.youtube.com/channel/UCf1wp-PLA4ldSyTZgrEtSjQ" target="_blank" rel="noopener noreferrer" className="group" aria-label="YouTube Music">
                <Image
                  src="/images/youtube-icon.png"
                  alt="YouTube Music"
                  width={32}
                  height={32}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </a>
              <a href="https://music.amazon.com/artists/B0GF9RR3XL/scarlet-made-it" target="_blank" rel="noopener noreferrer" className="group" aria-label="Amazon Music">
                <Image
                  src="/images/amazon-music-logo.png"
                  alt="Amazon Music"
                  width={32}
                  height={32}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </a>
              <a href="https://www.pandora.com/artist/scarlet-made-it/AR3pxZX93vr39x9" target="_blank" rel="noopener noreferrer" className="group" aria-label="Pandora">
                <Image
                  src="/images/pandora-20icon.png"
                  alt="Pandora"
                  width={32}
                  height={32}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={tracks[currentTrack !== null ? currentTrack : 0].file}
        onEnded={nextTrack}
        onPlay={() => {
          console.log("[v0] Audio started playing")
          setIsPlaying(true)
        }}
        onPause={() => {
          console.log("[v0] Audio paused")
          setIsPlaying(false)
        }}
        onError={(e) => {
          console.error("[v0] Audio error:", e)
        }}
      />
    </main>
  )
}
