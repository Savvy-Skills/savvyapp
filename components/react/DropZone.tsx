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
  showAnswer: boolean
}

export function DropZone({ zone, onDrop, children, isCorrect, isSubmitted, isWrong, showAnswer }: DropZoneProps) {
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
	  } ${showAnswer ? 'show-answer' : ''
      }`}
    >
      {isSubmitted && (
        <div className="status-icon-container">
          <StatusIcon isCorrect={isCorrect} isWrong={!isCorrect} showAnswer={showAnswer} />
        </div>
      )}
      {children}
    </div>
  )
}

