import React from "react";
import ErrorComponent from "./ErrorComponent";

interface ApiErrorComponentProps {
  message: string;
  onAction?: () => void;
  onCancel?: () => void;
  title?: string;
  actionLabel?: string;
}

const ApiErrorComponent = ({ 
  message, 
  onAction,
  onCancel,
  title = "Connection Error",
  actionLabel = "Try Again"
}: ApiErrorComponentProps) => {
  return (
    <ErrorComponent
      title={title}
      message={message}
      actionLabel={actionLabel}
      onAction={onAction}
      imageSource={require("@/assets/images/pngs/robot.png")} // Make sure to add this image
      secondaryActionLabel={onCancel ? "Cancel" : undefined}
      onSecondaryAction={onCancel}
    />
  );
};

export default ApiErrorComponent; 