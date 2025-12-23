import { useState, useCallback, useRef } from 'react'
// @ts-ignore
import { fabric } from 'fabric'

export function useWhiteboard() {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const canvasRef = useRef<fabric.Canvas | null>(null)

  const initCanvas = useCallback((fabricCanvas: fabric.Canvas) => {
    canvasRef.current = fabricCanvas
    setCanvas(fabricCanvas)
    // 将canvas挂载到window上，方便Toolbar访问
    ;(window as any).fabricCanvas = fabricCanvas
  }, [])

  const handleCanvasEvent = useCallback((data: any) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current

    try {
      switch (data.type) {
        case 'path:created':
          fabric.util.enlivenObjects([data.data], (objects: fabric.Object[]) => {
            objects.forEach((obj) => {
              canvas.add(obj)
            })
            canvas.renderAll()
          })
          break

        case 'object:added':
          fabric.util.enlivenObjects([data.data], (objects: fabric.Object[]) => {
            objects.forEach((obj) => {
              canvas.add(obj)
            })
            canvas.renderAll()
          })
          break

        case 'object:modified':
          const existingObj = canvas.getObjects().find(
            (obj: any) => obj.id === data.data.id
          )
          if (existingObj) {
            existingObj.set(data.data)
            canvas.renderAll()
          } else {
            fabric.util.enlivenObjects([data.data], (objects: fabric.Object[]) => {
              objects.forEach((obj) => {
                canvas.add(obj)
              })
              canvas.renderAll()
            })
          }
          break

        case 'object:removed':
          const objToRemove = canvas.getObjects().find(
            (obj: any) => obj.id === data.data.id
          )
          if (objToRemove) {
            canvas.remove(objToRemove)
            canvas.renderAll()
          }
          break

        default:
          break
      }
    } catch (error) {
      console.error('Error handling canvas event:', error)
    }
  }, [])

  const exportImage = useCallback(() => {
    if (!canvasRef.current) return

    const dataURL = canvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    })

    const link = document.createElement('a')
    link.download = `whiteboard-${Date.now()}.png`
    link.href = dataURL
    link.click()
  }, [])

  const exportPDF = useCallback(async () => {
    if (!canvasRef.current) return

    try {
      // 动态导入jsPDF
      const { default: jsPDF } = await import('jspdf')
      const canvas = canvasRef.current

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width || 800, canvas.height || 600],
      })

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width || 800, canvas.height || 600)
      pdf.save(`whiteboard-${Date.now()}.pdf`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('PDF导出功能需要额外库支持，请先安装 jspdf')
    }
  }, [])

  return {
    canvas,
    initCanvas,
    handleCanvasEvent,
    exportImage,
    exportPDF,
  }
}

