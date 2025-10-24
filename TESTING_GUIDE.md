# Testing Guide: Storage Persistence

This guide helps you verify that the storage system works correctly across different scenarios.

## Prerequisites

1. App running at `http://localhost:3003` (or your dev server)
2. Browser DevTools open (F12 or Right-click → Inspect)
3. Console tab visible to see logs

## Test 1: Basic Create and Save ✅

**Objective**: Verify data is saved to both storage layers

### Steps:
1. Open the app
2. Click **"+ New Prompt"**
3. Fill in:
   - Title: "Test Prompt 1"
   - Content: "This is a test"
   - Category: "Testing"
4. Click **"Create"**

### Verify in Console:
```javascript
// Open DevTools Console and run:
localStorage.getItem('prompts_backup')
// Should output: JSON string with your prompt
```

### Expected Results:
- ✅ Prompt appears in sidebar
- ✅ Can click to view it
- ✅ Console shows: `"Saved prompts to JSON backup storage"`

---

## Test 2: IndexedDB Check 🗄️

**Objective**: Verify IndexedDB is being used

### Steps:
1. Open DevTools → **Application** tab (or **Storage** in Firefox)
2. Left sidebar → **IndexedDB** → **PromptManagerDB** → **prompts**

### Expected Results:
- ✅ Store contains your prompts
- ✅ Data is visible with timestamps

### Alternative Check in Console:
```javascript
import { getStorageStatus } from './utils/storage.js';
getStorageStatus().then(s => console.table(s));

// Output:
// {
//   indexedDBAvailable: true,
//   backupStorageAvailable: true,
//   promptsInIndexedDB: 1,
//   promptsInBackup: 1
// }
```

---

## Test 3: IndexedDB Fallback ⚠️

**Objective**: Verify app gracefully falls back when IndexedDB fails

### Steps:
1. Create a prompt (Test Prompt 2)
2. Open DevTools → **Application** → **IndexedDB**
3. Right-click **PromptManagerDB** → **Delete Database** (simulate corruption)
4. Refresh the page

### Expected Results:
- ✅ Console shows: `"IndexedDB unavailable, attempting to load from backup storage"`
- ✅ Your prompt still appears (loaded from localStorage backup)
- ✅ Can still add/edit/delete prompts
- ✅ Console shows: `"⚠️ IndexedDB unavailable - only backup storage is active"`

---

## Test 4: Clear "Cookies and Site Data" 🚨

**Objective**: Understand what happens when clearing all data

### Steps:
1. Create a prompt (Test Prompt 3) - **write down the content**
2. Export prompts: Click **"📥 Export"** button
   - Save the JSON file (Downloads folder)
3. Open DevTools → **Application** → **Cookies** (or **Storage**)
4. Find your site and click **"Clear site data"** or similar
   - Alternative: Settings → Privacy → Clear browsing data → "Cookies and cached files"
5. Refresh the page

### Expected Results:
- ❌ Your prompt is gone (both storages cleared together)
- ✅ App shows empty state
- ⚠️ Console shows: `"No data available - returning empty array"`

### Recovery:
1. Click **"📤 Import"**
2. Select the JSON file you exported earlier
3. Click open

### Expected Results After Import:
- ✅ All prompts restored
- ✅ Data is in both IndexedDB and localStorage again

---

## Test 5: Export/Import ↔️

**Objective**: Verify backup and restore functionality

### Steps:
1. Create multiple prompts:
   - "Export Test 1"
   - "Export Test 2"
   - "Export Test 3"
2. Click **"📥 Export"** button
3. Check Downloads folder for `prompts-backup-YYYY-MM-DD.json`
4. Open the file in a text editor to verify it's valid JSON

### Expected JSON Format:
```json
[
  {
    "id": "1234567890",
    "createdAt": "2025-10-24T06:00:00.000Z",
    "title": "Export Test 1",
    "content": "Test content",
    "category": "Testing",
    "tags": []
  },
  {
    "id": "1234567891",
    "createdAt": "2025-10-24T06:01:00.000Z",
    "title": "Export Test 2",
    "content": "More test content",
    "category": "Testing",
    "tags": ["example", "test"]
  }
]
```

### Import Test:
1. Delete one prompt from the app
2. Click **"📤 Import"**
3. Select the backup JSON you downloaded
4. Verify all prompts are back

### Expected Results:
- ✅ File is valid JSON
- ✅ All prompts are restored after import
- ✅ Timestamps are preserved
- ✅ No duplicate IDs

---

## Test 6: Multiple Tabs/Windows 🔄

**Objective**: Verify app works with multiple browser tabs

### Steps:
1. Open the app in Tab 1
2. Create a prompt "Tab 1 Prompt"
3. Open app in Tab 2 (same URL)
4. In Tab 1, create another prompt "Tab 1 Prompt 2"
5. Check Tab 2 (you may need to refresh to see updates)

### Expected Results:
- ✅ Each tab loads the latest data on refresh
- ⚠️ Tab 2 won't auto-update (would need WebWorker for real-time sync)
- ✅ All data is persisted

---

## Test 7: Offline Mode 🛫

**Objective**: Verify app works offline

### Steps:
1. Create a prompt while online: "Offline Test"
2. Go offline (DevTools → Network → Offline)
3. Refresh the page
4. Try to add a new prompt

### Expected Results:
- ✅ Page loads (works offline)
- ✅ Can see previously saved prompts
- ✅ Can add/edit/delete (stored locally)
- ✅ Export button works
- ⚠️ Import may have issues with FileReader

---

## Test 8: Large Data Set 📊

**Objective**: Verify app handles many prompts

### Steps:
1. Use browser console to create 100 prompts:

```javascript
import { addPrompt } from './utils/storage.js';

async function createBulkPrompts() {
  for (let i = 0; i < 100; i++) {
    await addPrompt({
      title: `Prompt ${i + 1}`,
      content: `Content for prompt ${i + 1}. Lorem ipsum dolor sit amet.`,
      category: `Category ${Math.floor(i / 10)}`,
      tags: [`tag${i % 5}`, `bulk`]
    });
    if (i % 10 === 0) console.log(`Created ${i} prompts...`);
  }
  console.log('All 100 prompts created!');
}

createBulkPrompts();
```

### Expected Results:
- ✅ All 100 prompts created
- ✅ App remains responsive
- ✅ Sidebar search still works smoothly
- ✅ Storage status shows all 100 in both layers

---

## Test 9: Error Recovery 🔧

**Objective**: Verify app recovers from storage errors

### Steps:
1. Create a prompt
2. In Console, manually corrupt localStorage:

```javascript
localStorage.setItem('prompts_backup', 'INVALID JSON {]]}');
```

3. Try to create a new prompt

### Expected Results:
- ✅ Console warns: `"Backup storage corrupted"`
- ✅ Can still create the new prompt (uses IndexedDB)
- ✅ New backup is written correctly

---

## Test 10: Storage Quota Check 📈

**Objective**: Understand storage limits

### Steps:
1. In Console, check available storage:

```javascript
if (navigator.storage) {
  navigator.storage.estimate().then(estimate => {
    console.log('Storage quota:', estimate.quota, 'bytes');
    console.log('Storage usage:', estimate.usage, 'bytes');
    console.log('Available:', estimate.quota - estimate.usage, 'bytes');
  });
}
```

### Expected Results:
- ✅ Usually 50MB+ available per site
- ✅ Much more than needed for prompts

---

## Troubleshooting Test Failures

### Problem: "IndexedDB open blocked"
**Solution**: Close other tabs with the app open

### Problem: Console shows "Failed to open IndexedDB"
**Solution**: Your site data may be corrupted
1. Clear all site data completely
2. Refresh the app

### Problem: Import doesn't work
**Solution**: Verify JSON format is valid
1. Open exported file in text editor
2. Check for proper array format
3. No trailing commas

### Problem: Can't delete database
**Solution**: Browser may not allow it. Try:
1. Close DevTools and reopen
2. Open different DevTools tab first
3. Use incognito window

---

## Console Logs Explained

### On App Load:
```
[OK] Created IndexedDB object store: prompts
     ↓ First time setup
```

### On Data Save:
```
[OK] Saved prompts to JSON backup storage
     ↓ Backup layer working
```

### On Read Fallback:
```
[WARN] IndexedDB unavailable, attempting to load from backup storage
       ↓ IndexedDB failed, using localStorage
[OK]  Loaded prompts from backup storage
       ↓ Recovery successful
```

### On Cache Clear:
```
[WARN] IndexedDB unavailable, attempting to load from backup storage
[WARN] No data available - returning empty array
       ↓ Both storages were cleared
```

---

## Checklist: Storage is Working ✅

- [ ] Can create, edit, delete prompts
- [ ] Prompt persists after refresh
- [ ] IndexedDB contains data (Application tab)
- [ ] localStorage has `prompts_backup` key
- [ ] Export creates valid JSON file
- [ ] Import restores all data
- [ ] App works when IndexedDB deleted
- [ ] App works offline
- [ ] Console shows "Saved to backup storage"
- [ ] Search works with all prompts

If all checks pass, your storage is working correctly! 🎉

---

## Summary

| Test | Purpose | What to Check |
|---|---|---|
| 1 | Create & Save | Data in both storages |
| 2 | IndexedDB | Data in Application tab |
| 3 | Fallback | Works without IndexedDB |
| 4 | Clear Data | Export/Import recovers data |
| 5 | Export/Import | Backup/restore works |
| 6 | Multi-tab | Data syncs across tabs |
| 7 | Offline | Works without internet |
| 8 | Large Data | 100+ prompts work fine |
| 9 | Error Recovery | Handles corruption gracefully |
| 10 | Quota | Plenty of storage available |

**Bottom Line**: Your data is safe as long as you export regularly! 📥
