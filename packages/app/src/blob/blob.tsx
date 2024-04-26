import { curry } from 'lodash'
import {
  CanvasHTMLAttributes,
  DetailedHTMLProps,
  useEffect,
  useRef,
} from 'react'
import invariant from 'tiny-invariant'
import { Config, RenderFn, RenderMethod } from './config.js'
import { renderBezier } from './render-bezier.js'
import { renderSimple } from './render-simple.js'

const render: RenderFn = (
  canvas,
  context,
  config,
  timestamp,
) => {
  const { renderMethod = RenderMethod.Simple } = config
  const renderFn = {
    [RenderMethod.Simple]: renderSimple,
    [RenderMethod.Bezier]: renderBezier,
  }[renderMethod]
  renderFn(canvas, context, config, timestamp)
  window.requestAnimationFrame(
    curry(render)(canvas, context, config),
  )
}

function resize(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
}

function init(
  canvas: HTMLCanvasElement,
  config: Config,
): { cleanup(): void } {
  resize(canvas)
  const ro = new ResizeObserver(() => {
    resize(canvas)
  })
  ro.observe(canvas)
  const context = canvas.getContext('2d')!
  window.requestAnimationFrame(
    curry(render)(canvas, context, config),
  )

  return {
    cleanup: () => {
      ro.disconnect()
    },
  }
}

export type BlobProps = {
  config: Config
} & Omit<
  DetailedHTMLProps<
    CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  >,
  'children'
>

export function Blob({ config, ...rest }: BlobProps) {
  const canvas = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    if (canvas) {
      invariant(canvas.current)
      return init(canvas.current, config).cleanup
    }
  }, [config])
  return <canvas ref={canvas} {...rest} />
}
