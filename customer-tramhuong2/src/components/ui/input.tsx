import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-tramhuong-accent/30 bg-white/60 backdrop-blur-md px-4 py-3 text-base transition-all duration-300",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-tramhuong-primary",
          "placeholder:text-tramhuong-primary/40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tramhuong-accent focus-visible:border-tramhuong-accent",
          "disabled:cursor-not-allowed disabled:bg-tramhuong-primary/10 disabled:text-tramhuong-primary/30",
          "md:text-sm md:h-10 md:py-2.5",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }