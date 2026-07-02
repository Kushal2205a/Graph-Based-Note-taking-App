import { useEffect } from "react";

interface ShortcutMap {
  [key: string]: () => void;
}

function isEditingText(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't hijack native text editing (renaming a node, editing node
      // content, typing in a dialog field, etc.) — let Delete/Backspace and
      // Ctrl+C/Ctrl+V behave normally there.
      if (isEditingText(e.target)) return;

      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const key = e.key.toLowerCase();

      let shortcutKey = "";
      if (ctrl && shift) shortcutKey = `ctrl+shift+${key}`;
      else if (ctrl) shortcutKey = `ctrl+${key}`;
      else if (key === "escape") shortcutKey = "escape";

      // Also handle Delete/Backspace without modifiers
      if (!ctrl && !shift) {
        if (key === "delete" || key === "backspace") shortcutKey = "delete";
      }

      if (shortcutKey && shortcuts[shortcutKey]) {
        e.preventDefault();
        e.stopPropagation();
        shortcuts[shortcutKey]();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}