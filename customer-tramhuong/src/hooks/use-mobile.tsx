import * as React from "react"

// Enhanced breakpoint system for better responsive design  
const MOBILE_BREAKPOINT = 768   // md: phones and small tablets
const TABLET_BREAKPOINT = 1024  // lg: tablets  
const LAPTOP_BREAKPOINT = 1280  // xl: laptops
const DESKTOP_BREAKPOINT = 1536 // 2xl: desktops

type DeviceType = 'mobile' | 'tablet' | 'laptop' | 'desktop'
type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | 'xs'

interface ResponsiveHookReturn {
  isMobile: boolean
  isTablet: boolean
  isLaptop: boolean
  isDesktop: boolean
  deviceType: DeviceType
  breakpoint: Breakpoint
  isTouch: boolean
  screenSize: { width: number; height: number }
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useResponsive(): ResponsiveHookReturn {
  const [mounted, setMounted] = React.useState(false)
  
  // Default state for SSR consistency - assume mobile for better mobile UX
  const defaultState: ResponsiveHookReturn = {
    isMobile: true,
    isTablet: false,
    isLaptop: false,
    isDesktop: false,
    deviceType: 'mobile',
    breakpoint: 'xs',
    isTouch: true,
    screenSize: { width: 375, height: 667 }
  }
  
  const [state, setState] = React.useState<ResponsiveHookReturn>(defaultState)

  React.useEffect(() => {
    setMounted(true)
    
    const updateState = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      let deviceType: DeviceType
      let breakpoint: Breakpoint
      
      if (width < MOBILE_BREAKPOINT) {
        deviceType = 'mobile'
        breakpoint = 'xs'
      } else if (width < TABLET_BREAKPOINT) {
        deviceType = 'tablet'
        breakpoint = 'sm'
      } else if (width < LAPTOP_BREAKPOINT) {
        deviceType = 'laptop'
        breakpoint = 'md'
      } else if (width < DESKTOP_BREAKPOINT) {
        deviceType = 'desktop'
        breakpoint = 'lg'
      } else {
        deviceType = 'desktop'
        breakpoint = 'xl'
      }
      
      setState({
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < LAPTOP_BREAKPOINT,
        isLaptop: width >= LAPTOP_BREAKPOINT && width < DESKTOP_BREAKPOINT,
        isDesktop: width >= DESKTOP_BREAKPOINT,
        deviceType,
        breakpoint,
        isTouch,
        screenSize: { width, height }
      })
    }

    const mediaQueries = [
      window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`),
      window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`),
      window.matchMedia(`(min-width: ${TABLET_BREAKPOINT}px) and (max-width: ${LAPTOP_BREAKPOINT - 1}px)`),
      window.matchMedia(`(min-width: ${LAPTOP_BREAKPOINT}px) and (max-width: ${DESKTOP_BREAKPOINT - 1}px)`),
      window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`)
    ]

    mediaQueries.forEach(mq => mq.addEventListener('change', updateState))
    window.addEventListener('resize', updateState)
    
    // Initial state update
    updateState()
    
    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', updateState))
      window.removeEventListener('resize', updateState)
    }
  }, [])

  // Return default state during SSR and initial render to prevent hydration mismatch
  if (!mounted) {
    return defaultState
  }
  
  return state
}

// Utility hook for touch-friendly design
export function useTouchFriendly() {
  const { isTouch, isMobile } = useResponsive()
  
  return {
    isTouch,
    // Minimum touch target size (44px per Apple/Google guidelines)
    minTouchTarget: isTouch ? 'min-h-[44px] min-w-[44px]' : '',
    // Enhanced padding for touch devices
    touchPadding: isTouch ? 'p-4' : 'p-2',
    // Larger gaps for touch interfaces
    touchGap: isTouch ? 'gap-4' : 'gap-2',
    // Touch-friendly button sizing
    touchButtonSize: isMobile && isTouch ? 'h-12 px-6' : 'h-10 px-4'
  }
}
