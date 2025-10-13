import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-tramhuong-accent/30 bg-white/60 backdrop-blur-md px-3 py-2 text-sm ring-offset-white placeholder:text-tramhuong-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tramhuong-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-tramhuong-primary/10 disabled:text-tramhuong-primary/30 transition-all duration-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
