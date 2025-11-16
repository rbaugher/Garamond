import React, { useState, useRef, useEffect } from "react";

function AutoGrowTextarea({ maxHeight = 200, ...props }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height so shrinking works properly
    textarea.style.height = "auto";

    // Calculate the new height
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;

    // Set scroll behavior
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value, maxHeight]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      style={{
        width: "100%",
        resize: "none",       // disable manual resize
        boxSizing: "border-box",
        overflowY: "hidden",  // will switch dynamically
        minHeight: "40px",
        lineHeight: "1.4",
        padding: "8px",
        fontSize: "16px",
        borderRadius: "4px",
        border: "1px solid #ccc",
      }}
      {...props}
    />
  );
}

export default AutoGrowTextarea;
