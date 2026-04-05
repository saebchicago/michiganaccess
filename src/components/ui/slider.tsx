import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, "aria-label": ariaLabel, ...props }, ref) => {
  // Radix SliderPrimitive.Thumb renders a <span role="slider">. axe requires
  // an accessible name on that element. Forward aria-label (or a sensible
  // default) onto each Thumb so callers don't have to touch primitives.
  const thumbLabel = ariaLabel ?? "Slider";
  const valueCount = Array.isArray(props.value)
    ? props.value.length
    : Array.isArray(props.defaultValue)
      ? props.defaultValue.length
      : 1;
  return (
    <SliderPrimitive.Root
      ref={ref}
      aria-label={ariaLabel}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      {Array.from({ length: valueCount }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          aria-label={valueCount > 1 ? `${thumbLabel} (handle ${i + 1})` : thumbLabel}
          className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
