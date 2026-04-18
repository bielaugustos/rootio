import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-yellow-400 text-black border-2 border-black shadow-[3px_3px_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#000] active:translate-x-[1px] active:shadow-[2px_2px_0_#000]",
        destructive: "bg-red-500 text-white border-2 border-black shadow-[3px_3px_0_#000]",
        outline: "bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] hover:bg-gray-100",
        secondary: "bg-pink-300 text-black border-2 border-black shadow-[2px_2px_0_#000]",
        ghost: "hover:bg-gray-100",
        link: "text-black underline-offset-4 hover:underline",
        gold: "bg-amber-400 text-black border-2 border-black shadow-[3px_3px_0_#b08000]",
        neo: "bg-amber-100 text-black border-2 border-black shadow-[2px_2px_0_#000]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }