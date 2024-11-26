import React from 'react'
import { useDragLayer } from 'react-dnd'

export function CustomDragLayer() {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }))

  if (!isDragging) {
    return null
  }

  return (
    <div className="custom-drag-layer">
      <div style={{
        transform: `translate(${currentOffset?.x}px, ${(currentOffset?.y ?? 0) - 50}px)`,
      }}>
        <div className="item drag-preview">{item.text}</div>
      </div>
    </div>
  )
}

