import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Do something on page load. EMPTY ARRAY at the end.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    const onLoad = () => {
      // Initialize mobile state
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      // Add event listener
      mql.addEventListener("change", onChange)
    }

    onLoad()

    return () => {
      // Do something on page unmount.
      const onUnmount = () => {
        mql.removeEventListener("change", onChange)
      }
      onUnmount()
    }
  }, [])

  return !!isMobile
}
