import React, { useEffect, useRef } from 'react'

function CinematicBg() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: null, y: null, radius: 75 })
  const activeElementRef = useRef(null) // Stores the actual hovered DOM element node
  const particlesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId
    let width, height
    
    const colors = [
      '0, 240, 255',   // Cyan
      '138, 43, 226',  // Purple
      '0, 255, 127'    // Emerald
    ]

    const init = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      particlesRef.current = []
      
      const particleCount = Math.floor((width * height) / 5000)
      for (let i = 0; i < particleCount; i++) {
        const colorBase = colors[Math.floor(Math.random() * colors.length)]
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          radius: Math.random() * 2 + 1,
          baseRadius: Math.random() * 2 + 1,
          colorBase: colorBase,
          baseColor: `rgba(${colorBase}, ${Math.random() * 0.5 + 0.3})`,
          color: `rgba(${colorBase}, ${Math.random() * 0.5 + 0.3})`,
          depth: Math.random(),
          targetX: null,
          targetY: null,
          isBracketNode: false,
          attractionProgress: 0,
          isShatterNode: false,
          lifespan: 1.0
        })
      }
    }

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    const handleMouseLeave = () => {
      mouseRef.current.x = null
      mouseRef.current.y = null
    }

    const handleCardHover = (e) => {
      const detail = e.detail
      if (detail && detail.active && detail.element) {
        activeElementRef.current = detail.element
      } else {
        activeElementRef.current = null
        releaseBracketTargets()
      }
    }

    // Explode cards into glowing particles when tab changes
    const handleCardsShatter = (e) => {
      const rects = e.detail.rects || []
      const scrollY = window.scrollY

      rects.forEach(rect => {
        // Spawn 45 glowing explosion particles inside the boundaries of each disappearing card
        for (let k = 0; k < 45; k++) {
          const colorBase = colors[Math.floor(Math.random() * colors.length)]
          const angle = Math.random() * Math.PI * 2
          const speed = Math.random() * 7 + 4 // Explosive velocity (4px - 11px/frame)
          
          particlesRef.current.push({
            x: rect.left + Math.random() * rect.width,
            y: rect.top + Math.random() * rect.height + scrollY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 3 + 1.5,
            baseRadius: Math.random() * 1.5 + 1,
            colorBase: colorBase,
            baseColor: `rgba(${colorBase}, 0.95)`,
            color: `rgba(${colorBase}, 0.95)`,
            depth: Math.random(),
            targetX: null,
            targetY: null,
            isBracketNode: false,
            attractionProgress: 0,
            isShatterNode: true,
            lifespan: 1.0 // Fades out to 0
          })
        }
      })
    }

    // Helper: Generate points forming a mathematically perfect curly bracket { or }
    const getBracketPoints = (side, centerX, centerY, height) => {
      const points = []
      const count = 45 // 45 points per bracket for smooth outlines
      
      const hookWidth = 20
      const cuspWidth = 20
      
      for (let i = 0; i < count; i++) {
        const t = (i / (count - 1)) * 2 - 1 // Normalized from -1 to 1
        const py = centerY + t * (height / 2)
        
        let xOffset = 0
        const absT = Math.abs(t)
        
        if (absT > 0.82) {
          // Top/Bottom Hooks: curve from xOffset=0 (at 0.82) to xOffset=hookWidth (at 1.0)
          const hookT = (absT - 0.82) / 0.18
          xOffset = Math.sin(hookT * Math.PI / 2) * hookWidth
        } else if (absT < 0.22) {
          // Middle Cusp: curve from xOffset=0 (at 0.22) to xOffset=-cuspWidth (at 0.0)
          const cuspT = (0.22 - absT) / 0.22
          xOffset = -Math.sin(cuspT * Math.PI / 2) * cuspWidth
        } else {
          xOffset = 0
        }

        let px = centerX
        if (side === -1) {
          px = centerX + xOffset
        } else {
          px = centerX - xOffset
        }

        points.push({ x: px, y: py })
      }
      return points
    }

    const assignBracketTargets = (rect) => {
      particlesRef.current.forEach(p => {
        p.isBracketNode = false
      })

      const cTop = rect.top
      const cLeft = rect.left
      const cHeight = rect.height
      const cWidth = rect.width

      const leftBracketX = cLeft - 22
      const leftBracketY = cTop + cHeight / 2
      const rightBracketX = cLeft + cWidth + 22
      const rightBracketY = cTop + cHeight / 2

      const leftPoints = getBracketPoints(-1, leftBracketX, leftBracketY, cHeight * 1.02)
      const rightPoints = getBracketPoints(1, rightBracketX, rightBracketY, cHeight * 1.02)
      const allTargets = [...leftPoints, ...rightPoints]

      allTargets.forEach(target => {
        let closestPart = null
        let minDist = Infinity

        particlesRef.current.forEach(p => {
          if (p.isBracketNode || p.isShatterNode) return // Skip assigned or exploding nodes
          
          const px = p.targetX !== null ? p.targetX : p.x
          const py = p.targetY !== null ? p.targetY : p.y
          
          const dx = px - target.x
          const dy = py - target.y
          const d = dx * dx + dy * dy
          if (d < minDist) {
            minDist = d
            closestPart = p
          }
        })

        if (closestPart) {
          closestPart.targetX = target.x
          closestPart.targetY = target.y
          closestPart.isBracketNode = true
        }
      })
    }

    const releaseBracketTargets = () => {
      particlesRef.current.forEach(p => {
        if (p.isBracketNode) {
          const angle = Math.random() * Math.PI * 2
          const speed = Math.random() * 5 + 4
          p.vx = Math.cos(angle) * speed
          p.vy = Math.sin(angle) * speed
        }
        p.targetX = null
        p.targetY = null
        p.isBracketNode = false
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width)
      gradient.addColorStop(0, '#0a0a1a')
      gradient.addColorStop(1, '#020205')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      const scrollY = window.scrollY
      const mouse = mouseRef.current
      const activeElement = activeElementRef.current
      const isProjectCard = activeElement && activeElement.getAttribute('data-type') === 'project'

      if (activeElement) {
        const rect = activeElement.getBoundingClientRect()
        if (isProjectCard) {
          releaseBracketTargets()
        } else {
          assignBracketTargets(rect)
        }
      }

      // Filter out dead shatter nodes
      particlesRef.current = particlesRef.current.filter(p => !p.isShatterNode || p.lifespan > 0)

      particlesRef.current.forEach(p => {
        if (p.isShatterNode) {
          // Explode node outwards, decelerating over time
          p.x += p.vx
          p.y += p.vy
          p.vx *= 0.94
          p.vy *= 0.94
          p.lifespan -= 0.02
          p.color = `rgba(${p.colorBase}, ${Math.max(0, p.lifespan)})`
        } else if (p.isBracketNode && p.targetX !== null) {
          p.x += (p.targetX - p.x) * 0.035
          p.y += (p.targetY - p.y) * 0.035
          
          p.attractionProgress = Math.min(1, p.attractionProgress + 0.04)
          p.color = 'rgba(0, 240, 255, 0.95)'
          p.radius = p.baseRadius * 1.5
        } else {
          p.x += p.vx
          p.y += p.vy
          p.radius = p.baseRadius
          p.color = p.baseColor
          p.targetX = null
          p.targetY = null
          
          p.attractionProgress = Math.max(0, p.attractionProgress - 0.04)

          const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
          if (currentSpeed > 0.7) {
            p.vx *= 0.92
            p.vy *= 0.92
          } else {
            const scale = 0.7 / (currentSpeed || 1)
            if (currentSpeed > 0.7) {
              p.vx *= scale
              p.vy *= scale
            }
          }

          if (p.x < 0) p.x = width
          if (p.x > width) p.x = 0
          if (p.y < 0) p.y = height
          if (p.y > height) p.y = 0

          const parallaxY = p.y - (scrollY * p.depth * 0.5)
          let finalY = parallaxY % height
          if (finalY < 0) finalY += height
          p.finalY = finalY

          // Distance based glow for Verified Showcase project card hover
          if (isProjectCard) {
            const rect = activeElement.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            
            const dx = p.x - centerX
            const dy = p.finalY - centerY
            const distance = Math.sqrt(dx * dx + dy * dy)
            const glowRadius = 450

            if (distance < glowRadius) {
              const factor = 1 - (distance / glowRadius) // 1 at center, 0 at boundary
              p.radius = p.baseRadius * (1 + factor * 2) // Grow up to 3x base size
              p.color = `rgba(0, 240, 255, ${0.3 + factor * 0.65})` // Interpolate opacity to bright cyan
              p.isProjectGlowNode = true
            } else {
              p.isProjectGlowNode = false
            }
          } else {
            p.isProjectGlowNode = false
          }

          if (mouse.x !== null && mouse.y !== null) {
            const dx = p.x - mouse.x
            const dy = p.finalY - mouse.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < mouse.radius) {
              const force = (mouse.radius - distance) / mouse.radius
              const forceX = (dx / distance) * force * 10
              const forceY = (dy / distance) * force * 10
              
              p.x += forceX
              p.y += forceY
            }
          }
        }
      })

      ctx.lineWidth = 0.6
      
      // Draw grid connections
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p1 = particlesRef.current[i]
        if (p1.isShatterNode || p1.isBracketNode) continue // Shatter and bracket particles don't connect

        const py1 = p1.finalY !== undefined ? p1.finalY : p1.y

        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p2 = particlesRef.current[j]
          if (p2.isShatterNode || p2.isBracketNode) continue

          const py2 = p2.finalY !== undefined ? p2.finalY : p2.y
          const dx = p1.x - p2.x
          const dy = py1 - py2
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 130) {
            const progress = Math.max(p1.attractionProgress, p2.attractionProgress)
            const opacity = (1 - (distance / 130)) * (1 - progress * 0.85)
            
            if (opacity > 0.02) {
              const grad = ctx.createLinearGradient(p1.x, py1, p2.x, py2)
              grad.addColorStop(0, `rgba(${p1.colorBase}, ${opacity * 0.5})`)
              grad.addColorStop(1, `rgba(${p2.colorBase}, ${opacity * 0.5})`)
              
              ctx.beginPath()
              ctx.strokeStyle = grad
              ctx.moveTo(p1.x, py1)
              ctx.lineTo(p2.x, py2)
              ctx.stroke()
            }
          }
        }

        if (mouse.x !== null && mouse.y !== null && !p1.isBracketNode) {
          const dx = p1.x - mouse.x
          const dy = py1 - mouse.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < mouse.radius) {
            const opacity = (1 - (distance / mouse.radius)) * 0.4
            ctx.beginPath()
            ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`
            ctx.moveTo(mouse.x, mouse.y)
            ctx.lineTo(p1.x, py1)
            ctx.stroke()
          }
        }
      }

      // Draw all nodes
      particlesRef.current.forEach(p => {
        const drawY = p.isBracketNode || p.isShatterNode ? p.y : p.finalY
        
        if (p.isProjectGlowNode) {
          ctx.shadowBlur = 8
          ctx.shadowColor = 'rgba(0, 240, 255, 0.8)'
        }
        
        ctx.beginPath()
        ctx.arc(p.x, drawY, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
        ctx.shadowBlur = 0 // Reset immediately
        
        if (p.isBracketNode) {
          ctx.shadowBlur = 10
          ctx.shadowColor = 'rgba(0, 240, 255, 0.8)'
          ctx.beginPath() // Clear path
          ctx.arc(p.x, drawY, p.radius * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
          ctx.shadowBlur = 0
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    window.addEventListener('resize', init)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('card-hover', handleCardHover)
    window.addEventListener('cards-shatter', handleCardsShatter)
    
    init()
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', init)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('card-hover', handleCardHover)
      window.removeEventListener('cards-shatter', handleCardsShatter)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      id="cinematic-bg" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  )
}

export default CinematicBg
