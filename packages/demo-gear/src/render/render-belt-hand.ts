import { AddBeltHand, IAppContext } from '../types.js'
import {
  ADD_BELT_INVALID,
  ADD_BELT_VALID,
} from './color.js'
import { renderBelt } from './render-belt.js'
import { GpuState } from './types.js'

export function renderBeltHand(
  context: IAppContext,
  gl: WebGL2RenderingContext,
  gpu: GpuState,
  hand: AddBeltHand,
) {
  const color = hand.valid
    ? ADD_BELT_VALID
    : ADD_BELT_INVALID
  for (const belt of hand.belts) {
    renderBelt(context, gl, gpu, belt, color)
  }
}
