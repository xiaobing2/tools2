import { useState } from 'react'
import * as fabric from 'fabric'
import './Toolbar.css'

interface ToolbarProps {
  onExportImage: () => void
  onExportPDF: () => void
}

export default function Toolbar({ onExportImage, onExportPDF }: ToolbarProps) {
  const [tool, setTool] = useState<'pen' | 'shape' | 'text' | 'image'>('pen')
  const [brushWidth, setBrushWidth] = useState(3)
  const [brushColor, setBrushColor] = useState('#000000')

  const handleToolChange = (newTool: 'pen' | 'shape' | 'text' | 'image') => {
    setTool(newTool)
    const canvas = (window as any).fabricCanvas as fabric.Canvas | null
    if (!canvas) return

    switch (newTool) {
      case 'pen':
        canvas.isDrawingMode = true
        canvas.freeDrawingBrush.width = brushWidth
        canvas.freeDrawingBrush.color = brushColor
        break
      case 'shape':
        canvas.isDrawingMode = false
        break
      case 'text':
        canvas.isDrawingMode = false
        break
      case 'image':
        canvas.isDrawingMode = false
        break
    }
  }

  const handleBrushWidthChange = (width: number) => {
    setBrushWidth(width)
    const canvas = (window as any).fabricCanvas as fabric.Canvas | null
    if (canvas && canvas.isDrawingMode) {
      canvas.freeDrawingBrush.width = width
    }
  }

  const handleColorChange = (color: string) => {
    setBrushColor(color)
    const canvas = (window as any).fabricCanvas as fabric.Canvas | null
    if (canvas && canvas.isDrawingMode) {
      canvas.freeDrawingBrush.color = color
    }
  }

  const handleAddRectangle = () => {
    const canvas = (window as any).fabricCanvas as fabric.Canvas | null
    if (!canvas) return

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: 'transparent',
      stroke: brushColor,
      strokeWidth: brushWidth,
    })
    canvas.add(rect)
    canvas.setActiveObject(rect)
  }

  const handleAddCircle = () => {
    const canvas = (window as any).fabricCanvas as fabric.Canvas | null
    if (!canvas) return

    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: 'transparent',
      stroke: brushColor,
      strokeWidth: brushWidth,
    })
    canvas.add(circle)
    canvas.setActiveObject(circle)
  }

  const handleAddText = () => {
    const canvas = (window as any).fabricCanvas as fabric.Canvas | null
    if (!canvas) return

    const text = new fabric.Text('双击编辑文字', {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: brushColor,
    })
    canvas.add(text)
    canvas.setActiveObject(text)
  }

  const handleClear = () => {
    const canvas = (window as any).fabricCanvas as fabric.Canvas | null
    if (!canvas) return
    if (confirm('确定要清空白板吗？')) {
      canvas.clear()
      canvas.backgroundColor = '#ffffff'
      canvas.renderAll()
    }
  }

  const handleUndo = () => {
    const canvas = (window as any).fabricCanvas as fabric.Canvas | null
    if (!canvas) return
    const objects = canvas.getObjects()
    if (objects.length > 0) {
      canvas.remove(objects[objects.length - 1])
      canvas.renderAll()
    }
  }

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>绘图工具</h3>
        <div className="tool-buttons">
          <button
            className={tool === 'pen' ? 'active' : ''}
            onClick={() => handleToolChange('pen')}
            title="画笔"
          >
            ✏️ 画笔
          </button>
          <button
            className={tool === 'shape' ? 'active' : ''}
            onClick={() => handleToolChange('shape')}
            title="形状"
          >
            ⬜ 形状
          </button>
          <button
            className={tool === 'text' ? 'active' : ''}
            onClick={() => handleToolChange('text')}
            title="文字"
          >
            📝 文字
          </button>
        </div>
      </div>

      {tool === 'shape' && (
        <div className="toolbar-section">
          <h3>添加形状</h3>
          <div className="tool-buttons">
            <button onClick={handleAddRectangle} title="矩形">
              ▭ 矩形
            </button>
            <button onClick={handleAddCircle} title="圆形">
              ⭕ 圆形
            </button>
          </div>
        </div>
      )}

      {tool === 'text' && (
        <div className="toolbar-section">
          <h3>添加文字</h3>
          <button onClick={handleAddText} className="add-text-btn">
            ➕ 添加文字
          </button>
        </div>
      )}

      <div className="toolbar-section">
        <h3>画笔设置</h3>
        <div className="brush-controls">
          <label>
            粗细: {brushWidth}px
            <input
              type="range"
              min="1"
              max="20"
              value={brushWidth}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBrushWidthChange(Number(e.target.value))}
            />
          </label>
          <label>
            颜色
            <input
              type="color"
              value={brushColor}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="toolbar-section">
        <h3>操作</h3>
        <div className="tool-buttons">
          <button onClick={handleUndo} title="撤销">
            ↶ 撤销
          </button>
          <button onClick={handleClear} title="清空" className="danger">
            🗑️ 清空
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <h3>导出</h3>
        <div className="tool-buttons">
          <button onClick={onExportImage} title="导出图片">
            📷 导出PNG
          </button>
          <button onClick={onExportPDF} title="导出PDF">
            📄 导出PDF
          </button>
        </div>
      </div>
    </div>
  )
}

