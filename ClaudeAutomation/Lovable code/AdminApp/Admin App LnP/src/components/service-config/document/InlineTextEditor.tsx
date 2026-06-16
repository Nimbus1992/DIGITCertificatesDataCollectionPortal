import React, { useRef, useEffect, useState } from "react";

interface InlineTextEditorProps {
  content: string;
  style: React.CSSProperties;
  isEditing: boolean;
  onFinish: (newContent: string) => void;
  onCancel: () => void;
}

const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  content, style, isEditing, onFinish, onCancel,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(content);

  useEffect(() => {
    setText(content);
  }, [content]);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  if (!isEditing) {
    return (
      <div style={{ ...style, whiteSpace: content.includes("\n") ? "pre-wrap" : "normal" }}>
        {content}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className="outline-none ring-2 ring-primary/30 rounded-sm w-full h-full"
      style={{ ...style, cursor: "text", whiteSpace: "pre-wrap", minHeight: "1em" }}
      onBlur={() => {
        const newText = ref.current?.innerText || content;
        onFinish(newText);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          const newText = ref.current?.innerText || content;
          onFinish(newText);
        }
      }}
      dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br>") }}
    />
  );
};

export default InlineTextEditor;
