import { useEffect, useRef } from 'react'
import { fabric } from 'fabric'
import './Whiteboard.css'

interface WhiteboardProps {
  canvas: fabric.Canvas | null
  onInit: (canvas: fabric.Canvas) => void
  onCanvasEvent: (event: any) => void
}

export default function Whiteboard({ canvas, onInit, onCanvasEvent }: WhiteboardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || canvas) return

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: '#ffffff',
      isDrawingMode: true,
      freeDrawingBrush: {
        width: 3,
        color: '#000000',
      },
    })

    // 监听画布事件
    fabricCanvas.on('path:created', (e: fabric.IEvent) => {
      const path = (e as any).path
      onCanvasEvent({
        type: 'path:created',
        data: path.toJSON(),
      })
    })

    fabricCanvas.on('object:added', (e: fabric.IEvent) => {
      const target = (e as any).target
      if (target && !target.path) {
        // 排除自由绘制路径
        onCanvasEvent({
          type: 'object:added',
          data: target.toJSON(),
        })
      }
    })

    fabricCanvas.on('object:modified', (e: fabric.IEvent) => {
      const target = (e as any).target
      if (target) {
        onCanvasEvent({
          type: 'object:modified',
          data: target.toJSON(),
        })
      }
    })

    fabricCanvas.on('object:removed', (e: fabric.IEvent) => {
      const target = (e as any).target
      if (target) {
        onCanvasEvent({
          type: 'object:removed',
          data: target.toJSON(),
        })
      }
    })

    // 处理窗口大小变化
    const handleResize = () => {
      if (containerRef.current) {
        fabricCanvas.setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    window.addEventListener('resize', handleResize)
    onInit(fabricCanvas)

    return () => {
      window.removeEventListener('resize', handleResize)
      fabricCanvas.dispose()
    }
  }, [])

  return (
    <div ref={containerRef} className="whiteboard">
      <canvas ref={canvasRef} />
    </div>
  )
}

