const DB_NAME = 'claude-dashboard'
const STORE_NAME = 'handles'
const HANDLE_KEY = 'claude-dir'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(HANDLE_KEY)
      req.onsuccess = () => resolve(req.result ?? null)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

export async function verifyPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  try {
    // Check if permission already granted
    const status = await (handle as any).queryPermission({ mode: 'read' })
    if (status === 'granted') return true

    // Request permission (requires user gesture on some browsers)
    const result = await (handle as any).requestPermission({ mode: 'read' })
    return result === 'granted'
  } catch {
    return false
  }
}
