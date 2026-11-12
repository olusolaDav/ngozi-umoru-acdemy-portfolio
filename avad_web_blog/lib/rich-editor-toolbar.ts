//apps/web/lib/rich-editor-toolbar.ts
const TOOLBAR_LABELS: Record<string, string> = {
  header: "Heading level",
  font: "Font family",
  size: "Text size",
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strike: "Strikethrough",
  color: "Text color",
  background: "Text highlight color",
  align: "Text alignment",
  blockquote: "Block quote",
  code: "Inline code",
  link: "Insert or edit link",
  image: "Insert image",
  video: "Insert video",
  clean: "Clear formatting",
};

function pickerOptionLabel(format: string, value: string | null) {
  if (format === "header") {
    return value === "false" || value === null ? "Normal text" : `Heading ${value}`;
  }

  if (format === "size") {
    return value === "false" || value === null ? "Normal size" : `${value[0].toUpperCase()}${value.slice(1)}`;
  }

  if (format === "align") {
    return value ? `${value[0].toUpperCase()}${value.slice(1)} aligned` : "Align left";
  }

  return value ? `${TOOLBAR_LABELS[format] ?? format} ${value}` : TOOLBAR_LABELS[format] ?? format;
}

export function labelRichEditorToolbar(toolbar: HTMLElement) {
  toolbar.querySelectorAll<HTMLElement>("button[class*='ql-']").forEach((button) => {
    const format = Array.from(button.classList).find((name) => name.startsWith("ql-"))?.slice(3);
    if (!format || !TOOLBAR_LABELS[format]) {
      return;
    }

    const label = TOOLBAR_LABELS[format];
    button.title = label;
    button.setAttribute("aria-label", label);
  });

  toolbar.querySelectorAll<HTMLElement>(".ql-picker").forEach((picker) => {
    const format = Array.from(picker.classList).find((name) => name.startsWith("ql-") && name !== "ql-picker")?.slice(3);
    if (!format || !TOOLBAR_LABELS[format]) {
      return;
    }

    const label = TOOLBAR_LABELS[format];
    const pickerLabel = picker.querySelector<HTMLElement>(".ql-picker-label");
    if (pickerLabel) {
      pickerLabel.title = label;
      pickerLabel.setAttribute("aria-label", label);
    }

    picker.querySelectorAll<HTMLElement>(".ql-picker-item").forEach((option) => {
      const value = option.getAttribute("data-value");
      const optionLabel = pickerOptionLabel(format, value);
      option.title = optionLabel;
      option.setAttribute("aria-label", optionLabel);
    });
  });

  toolbar.querySelectorAll<HTMLElement>(".ql-color .ql-picker-item, .ql-background .ql-picker-item").forEach((option) => {
    const picker = option.closest<HTMLElement>(".ql-picker");
    const format = picker?.classList.contains("ql-background") ? "background" : "color";
    const value = option.getAttribute("data-value");
    const label = value ? `${TOOLBAR_LABELS[format]}: ${value}` : `Remove ${format === "color" ? "text color" : "highlight color"}`;
    option.title = label;
    option.setAttribute("aria-label", label);
  });
}
