export type Tool = 'circle' | 'ellipse' | 'dot'
export type Mode = 'edit' | 'display'

export interface Point {
  x: number
  y: number
}

export interface CircleShape {
  id: string
  type: 'circle'
  cx: number
  cy: number
  r: number
  color: string
}

export interface EllipseShape {
  id: string
  type: 'ellipse'
  cx: number
  cy: number
  rx: number
  ry: number
  color: string
}

export interface DotShape {
  id: string
  type: 'dot'
  x: number
  y: number
  color: string
}

export type Shape = CircleShape | EllipseShape | DotShape
