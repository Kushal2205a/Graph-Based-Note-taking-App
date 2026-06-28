import { useEffect } from "react";

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
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
