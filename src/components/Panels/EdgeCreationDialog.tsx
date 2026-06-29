import { useState } from "react";
import { BUILTIN_RELATIONSHIPS } from "../../constants/relationships";

interface EdgeCreationDialogProps {
  sourceLabel: string;
  targetLabel: string;
  onConfirm: (relationshipId: string, customLabel?: string) => void;
  onCancel: () => void;
}

export default function EdgeCreationDialog({
  sourceLabel,
  targetLabel,
  onConfirm,
  onCancel,
}: EdgeCreationDialogProps) {
  const [selectedId, setSelectedId] = useState<string>("uses");
  const [customLabel, setCustomLabel] = useState("");

  const handleConfirm = () => {
    onConfirm(selectedId, selectedId === "custom" ? customLabel : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="rounded-xl p-6 w-full max-w-sm shadow-2xl" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}>
        <h3 className="text-sm font-medium mb-3" style={{ color: "var(--app-text)" }}>Create Relationship</h3>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-4" style={{ background: "var(--app-surface-2)" }}>
          <span style={{ color: "var(--app-text)" }}>{sourceLabel}</span>
          <span className="text-xs" style={{ color: "var(--app-muted)" }}>──</span>
          <span style={{ color: "var(--app-accent)" }}>?</span>
          <span className="text-xs" style={{ color: "var(--app-muted)" }}>──➤</span>
          <span style={{ color: "var(--app-text)" }}>{targetLabel}</span>
        </div>

        <div className="space-y-1 max-h-48 overflow-y-auto mb-4">
          {BUILTIN_RELATIONSHIPS.map((rel) => (
            <button
              key={rel.id}
              onClick={() => setSelectedId(rel.id)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left hover:bg-white/5"
              style={{
                background: selectedId === rel.id ? "var(--app-surface-2)" : undefined,
                color: selectedId === rel.id ? "var(--app-text)" : "var(--app-muted)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: rel.color ?? "#6b7280" }}
              />
              <span>{rel.displayName}</span>
            </button>
          ))}
        </div>

        {selectedId === "custom" && (
          <div className="mb-4">
            <label className="block text-xs mb-1" style={{ color: "var(--app-muted)" }}>Custom Label</label>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none transition-colors"
              style={{ background: "var(--app-surface-2)", border: "1px solid var(--app-border)", color: "var(--app-text)" }}
              placeholder="e.g., trains"
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
            style={{ color: "var(--app-muted)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-white/15"
            style={{ background: "var(--app-surface-2)", border: "1px solid var(--app-border)", color: "var(--app-text)" }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}