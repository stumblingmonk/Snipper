const DB_NAME = 'snipit';
const DB_VERSION = 1;
const STORE_NAME = 'exportHandles';
const DIRECTORY_KEY = 'batchDirectory';

export type ExportWriteMode = 'batch' | 'individual';

export interface ExportWriter {
  write: (blob: Blob, filename: string, index: number) => Promise<void>;
  dispose: () => void;
}

interface DirectoryHandleWithPermissions extends FileSystemDirectoryHandle {
  queryPermission: (descriptor: {
    mode: 'read' | 'readwrite';
  }) => Promise<PermissionState>;
  requestPermission: (descriptor: {
    mode: 'read' | 'readwrite';
  }) => Promise<PermissionState>;
}

interface FilePickerWindow extends Window {
  showDirectoryPicker?: (options?: {
    mode?: 'read' | 'readwrite';
  }) => Promise<FileSystemDirectoryHandle>;
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    types?: Array<{
      description: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<FileSystemFileHandle>;
}

function getPickerWindow(): FilePickerWindow {
  return window as FilePickerWindow;
}

function asDirectoryHandleWithPermissions(
  handle: FileSystemDirectoryHandle,
): DirectoryHandleWithPermissions {
  return handle as DirectoryHandleWithPermissions;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
  });
}

async function readDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(DIRECTORY_KEY);

    request.onsuccess = () => {
      resolve((request.result as FileSystemDirectoryHandle | undefined) ?? null);
    };
    request.onerror = () => reject(request.error ?? new Error('IndexedDB read failed'));
  });
}

export async function persistDirectoryHandle(
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const request = transaction.objectStore(STORE_NAME).put(handle, DIRECTORY_KEY);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('IndexedDB write failed'));
  });
}

export async function queryDirectoryPermission(
  handle: FileSystemDirectoryHandle,
): Promise<boolean> {
  const permissionHandle = asDirectoryHandleWithPermissions(handle);
  const current = await permissionHandle.queryPermission({ mode: 'readwrite' });
  if (current === 'granted') {
    return true;
  }

  const requested = await permissionHandle.requestPermission({ mode: 'readwrite' });
  return requested === 'granted';
}

export async function loadPersistedDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  if (!supportsDirectoryPicker()) {
    return null;
  }

  try {
    const handle = await readDirectoryHandle();
    if (!handle) {
      return null;
    }

    const allowed = await queryDirectoryPermission(handle);
    return allowed ? handle : null;
  } catch {
    return null;
  }
}

export function supportsDirectoryPicker(): boolean {
  return typeof getPickerWindow().showDirectoryPicker === 'function';
}

export function supportsSaveFilePicker(): boolean {
  return typeof getPickerWindow().showSaveFilePicker === 'function';
}

export async function pickExportDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!supportsDirectoryPicker()) {
    return null;
  }

  const handle = await getPickerWindow().showDirectoryPicker!({ mode: 'readwrite' });
  await persistDirectoryHandle(handle);
  return handle;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function writeToDirectory(
  directoryHandle: FileSystemDirectoryHandle,
  blob: Blob,
  filename: string,
): Promise<void> {
  const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

async function writeWithSavePicker(blob: Blob, filename: string): Promise<void> {
  const handle = await getPickerWindow().showSaveFilePicker!({
    suggestedName: filename,
    types: [
      {
        description: 'PNG Image',
        accept: { 'image/png': ['.png'] },
      },
    ],
  });
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function createExportWriter(
  mode: ExportWriteMode,
  directoryHandle: FileSystemDirectoryHandle | null,
): Promise<ExportWriter> {
  if (
    mode === 'batch' &&
    directoryHandle &&
    (await queryDirectoryPermission(directoryHandle))
  ) {
    return {
      write: (blob, filename) => writeToDirectory(directoryHandle, blob, filename),
      dispose: () => {},
    };
  }

  if (mode === 'individual' && supportsSaveFilePicker()) {
    return {
      write: async (blob, filename) => {
        try {
          await writeWithSavePicker(blob, filename);
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            throw err;
          }
          downloadBlob(blob, filename);
        }
      },
      dispose: () => {},
    };
  }

  return {
    write: async (blob, filename) => {
      downloadBlob(blob, filename);
    },
    dispose: () => {},
  };
}
