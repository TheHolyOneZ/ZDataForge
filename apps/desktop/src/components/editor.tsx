import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

interface Props {
  value: string;
  onChange?: (value: string) => void;
  language?: "json" | "text";
  readOnly?: boolean;
  placeholder?: string;
}


const darkTheme = EditorView.theme(
  {
    "&": {
      background: "var(--color-panel)",
      color: "var(--color-text-primary)",
      height: "100%",
    },
    "&.cm-focused": {
      outline: "none",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-mono)",
      fontSize: "13px",
      lineHeight: "1.55",
    },
    ".cm-content": {
      caretColor: "var(--color-accent)",
      padding: "8px 0",
      color: "#C0CAF5",
    },
    ".cm-line": {
      padding: "0 10px",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "var(--color-accent)",
      borderLeftWidth: "2px",
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "var(--color-accent)",
    },


    ".cm-activeLine": {
      background: "rgba(255, 255, 255, 0.025)",
    },
    ".cm-activeLineGutter": {
      background: "rgba(255, 255, 255, 0.025)",
      color: "var(--color-text-primary)",
    },


    ".cm-gutters": {
      background: "var(--color-panel)",
      borderRight: "1px solid var(--color-border)",
      color: "var(--color-text-muted)",
    },
    ".cm-gutterElement": {
      padding: "0 8px 0 6px",
      minWidth: "28px",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      color: "var(--color-text-muted)",
      fontSize: "12px",
    },


    ".cm-selectionBackground": {
      background: "var(--color-accent-muted)",
    },
    "&.cm-focused .cm-selectionBackground": {
      background: "var(--color-accent-muted)",
    },
    ".cm-content ::selection": {
      background: "var(--color-accent-muted)",
    },
    "&.cm-focused .cm-content ::selection": {
      background: "var(--color-accent-muted)",
    },
    "::selection": {
      background: "var(--color-accent-muted)",
    },


    ".cm-placeholder": {
      color: "var(--color-text-muted)",
      fontStyle: "italic",
    },


    ".cm-matchingBracket, .cm-nonmatchingBracket": {
      background: "var(--color-accent-muted)",
      outline: "1px solid var(--color-accent)",
      borderRadius: "2px",
    },


    ".cm-tooltip": {
      background: "var(--color-elevated)",
      border: "1px solid var(--color-border)",
      color: "var(--color-text-primary)",
      borderRadius: "var(--radius-sm)",
    },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
      background: "var(--color-accent-muted)",
      color: "var(--color-text-primary)",
    },


    ".cm-panels": {
      background: "var(--color-panel)",
      color: "var(--color-text-primary)",
      borderTop: "1px solid var(--color-border)",
    },
    ".cm-panels-top": {
      borderBottom: "1px solid var(--color-border)",
    },
    ".cm-textfield": {
      background: "var(--color-elevated)",
      border: "1px solid var(--color-border)",
      color: "var(--color-text-primary)",
      borderRadius: "var(--radius-sm)",
      padding: "2px 6px",
    },
    ".cm-button": {
      background: "var(--color-elevated)",
      border: "1px solid var(--color-border)",
      color: "var(--color-text-primary)",
      borderRadius: "var(--radius-sm)",
      backgroundImage: "none",
    },
  },
  { dark: true }
);


const jsonHighlight = HighlightStyle.define([

  { tag: t.propertyName, color: "#7c5cff", fontWeight: "500" },

  { tag: t.string, color: "#9ECE6A" },

  { tag: t.number, color: "#FF9E64" },

  { tag: t.bool, color: "#BB9AF7" },

  { tag: t.null, color: "#565F89", fontStyle: "italic" },

  {
    tag: [t.brace, t.bracket, t.squareBracket, t.punctuation, t.separator],
    color: "#A9B1D6",
  },

  { tag: t.escape, color: "#FF9E64" },
  { tag: t.invalid, color: "var(--color-error)" },
]);

export function Editor({
  value,
  onChange,
  language = "text",
  readOnly = false,
  placeholder,
}: Props) {
  const extensions = [darkTheme];
  if (language === "json") {
    extensions.push(json(), syntaxHighlighting(jsonHighlight));
  }

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      editable={!readOnly}
      placeholder={placeholder}
      height="100%"
      theme="dark"
      className="selectable"
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        foldGutter: false,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: false,
        indentOnInput: true,
      }}
    />
  );
}
