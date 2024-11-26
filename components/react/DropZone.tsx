import React from 'react'
import { useDrop } from 'react-dnd'
import StatusIcon from "@/components/StatusIcon"

interface DropZoneProps {
  zone: string
  onDrop: (itemText: string, zone: string | null) => void
  children: React.ReactNode
  isCorrect: boolean
  isSubmitted: boolean
  isWrong: boolean
}

export function DropZone({ zone, onDrop, children, isCorrect, isSubmitted, isWrong }: DropZoneProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'item',
    drop: (item: { text: string, match: string }) => {
      onDrop(item.text, zone)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [zone, onDrop])

  return (
    <div 
      ref={drop} 
      className={`drop-zone ${isOver ? 'hover' : ''} ${
        isSubmitted ? (isCorrect ? 'correct' : 'wrong') : ''
      }`}
    >
      {isSubmitted && (
        <div className="status-icon-container">
          <StatusIcon isCorrect={isCorrect} isWrong={!isCorrect} showAnswer={false} />
        </div>
      )}
      {children}
    </div>
  )
}

