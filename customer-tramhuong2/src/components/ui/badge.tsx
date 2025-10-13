import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-tramhuong-accent text-white shadow-sm",
        secondary: 
          "border-transparent bg-tramhuong-bg text-tramhuong-primary",
        destructive:
          "border-transparent bg-red-600 text-white",
        outline: 
          "border-tramhuong-accent text-tramhuong-primary",
        new:
          "border-transparent bg-tramhuong-accent text-white shadow-sm",
        topseller:
          "border-transparent bg-amber-600 text-white shadow-sm",
        freeshipping:
          "border-transparent bg-tramhuong-primary text-tramhuong-bg shadow-sm",
        bestseller:
          "border-transparent bg-tramhuong-accent/80 text-white shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants }