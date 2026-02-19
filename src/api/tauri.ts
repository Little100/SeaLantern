import { invoke } from "@tauri-apps/api/core";

export async function tauriInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Tauri] Command "${command}" failed:`, message);
    throw error;
  }
}
