import type { Workspace } from "@/types/workspace";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface WorkspaceStore {
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  selectedWorkspace: Workspace | null;
  setSelectedWorkspace: (workspace: Workspace | null) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  devtools(
    persist(
      (set) => ({
        workspaces: [],
        setWorkspaces: (workspaces: Workspace[]) => {
          set({ workspaces });
        },
        selectedWorkspace: null,
        setSelectedWorkspace: (workspace: Workspace | null) => {
          set({ selectedWorkspace: workspace });
        },
      }),
      {
        name: "workspace-store",
      }
    )
  )
);
