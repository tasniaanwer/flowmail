import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

const ChartContext = React.createContext<{ config: any } | undefined>(undefined)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: any
  }
>(({ id, className, children, config, ...props }, ref) => {
  const chartId = `chart-${id || React.useId()}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-tooltip]:text-xs [&_.recharts-cartesian-axis-tick]:text-xs",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
      label?: string
      labelFormatter?: (value: any, name: any, props: any) => React.ReactNode
      labelClassName?: string
      formatter?: (value: any, name: any, props: any) => React.ReactNode
      color?: string
    }
>(({ active, className, indicator = "dot", hideLabel = false, hideIndicator = false, label, labelFormatter, labelClassName, formatter, color, nameKey, labelKey, ...restProps }, ref) => {
  const props = restProps as any

  const { config } = useChart()

  if (!active || !(props as any)?.payload?.length) {
    return null
  }

  const payload = (props as any).payload

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      <div className="grid gap-1.5">
        {payload.map((item: any, index: number) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`
          const itemConfig = config?.[key] || {}
          const indicatorColor = color || item.payload?.fill || item.color

          return (
            <div
              key={index}
              className={cn(
                "flex w-full flex-wrap items-center gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                hideIndicator && "items-center"
              )}
            >
              {formatter && (
                <span className={cn("text-muted-foreground", labelClassName)}>
                  {formatter(item.value, item.name, item)}
                </span>
              )}
              {!formatter && (
                <span className={cn("text-muted-foreground", labelClassName)}>
                  {itemConfig?.label || item.name || key}
                </span>
              )}
              {formatter && (
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {formatter(item.value, item.name, item)}
                </span>
              )}
              {!formatter && (
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {item.value}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltip"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
}