import type { ReactNode } from "react";
import Header from "./Header";
import type { Breadcrumb } from "../../types";

interface AppShellProps {
  workspaceName: string;
  breadcrumbs: Breadcrumb[];
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onNavigateBreadcrumb: (index: number) => void;
  onOpenCommandPalette: () => void;
  children: ReactNode;
  sidebar?: ReactNode;
}

export default function AppShell({
  workspaceName,
  breadcrumbs,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onNavigateBreadcrumb,
  onOpenCommandPalette,
  children,
  sidebar,
}: AppShellProps) {
  return (
    <div className="w-full h-full flex flex-col bg-[#13131a] text-white">
      <Header
        workspaceName={workspaceName}
        breadcrumbs={breadcrumbs}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
        onNavigateBreadcrumb={onNavigateBreadcrumb}
        onOpenCommandPalette={onOpenCommandPalette}
      />
      <div className="flex-1 flex overflow-hidden">
        {sidebar && (
          <aside className="w-72 border-r border-white/5 bg-[#181825] overflow-y-auto">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 relative overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
