import React from "react";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, rows, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={
          className || "w-full p-2 mb-4 border border-gray-300 rounded"
        }
        rows={rows || 4}
        {...props}
      ></textarea>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
