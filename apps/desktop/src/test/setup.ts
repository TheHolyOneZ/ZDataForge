/// <reference types="vitest/globals" />
import { vi } from 'vitest';
import '@testing-library/jest-dom';


vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));


vi.mock('@tauri-apps/api/webviewWindow', () => ({
  getCurrentWebviewWindow: () => ({
    minimize: vi.fn(),
    toggleMaximize: vi.fn(),
    hide: vi.fn(),
  }),
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
}));

vi.mock('@tauri-apps/api/app', () => ({
  getVersion: vi.fn(() => Promise.resolve('0.1.0')),
}));
