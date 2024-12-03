import React from "react";
import { useDragLayer } from "react-dnd";
import { Icon } from "react-native-paper";

export function CustomDragLayer() {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging) {
    return null;
  }

  return (
    <div className="custom-drag-layer">
      <div
        style={{
          transform: `translate(${currentOffset?.x}px, ${
            (currentOffset?.y ?? 0) - 65
          }px)`,
        }}
      >
        <div className="item drag-preview">
          <Icon source="drag" size={16} color="#000" />
          {item.text}
        </div>
      </div>
    </div>
  );
}
