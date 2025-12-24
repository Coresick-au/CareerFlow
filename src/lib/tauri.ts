// Shared invoke wrapper that works in both web and Tauri environments
import { invoke as tauriInvoke } from '@tauri-apps/api/tauri';

// Check if we're in a Tauri environment
const isTauri = typeof window !== 'undefined' && window.__TAURI__;

// Export invoke function that works in both environments
export async function invoke<T>(command: string, args?: any): Promise<T> {
  if (isTauri) {
    // Use real Tauri invoke in desktop app
    return tauriInvoke<T>(command, args);
  } else {
    // Use mock invoke in web environment
    const mockModule = await import('../../src-tauri-mock');
    return mockModule.invoke<T>(command, args);
  }
}

// Export other Tauri APIs if needed
export const tauri = window.__TAURI__;
