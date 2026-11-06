import { useEffect, useRef } from "react";
import { basicSetup } from "codemirror";
import { EditorState, Annotation } from "@codemirror/state";
import { EditorView, placeholder, Decoration, ViewPlugin, type DecorationSet, type ViewUpdate } from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";
import { javascript } from "@codemirror/lang-javascript";
import { languages } from "@codemirror/language-data";
import { HighlightStyle, syntaxHighlighting, syntaxTree } from "@codemirror/language";
import { tags } from "@lezer/highlight";

const markdownStyle = HighlightStyle.define([
  {tag: tags.heading1, fontSize: "1.5rem", fontWeight: "700", color: "#1b1b1a"},
  {tag: tags.heading2, fontSize: "1.5rem", fontWeight: "700", color: "#1b1b1a"},
  {tag: tags.heading3, fontSize: "1.17rem", fontWeight: "700", color: "#1b1b1a"},
  {tag: tags.strong, fontWeight: "700"},
  {tag: tags.emphasis, fontStyle: "italic"},
  {tag: tags.link, color: "#2563eb", textDecoration: "underline"},
  {tag: tags.processingInstruction, color: "#a79783"},
  {tag: tags.keyword, class: "cm-token-keyword"},
  {tag: tags.string, class: "cm-token-string"},
  {tag: tags.comment, class: "cm-token-comment"},
  {tag: tags.number, class: "cm-token-number"},
  {tag: tags.bool, class: "cm-token-number"},
  {tag: tags.operator, class: "cm-token-operator"},
  {tag: tags.typeName, class: "cm-token-type"},
  {tag: tags.function(tags.variableName), class: "cm-token-function"},
  {tag: tags.propertyName, class: "cm-token-property"},
]);
const codeLines = ViewPlugin.fromClass(class {
  decorations: DecorationSet;
  constructor(view: EditorView) { this.decorations = this.build(view); }
  update(update: ViewUpdate) { if (update.docChanged || update.viewportChanged || syntaxTree(update.startState) !== syntaxTree(update.state)) this.decorations = this.build(update.view); }
  build(view: EditorView) {
    const lines = new Map<number, string>();
    for (const range of view.visibleRanges) syntaxTree(view.state).iterate({from: range.from, to: range.to, enter(node) {
      if (/^ATXHeading[1-6]$/.test(node.name)) {
        const from = view.state.doc.lineAt(node.from).from;
        lines.set(from, [lines.get(from), "cm-heading-line"].filter(Boolean).join(" "));
      }
      if (node.name === "ListItem") {
        const from = view.state.doc.lineAt(node.from).from;
        lines.set(from, [lines.get(from), "cm-list-line"].filter(Boolean).join(" "));
      }
      if (node.name === "Blockquote") {
        let quoteLine = view.state.doc.lineAt(node.from);
        const quoteEnd = view.state.doc.lineAt(node.to).number;
        while (quoteLine.number <= quoteEnd) {
          lines.set(quoteLine.from, [lines.get(quoteLine.from), "cm-quote-line"].filter(Boolean).join(" "));
          if (quoteLine.number === view.state.doc.lines) break;
          quoteLine = view.state.doc.line(quoteLine.number + 1);
        }
      }
      if (node.name !== "FencedCode") return;
      let line = view.state.doc.lineAt(node.from);
      const end = view.state.doc.lineAt(node.to).number;
      const start = line.number;
      while (line.number <= end) {
        const modifiers = ["cm-code-block", ...(line.number === start ? ["cm-code-first"] : []), ...(line.number === end ? ["cm-code-last"] : [])];
        lines.set(line.from, [lines.get(line.from), ...modifiers].filter(Boolean).join(" "));
        if (line.number === view.state.doc.lines) break;
        line = view.state.doc.line(line.number + 1);
      }
    }});
    for (const range of view.visibleRanges) {
      let line = view.state.doc.lineAt(range.from);
      const last = view.state.doc.lineAt(range.to).number;
      while (line.number <= last) {
        if (!line.text.trim() && !(lines.get(line.from) ?? "").includes("cm-code-block")) {
          lines.set(line.from, [lines.get(line.from), "cm-empty-line"].filter(Boolean).join(" "));
        }
        if (line.number === view.state.doc.lines) break;
        line = view.state.doc.line(line.number + 1);
      }
    }
    return Decoration.set([...lines].sort(([a],[b]) => a-b).map(([from, className]) => Decoration.line({class: className}).range(from)));
  }
}, {decorations: value => value.decorations});

const externalUpdate = Annotation.define<boolean>();
const typescript = javascript({ typescript: true }).language;
const typescriptJsx = javascript({ typescript: true, jsx: true }).language;
const js = javascript().language;
const jsx = javascript({ jsx: true }).language;
function codeLanguage(info: string) {
  const name = info.trim().split(/\s+/)[0]?.toLowerCase();
  if (name === "ts" || name === "typescript") return typescript;
  if (name === "tsx") return typescriptJsx;
  if (name === "js" || name === "javascript") return js;
  if (name === "jsx") return jsx;
  return languages.find((language) => language.name.toLowerCase() === name || language.alias.some((alias) => alias.toLowerCase() === name)) ?? null;
}

export function MarkdownEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const parent = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const change = useRef(onChange);
  useEffect(() => { change.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!parent.current) return;
    const editor = new EditorView({
      parent: parent.current,
      state: EditorState.create({
        doc: "",
        extensions: [
          basicSetup,
          markdown({ codeLanguages: codeLanguage }),
          syntaxHighlighting(markdownStyle),
          codeLines,
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ "aria-label": "본문 (Markdown)" }),
          placeholder("여기에 글을 작성하세요."),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !update.transactions.some((tr) => tr.annotation(externalUpdate))) {
              change.current(update.state.doc.toString());
            }
          }),
        ],
      }),
    });
    view.current = editor;
    return () => { view.current = null; editor.destroy(); };
  }, []);

  useEffect(() => {
    const editor = view.current;
    if (!editor || editor.state.doc.toString() === value) return;
    editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value }, annotations: externalUpdate.of(true) });
  }, [value]);

  return <div className="markdown-editor" ref={parent} />;
}
