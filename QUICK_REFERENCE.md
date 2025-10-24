# Quick Reference: Storage & Cache Clearing

## The Short Answer

**Q: My prompts disappeared after clearing cache!**

**A**: This is normal. Both IndexedDB and localStorage are deleted together. Here's the fix:

1. **BEFORE clearing cache**: Click **"📥 Export"** → saves JSON file
2. **AFTER clearing cache**: Click **"📤 Import"** → restore from file
3. Your data is back! ✅

---

## What Gets Cleared?

When you clear "Site data" or "Cookies":
- ❌ IndexedDB (your main storage)
- ❌ localStorage (your backup storage)
- ❌ Cookies
- ✅ App code (not affected)

**Result**: Data lost, but app still works.

---

## How to Protect Your Data

### Option 1: Export Regularly 📥 (Recommended)

```
Every week:
1. Click "📥 Export" button
2. Save the JSON file
3. You're protected!

If cache cleared:
1. Click "📤 Import" button
2. Select your saved JSON file
3. Data restored ✅
```

### Option 2: Cloud Sync

Export to:
- Google Drive
- Dropbox
- OneDrive
- GitHub

Then sync from cloud if needed.

### Option 3: Multiple Backups

Keep multiple exports:
```
Downloads/
├── prompts-backup-2025-10-01.json
├── prompts-backup-2025-10-08.json
├── prompts-backup-2025-10-15.json
└── prompts-backup-2025-10-22.json
```

---

## Storage Locations

### IndexedDB
- **Stored in**: Browser's IndexedDB database
- **Cleared when**: "Clear site data" or "Delete database"
- **Size limit**: 50MB+
- **Where to view**: DevTools → Application → IndexedDB

### localStorage (Backup)
- **Stored in**: Browser's localStorage
- **Cleared when**: "Clear site data" or "Clear cookies"
- **Size limit**: 5-10MB
- **Where to view**: DevTools → Application → localStorage
- **Key name**: `prompts_backup`
- **Format**: JSON string (human-readable)

### Exported File
- **Stored in**: Your computer's disk
- **Cleared when**: You manually delete it
- **Size**: ~1-2KB per 10 prompts
- **Where to find**: Downloads folder
- **Format**: JSON (valid JavaScript array)

---

## Step-by-Step Protection

### 1. Creating a Backup (2 minutes)

```
1. Open Prompt Manager
2. Click "📥 Export" button
3. File "prompts-backup-YYYY-MM-DD.json" downloads
4. Keep this file safe
```

### 2. After Cache Clear (1 minute)

```
1. Open Prompt Manager (empty)
2. Click "📤 Import" button
3. Select your backup file
4. Click "Open"
5. Your prompts reappear! ✅
```

### 3. Verify It Works

```
After importing, you should see:
- All your prompts in sidebar
- All search/filter still work
- All data intact
```

---

## Troubleshooting

### Q: I cleared cache and lost data. Can I recover it?

**A**: If you exported before:
1. Click "📤 Import"
2. Select your backup file
3. Data restored ✅

If you didn't export:
- **Sorry**: Data is gone
- **Going forward**: Use export feature weekly

### Q: What if my backup file is corrupted?

**A**:
```
1. Check file in text editor
2. Should look like:
   [
     { "id": "...", "title": "...", ... },
     { "id": "...", "title": "...", ... }
   ]
3. If it looks valid, try importing anyway
4. If still broken, you may have lost data
```

### Q: Can I edit the backup file?

**A**: Yes! It's valid JSON:
```json
[
  {
    "id": "1234567890",
    "createdAt": "2025-10-24T06:00:00Z",
    "title": "My Prompt",
    "content": "Prompt text",
    "category": "Category",
    "tags": ["tag1", "tag2"]
  }
]
```

Edit carefully and maintain JSON format.

### Q: Why did my data disappear?

Most likely causes:
1. ❌ Cleared "site data" without exporting first
2. ❌ Intentional cache clear in browser
3. ⚠️ Browser crash/corruption (rare)
4. ⚠️ Out of storage quota (very rare)

**Prevention**: Export weekly! 📥

---

## Browser-Specific Instructions

### Chrome
```
Settings → Privacy and Security → Clear browsing data
☑ Cookies and other site data
☑ Cached images and files
Click "Clear data"

⚠️ Both storages deleted! Export first!
```

### Firefox
```
Settings → Privacy & Security → Cookies and Site Data
Click "Clear Data"

⚠️ Both storages deleted! Export first!
```

### Safari
```
Preferences → Privacy
Click "Manage Website Data..."
Select site → Click "Remove"

⚠️ Both storages deleted! Export first!
```

---

## Export/Import Tips

### Naming Your Exports
```
✅ Good:
   prompts-backup-work-2025-10-24.json
   prompts-backup-personal-2025-10-24.json

❌ Bad:
   backup.json (which version?)
   data.json (unclear)
```

### Organizing Backups
```
Create a folder:
Downloads/
└── Prompt Manager Backups/
    ├── 2025-10/
    │   ├── prompts-backup-2025-10-01.json
    │   ├── prompts-backup-2025-10-08.json
    │   └── prompts-backup-2025-10-15.json
    └── 2025-11/
        └── ...
```

### Cloud Backup
```
Export → Upload to:
- Google Drive
- Dropbox
- OneDrive
- GitHub (private repo)

Accessible from any computer! ✅
```

---

## Storage Status Check

### In Browser Console:
```javascript
import { getStorageStatus } from './utils/storage.js';
getStorageStatus().then(s => console.table(s));
```

### Output means:
```
indexedDBAvailable: true   → IndexedDB working
backupStorageAvailable: true → Backup working
promptsInIndexedDB: 5      → 5 prompts in IndexedDB
promptsInBackup: 5         → 5 prompts in backup
error: null                → No errors
```

### What to worry about:
```
Both "Available" false   → Data not being saved!
Counts don't match       → Sync issue (usually OK)
error: not null          → Something failed (check logs)
```

---

## Timeline: When Data Is Lost

| Event | IndexedDB | localStorage | Your Data |
|-------|---|---|---|
| App running | ✅ | ✅ | Safe ✅ |
| Browser crash | ✅ | ✅ | Safe ✅ |
| Close browser | ✅ | ✅ | Safe ✅ |
| Browser restart | ✅ | ✅ | Safe ✅ |
| Clear cache only | ✅ | ✅ | Safe ✅ |
| Clear cookies | ✅ | ❌ | Risky ⚠️ |
| Clear site data | ❌ | ❌ | **LOST** 🚨 |
| Manual export | ✅ | ✅ | Safe on disk ✅ |

**Takeaway**: Clear "site data" deletes both. Export weekly! 📥

---

## Panic Situations & Solutions

### Situation 1: "I cleared everything and lost my data!"

```
✅ Solution exists:
   1. Check Downloads folder for any .json files
   2. Check cloud storage (Google Drive, etc)
   3. Check email/Slack if you sent backups
   4. Check other computers (browser sync)

If you find a backup:
   1. Open Prompt Manager
   2. Click "📤 Import"
   3. Select file
   4. Data restored! ✅
```

### Situation 2: "The app looks broken/empty"

```
Likely causes:
1. IndexedDB issue
2. localStorage issue
3. Both are actually OK but you think there's no data

Quick fix:
1. Open DevTools console
2. Run: import { getStorageStatus } from './utils/storage.js';
3. getStorageStatus().then(s => console.table(s))
4. Check if prompts are actually there

If data exists but not showing:
   - Refresh page
   - Clear browser cache (just code, not data!)
   - Restart browser
```

### Situation 3: "Import doesn't work"

```
Checklist:
1. ☑ File is .json format
2. ☑ File is from "Export" button (valid format)
3. ☑ File hasn't been edited (valid JSON)
4. ☑ File isn't corrupted (can open in text editor)
5. ☑ Browser console shows no errors

If still fails:
   - Try in different browser
   - Try in incognito/private mode
   - File may be corrupted, use older backup
```

---

## Best Practices

### Daily
```
Use the app normally
Data is saved automatically to:
- IndexedDB (fast, main storage)
- localStorage (backup)
```

### Weekly
```
Click "📥 Export"
Download the backup file
Takes 30 seconds!
```

### Before clearing cache
```
Always export first!
Prevents data loss
Import after clear
```

### Organizational
```
Keep exports organized by date
Keep multiple backups (rolling 3-month)
Label backups by category
```

---

## Key Takeaways

1. ✅ **Your data is automatically saved** to two places
2. ⚠️ **Both can be cleared by "Clear site data"**
3. ✅ **Export/Import is your safety net**
4. 📥 **Export weekly** (takes 30 seconds)
5. 💾 **Keep backups on your disk** (safe from browser)

---

## Emergency Recovery

If you lose data:

1. **Check for backups**: Downloads, Cloud, Email, Other computers
2. **Check browser history**: Might find downloaded files
3. **Check browser recovery**: Some browsers cache downloads
4. **Contact**: If shared with others, ask for their backup

**Most importantly**: Start exporting regularly now! 📥

---

**Remember**: The app itself is safe and never deletes. It's just the browser's site data that's the issue. Export your prompts regularly and you're 100% protected! ✅
