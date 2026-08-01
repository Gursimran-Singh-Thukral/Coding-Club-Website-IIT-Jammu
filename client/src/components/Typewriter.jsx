import React, { useState, useEffect, useRef } from 'react'

function Typewriter({ text, speed = 15, delay = 0, className = '', style = {} }) {
  // Use sessionStorage to remember typed texts so they only type once per browser session
  const storageKey = `typed_${text.replace(/[^a-zA-Z0-9]/g, '_')}`
  const alreadyTyped = typeof window !== 'undefined' && !!sessionStorage.getItem(storageKey)

  const [displayedText, setDisplayedText] = useState(alreadyTyped ? text : '')
  const [started, setStarted] = useState(alreadyTyped)
  const elementRef = useRef(null)

  useEffect(() => {
    if (alreadyTyped) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect() // Run once
        }
      })
    }, { threshold: 0.15 })

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [alreadyTyped])

  useEffect(() => {
    if (!started || alreadyTyped) return

    let timeoutId
    let currentIndex = 0

    const type = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1))
        currentIndex++
        timeoutId = setTimeout(type, speed)
      } else {
        // Typing finished: flag it in session storage
        sessionStorage.setItem(storageKey, 'true')
      }
    }

    timeoutId = setTimeout(type, delay)

    return () => clearTimeout(timeoutId)
  }, [started, text, speed, delay, alreadyTyped, storageKey])

  return (
    <span ref={elementRef} className={className} style={{ ...style, position: 'relative' }}>
      {displayedText}
      {started && displayedText.length < text.length && !alreadyTyped && (
        <span 
          style={{
            display: 'inline-block',
            width: '2px',
            backgroundColor: 'var(--jmx-cyan)',
            marginLeft: '2px',
            animation: 'blink 0.7s infinite'
          }}
        >
          &nbsp;
        </span>
      )}
    </span>
  )
}

export default Typewriter

