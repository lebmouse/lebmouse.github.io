import { useEffect, useRef } from "react";
import { Annotation, EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { Decoration, EditorView, keymap, placeholder, ViewPlugin, type DecorationSet, type ViewUpdate } from "@codemirror/view";

const externalUpdate = Annotation.define<boolean>();
const tagStyles = ViewPlugin.fromClass(class {
  decorations: DecorationSet;
  constructor(view: EditorView) { this.decorations = this.build(view); }
  update(update: ViewUpdate) { if (update.docChanged) this.decorations = this.build(update.view); }
  build(view: EditorView) {
    const decorations = [];
    const text = view.state.doc.toString();
    const pattern = /[^,\s](?:[^,]*?[^,\s])?(?=\s*(?:,|$))/g;
    for (const match of text.matchAll(pattern)) {
      decorations.push(Decoration.mark({ class: "tag-item" }).range(match.index!, match.index! + match[0].length));
    }
    return Decoration.set(decorations);
  }
}, { decorations: (plugin) => plugin.decorations });

export function TagEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const parent = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const change = useRef(onChange);
  useEffect(() => { change.current = onChange; }, [onChange]);
  useEffect(() => {
    if (!parent.current) return;
    const editor = new EditorView({
      parent: parent.current,
      state: EditorState.create({ extensions: [
        history(), keymap.of([{ key: "Enter", run: () => true }, ...defaultKeymap, ...historyKeymap]),
        EditorView.lineWrapping, EditorView.contentAttributes.of({ "aria-label": "태그", role: "textbox", "aria-multiline": "false" }),
        placeholder("태그 추가 · 쉼표로 구분"), tagStyles,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !update.transactions.some((tr) => tr.annotation(externalUpdate))) change.current(update.state.doc.toString());
        }),
      ] }),
    });
    view.current = editor;
    return () => { view.current = null; editor.destroy(); };
  }, []);
  useEffect(() => {
    const editor = view.current;
    if (!editor || editor.state.doc.toString() === value) return;
    editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value }, annotations: externalUpdate.of(true) });
  }, [value]);
  return <div className="tag-editor" ref={parent} />;
}
