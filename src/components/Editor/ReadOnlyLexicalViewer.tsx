import { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode, registerCodeHighlighting } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

function CodeHighlightPlugin() {
    const [editor] = useLexicalComposerContext();
    useEffect(() => registerCodeHighlighting(editor), [editor]);
    return null;
}

// Shared with LexicalEditor.tsx — consider extracting to lexicalTheme.ts
const theme = {
    paragraph: "leading-6",
    text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        strikethrough: "line-through",
        underlineStrikethrough: "underline line-through",
    },
    list: {
        ul: "list-disc pl-4 ml-1",
        ol: "list-decimal pl-4 ml-1",
        listitem: "leading-5",
        nested: {
            listitem: "list-none",
        },
    },
    code: "font-mono text-xs bg-black/30 rounded p-2 my-1 block overflow-x-auto whitespace-pre",
    codeHighlight: {
        comment:        "text-[#5c6370] italic",
        prolog:         "text-[#5c6370]",
        doctype:        "text-[#5c6370]",
        cdata:          "text-[#5c6370]",
        keyword:        "text-[#c678dd]",
        atrule:         "text-[#c678dd]",
        important:      "text-[#c678dd]",
        regex:          "text-[#c678dd]",
        selector:       "text-[#98c379]",
        string:         "text-[#98c379]",
        char:           "text-[#98c379]",
        inserted:       "text-[#98c379]",
        "class-name":   "text-[#e5c07b]",
        class:          "text-[#e5c07b]",
        function:       "text-[#61afef]",
        builtin:        "text-[#61afef]",
        number:         "text-[#d19a66]",
        boolean:        "text-[#d19a66]",
        constant:       "text-[#d19a66]",
        symbol:         "text-[#d19a66]",
        deleted:        "text-[#e06c75]",
        property:       "text-[#e06c75]",
        tag:            "text-[#e06c75]",
        namespace:      "text-[#e06c75]",
        entity:         "text-[#e06c75]",
        attr:           "text-[#e06c75]",
        operator:       "text-[#56b6c2]",
        url:            "text-[#56b6c2]",
        variable:       "text-[#e06c75]",
        punctuation:    "text-[#abb2bf]",
    },
};

/**
 * Inner plugin — reacts to editorState prop changes so the viewer stays
 * in sync when the parent re-renders with a different node's content.
 * No `loaded` guard: unlike the edit-mode LoadEditorStatePlugin we always
 * want to reflect the current prop (the component is read-only so there is
 * no risk of clobbering in-progress edits).
 */
function LoadStatePlugin({ editorState }: { editorState: string }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editorState) return;
        try {
            const parsed = editor.parseEditorState(editorState);
            editor.setEditorState(parsed);
        } catch (err) {
            console.error("ReadOnlyLexicalViewer: failed to parse editor state", err);
        }
    }, [editor, editorState]);

    return null;
}

interface ReadOnlyLexicalViewerProps {
    editorState: string;
}

export default function ReadOnlyLexicalViewer({ editorState }: ReadOnlyLexicalViewerProps) {
    const initialConfig = {
        namespace: "KnowledgeGraphViewer",
        theme,
        nodes: [ListNode, ListItemNode, CodeNode, CodeHighlightNode],
        editable: false,          // no caret, no editing, no cursor blink
        onError(error: Error) {
            console.error("ReadOnlyLexicalViewer error:", error);
        },
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <RichTextPlugin
                contentEditable={
                    <ContentEditable
                        className="text-xs leading-5 outline-none nodrag nowheel"
                        style={{ color: "var(--app-text)" }}
                    />
                }
                placeholder={null}
                ErrorBoundary={LexicalErrorBoundary}
            />
            <ListPlugin />
            <CodeHighlightPlugin />
            <LoadStatePlugin editorState={editorState} />
        </LexicalComposer>
    );
}