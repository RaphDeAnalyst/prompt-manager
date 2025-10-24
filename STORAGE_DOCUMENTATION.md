# Storage Architecture Documentation

## Overview

This Prompt Manager uses a **dual-layer storage system** to ensure data persistence across various browser scenarios, including cache clearing.

## The Problem: Browser Cache Clearing

When users click "Clear browsing data" in their browser, here's what gets deleted:

| Storage Type | Deleted? | Cache Clear | Cookie Clear | Site Data Clear |
|---|---|---|---|---|
| **localStorage** | ❌ | ✓ Deleted | ✓ Deleted | ✓ Deleted |
| **IndexedDB** | ❌ | ✓ Deleted | ✓ Deleted | ✓ Deleted |
| **Cookies** | ❌ | ✓ Deleted | ✓ Deleted | ✓ Deleted |

**Important**: Both `localStorage` and `IndexedDB` are deleted together when you clear "Site data" (most browsers default to this).

## Our Solution: Dual-Layer Storage

```
┌─────────────────────────────────────────────────────────────┐
│                    PROMPT DATA                              │
└────────────────┬────────────────────────────────┬───────────┘
                 │                                │
         ┌───────▼────────┐            ┌──────────▼──────────┐
         │   IndexedDB    │            │  localStorage       │
         │   (Primary)    │            │  (Backup/JSON)      │
         │                │            │                     │
         │ • Optimized    │            │ • Text format       │
         │ • Binary data  │            │ • 5-10MB limit      │
         │ • Large scale  │            │ • Human readable    │
         │ • Fast access  │            │                     │
         └────────────────┘            └─────────────────────┘
```

## How It Works

### 1. **Writing Data (savePrompts)**

```
1. Write to IndexedDB ──┐
                        ├─► Succeed if at least ONE succeeds
2. Write to localStorage ┘
   (JSON backup)

✓ BEST: Both succeed = Maximum redundancy
⚠️  ACCEPTABLE: One fails = Still have backup
✗ FAIL: Both fail = Error thrown
```

### 2. **Reading Data (getPrompts)**

```
1. Try IndexedDB ──┐
                   ├─► Return FIRST available source
2. Try localStorage ┘

✓ IndexedDB has data = Use it (faster, better)
⚠️  Only localStorage = Use it (slower but works)
✗ Nothing found = Return empty array
```

### 3. **Backup Storage Key**

The JSON backup is stored under the key: `prompts_backup`

- **Location**: `localStorage['prompts_backup']`
- **Format**: JSON string (human-readable)
- **Purpose**: Failsafe if IndexedDB is unavailable
- **Size**: ~1-2KB per 10 prompts

## Real-World Scenarios

### Scenario 1: Normal Operation ✅

```
User adds a prompt
    ↓
savePrompts() is called
    ↓
Both IndexedDB and localStorage succeed
    ↓
App works perfectly, data is redundant
```

### Scenario 2: Browser Crashes / IndexedDB Lost ⚠️

```
User is offline, browser crashes
    ↓
IndexedDB corrupted or lost
    ↓
User opens app again
    ↓
IndexedDB init fails → tries localStorage
    ↓
Backup storage has the data!
    ↓
All prompts recovered ✅
```

### Scenario 3: Clear "Cookies and cached data" (TYPICAL) 🚨

```
User clears browser cache (most common setting)
    ↓
BOTH localStorage AND IndexedDB deleted
    ↓
User opens app
    ↓
getPrompts() finds nothing in IndexedDB
    ↓
getPrompts() finds nothing in localStorage
    ↓
Returns empty array (data lost)
```

⚠️ **This is the limitation**: Clearing "site data" deletes everything.

## The Export/Import Solution 📥📤

Since both storage layers can be deleted by cache clearing, the **safest approach** is:

### Recommended Backup Strategy:

1. **Weekly/Monthly**: Click **"📥 Export"** button
   - Downloads `prompts-backup-YYYY-MM-DD.json`
   - This file is in your Downloads folder (safe from browser cache)

2. **Before clearing cache**: Export your prompts first

3. **After clearing cache**: Click **"📤 Import"** and select your backup file

```
Exported JSON file (on disk)
         ↑
         │ Manual export
         │
    [App Storage]
    ├─ IndexedDB (can be cleared)
    └─ localStorage backup (can be cleared)
         ↑
         │ Auto-save to both
         │
    [Your Prompts]
```

## Technical Details

### IndexedDB Configuration

- **Database Name**: `PromptManagerDB`
- **Version**: `1`
- **Object Store**: `prompts` (keyPath: `id`)

### Error Handling

The storage layer includes robust error handling:

```javascript
// Handles database not found
try {
  await initDB();
  // Use db
} catch (error) {
  console.warn('IndexedDB unavailable:', error);
  // Falls back to localStorage
}
```

### Connection Management

- Detects unexpected database closure
- Validates object store exists before use
- Handles blocked events from multiple tabs
- Resets invalid connections

## Storage Status Check

You can check storage health by opening the browser console:

```javascript
import { getStorageStatus } from './utils/storage.js';
getStorageStatus().then(status => console.log(status));

// Output:
// {
//   indexedDBAvailable: true,
//   backupStorageAvailable: true,
//   promptsInIndexedDB: 5,
//   promptsInBackup: 5,
//   error: null
// }
```

## Important Notes

### ✅ DO:
- Export prompts regularly as JSON file
- Keep exported JSON files in a safe location
- Import before clearing browser cache
- Check browser console for warnings

### ❌ DON'T:
- Assume data survives all cache clearing operations
- Delete exported JSON files without backup
- Edit JSON files manually (keep valid format)
- Clear cache without exporting first

## Future Improvements

Possible enhancements for better persistence:

1. **Cloud Sync**: Sync with cloud storage (Google Drive, Dropbox)
2. **Service Worker**: Cache some data in service worker
3. **IndexedDB Observers**: Monitor database changes
4. **Encryption**: Encrypt sensitive prompts
5. **Version History**: Keep prompt versions with timestamps

## Troubleshooting

**Q: Why did my prompts disappear?**
- Most likely cause: You cleared "Site data" without exporting first
- Solution: Always export before clearing cache, then import afterward

**Q: Can I manually edit the backup?**
- Yes, it's valid JSON. Edit carefully to maintain format:
```json
[
  { "id": "123", "title": "...", "content": "...", "createdAt": "..." },
  { "id": "456", "title": "...", "content": "...", "createdAt": "..." }
]
```

**Q: How much data can I store?**
- IndexedDB: Usually 50MB+ per site (varies by browser)
- localStorage backup: Limited to 5-10MB per site
- In practice: Room for 1000s of prompts

**Q: What if both storages fail?**
- The app will show an empty state
- You can always import from your exported JSON files
- Export/Import functionality works independently

## Conclusion

This dual-layer approach provides:
- ✅ Fast access (IndexedDB)
- ✅ Automatic redundancy (both storages)
- ✅ Graceful degradation (fallback system)
- ✅ Export/Import for manual backup (bulletproof)
- ⚠️ Cannot prevent intentional "Clear site data" deletion

**For maximum protection**: Export your prompts regularly! 📥
