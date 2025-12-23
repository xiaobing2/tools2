declare module 'fabric' {
  export interface IEvent {
    target?: any
    path?: any
  }

  export interface IObjectOptions {
    left?: number
    top?: number
    width?: number
    height?: number
    fill?: string
    stroke?: string
    strokeWidth?: number
    radius?: number
    fontSize?: number
  }

  export class FabricObject {
    left: number
    top: number
    width: number
    height: number
    fill: string
    stroke: string
    strokeWidth: number
    fontSize: number
    path?: any
    id?: string

    set(options: IObjectOptions): this
    toJSON(): any
  }

  export class Rect extends FabricObject {
    constructor(options?: IObjectOptions)
  }

  export class Circle extends FabricObject {
    constructor(options?: IObjectOptions)
  }

  export class Text extends FabricObject {
    constructor(text: string, options?: IObjectOptions)
  }

  export interface IBrush {
    width: number
    color: string
  }

  export interface ICanvasOptions {
    width?: number
    height?: number
    backgroundColor?: string
    isDrawingMode?: boolean
    freeDrawingBrush?: IBrush
  }

  export class Canvas {
    width: number
    height: number
    backgroundColor: string
    isDrawingMode: boolean
    freeDrawingBrush: IBrush

    constructor(element: HTMLCanvasElement | string, options?: ICanvasOptions)

    add(...objects: FabricObject[]): this
    remove(...objects: FabricObject[]): this
    clear(): this
    renderAll(): this
    setDimensions(dimensions: { width: number; height: number }): this
    setActiveObject(object: FabricObject | null): this
    getActiveObject(): FabricObject | null
    getObjects(): FabricObject[]
    toDataURL(options?: { format?: string; quality?: number; multiplier?: number }): string
    on(event: string, handler: (e: IEvent) => void): this
    off(event: string, handler?: (e: IEvent) => void): this
    dispose(): void
  }

  export namespace util {
    function enlivenObjects(
      objects: any[],
      callback: (objects: FabricObject[]) => void
    ): void
  }

  export const fabric: {
    Canvas: typeof Canvas
    Rect: typeof Rect
    Circle: typeof Circle
    Text: typeof Text
    util: typeof util
  }
}

