import React, { useEffect, useState } from 'react'
import Image from 'next/image'

const images = ['/loading/1.webp', '/loading/2.webp', '/loading/3.webp']

const FRAME_DURATION = 600
const blurs = [8, 14, 20]
const texts = ["Let's", 'Rebuild', null]

export const IntroLoader = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [fadeIn, setFadeIn] = useState(false)

  // prevent page flash by rendering loader immediately
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro')

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (hasSeenIntro) {
          setFadeIn(true)
          setIsFadingOut(true)
          setTimeout(() => {
            setIsVisible(false)
          }, 200)
          return
        }

        setFadeIn(true)
      })
    })
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        if (prev < images.length - 1) return prev + 1

        clearInterval(interval)

        setTimeout(() => {
          setIsFadingOut(true)
          setTimeout(() => {
            setIsVisible(false)
            localStorage.setItem('hasSeenIntro', 'true')
          }, 300)
        }, FRAME_DURATION)

        return prev
      })
    }, FRAME_DURATION)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center bg-black
        transition-opacity duration-500
        ${fadeIn ? 'opacity-100' : 'opacity-0'}
        ${isFadingOut ? 'opacity-0' : ''}
      `}
    >
      {/* bg images */}
      {images.map((src, index) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center transition-all duration-500 ease-linear"
          style={{
            backgroundImage: `url(${src})`,
            opacity: currentImageIndex === index ? 1 : 0,
            filter: `blur(${blurs[index]}px)`,
            transform: currentImageIndex === index ? 'scale(1.06)' : 'scale(1)',
          }}
        />
      ))}

      {/* foreground */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* logo */}
        <Image
          src="/logo.png"
          alt="Logo"
          width={220}
          height={220}
          className="w-44 md:w-64 drop-shadow-lg mb-3 transition-opacity duration-500"
          priority
        />

        <div className="h-12 md:h-16 flex items-center justify-center">
          {currentImageIndex < 2 ? (
            <div
              className={`text-white text-lg md:text-2xl font-semibold transition-opacity duration-400 ${
                texts[currentImageIndex] ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}
            >
              {texts[currentImageIndex]}
            </div>
          ) : (
            <Image
              src="/loading/map.webp"
              alt="Sri Lanka Map"
              width={40}
              height={40}
              className="w-7 md:w-10 opacity-100 transition-all duration-400 drop-shadow-xl"
              priority
            />
          )}
        </div>
      </div>
    </div>
  )
}
