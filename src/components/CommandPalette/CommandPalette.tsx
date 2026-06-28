import { useState, useEffect, useRef, useCallback } from "react";

interface CommandItem {
  type: string;
  label: string;
  description?: string;
  shortcut?: string;
}

interface CommandPaletteProps {
  commands: CommandItem[];
  onExecute: (command: CommandItem) => void;
  onClose: () => void;
}

export default function CommandPalette({
  commands,
  onExecute,
  onClose,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.type.toLowerCase().includes(query.toLowerCase()),
      )
    : commands;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" && filtered[selectedIndex]) {
        onExecute(filtered[selectedIndex]);
        onClose();
        return;
      }
    },
    [filtered, selectedIndex, onExecute, onClose],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60">
      <div className="bg-[#1e1e2e] border border-white/10 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-3 border-b border-white/5">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-white text-sm placeholder-white/30 focus:outline-none"
            placeholder="Type a command..."
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-white/30 text-sm text-center">
              No commands found
            </div>
          ) : (
            filtered.map((cmd, index) => (
              <button
                key={cmd.type}
                onClick={() => {
                  onExecute(cmd);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors
                  ${
                    index === selectedIndex
                      ? "bg-blue-500/10 text-white"
                      : "text-white/60 hover:text-white/80 hover:bg-white/5"
                  }
                `}
              >
                <span className="flex-1">{cmd.label}</span>
                {cmd.shortcut && (
                  <span className="text-xs text-white/30 font-mono">{cmd.shortcut}</span>
                )}
              </button>
            ))
          )}
        </div>
        <div className="p-2 border-t border-white/5 text-xs text-white/30 px-4 py-2">
          ↑↓ Navigate &middot; Enter Select &middot; Esc Close
        </div>
      </div>
    </div>
  );
}
