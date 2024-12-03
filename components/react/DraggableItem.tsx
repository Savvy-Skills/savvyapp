import React from 'react'
import { useDrag } from 'react-dnd'
import { Icon } from 'react-native-paper'

interface Item {
  text: string
  match: string
}

interface DraggableItemProps {
  item: Item
  isDisabled: boolean
}

export function DraggableItem({ item, isDisabled }: DraggableItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'item',
    item: { text: item.text, match: item.match },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: !isDisabled,
  }), [item, isDisabled])

  return (
    <div
      ref={drag}
      className={`item ${isDragging ? 'dragging' : ''} ${isDisabled ? 'disabled' : ''}`}
    >
		<Icon source="drag" size={16}  color="#000" />
      {item.text}
    </div>
  )
}

