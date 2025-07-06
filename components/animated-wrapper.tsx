"use client"
import { usePathname } from "next/navigation"
import { useTransition, animated, config } from "@react-spring/web"
import { useEffect, useState } from "react"

export function AnimatedWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isFirstRender, setIsFirstRender] = useState(true)

  useEffect(() => {
    // After first render, set isFirstRender to false
    setIsFirstRender(false)
  }, [])

  const transitions = useTransition(pathname, {
    from: isFirstRender ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0, y: -10 },
    config: { duration: 300, easing: t => t }, // Similar to "easeIn"
    exitBeforeEnter: true, // Similar to AnimatePresence mode="sync"
  })

  return (
    <>
      {transitions((style, item) => (
        item === pathname && (
          <animated.main
            style={style}
            className="flex-1"
          >
            {children}
          </animated.main>
        )
      ))}
    </>
  )
}
