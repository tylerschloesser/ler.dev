import * as t from 'io-ts'

export const Cell = t.type({
  x: t.number,
  y: t.number,
  color: t.string,
})

export const DrawPayload = t.type({
  cells: t.array(Cell),
})

export const DrawMessage = t.type({
  action: t.literal('draw'),
  payload: DrawPayload,
})

export const Message = t.exact(DrawMessage)
