# Prompt Manager - Storage & Caching Guide

Welcome! This document explains how your Prompt Manager handles data persistence and what to do if you clear your browser cache.

## Quick Answer

**Your prompts are saved automatically.**

When you clear browser cache:
- ✅ Your app code still works
- ❌ Your prompts disappear (if you didn't export)
- ✅ You can restore them by importing your backup

**Solution**: Export your prompts every week. Takes 30 seconds.

---

## How It Works

### Automatic Saving

Every time you create, edit, or delete a prompt:

```
Your Action
    ↓
Saved to IndexedDB (fast database)
    ↓
Saved to localStorage (JSON backup)
    ↓
"Saved" confirmation
```

**Result**: Data is in TWO places automatically.

### Data Locations

1. **IndexedDB** (Primary storage)
   - Where: Browser's database
   - Size: 50MB+ available
   - Speed: Very fast
   - Survives: Browser restart, crashes
   - Deleted by: "Clear site data" option

2. **localStorage** (Backup storage)
   - Where: Browser's text storage
   - Key: `prompts_backup`
   - Size: 5-10MB
   - Format: JSON (readable)
   - Deleted by: "Clear site data" option

3. **Exported File** (Your backup)
   - Where: Your Downloads folder
   - Size: ~1-2KB per 10 prompts
   - Format: JSON file
   - Survives: Browser clears, computer restarts, etc.
   - Deleted by: You manually (don't do this!)

### Why Two Storage Layers?

**Redundancy**: If one fails, you have a backup
```
IndexedDB working + localStorage working = Super safe ✅
IndexedDB corrupted + localStorage OK = Still safe ✅
IndexedDB corrupted + localStorage corrupted = Problem ❌
                    (Use exported backup!)
```

---

## Clearing Cache: What Happens

### Clear Cache Only
```
What clears: Temporary files
What survives: IndexedDB ✅ + localStorage ✅
Your data: SAFE ✅
```

### Clear Cookies
```
What clears: Cookies, sometimes localStorage
What survives: IndexedDB ✅
Your data: SAFE ✅
```

### Clear Site Data (Most Common)
```
What clears: IndexedDB ❌ + localStorage ❌ + cookies ❌
What survives: App code ✅
Your data: LOST 🚨 (Unless you have backup!)
```

**The Reality**: When you click "Clear browsing data", both storages get deleted together. This is a browser security design.

---

## Protection: Export & Import

### Exporting (Backup)

```
1. Open Prompt Manager
2. Click "📥 Export" button
3. File downloads: prompts-backup-2025-10-24.json
4. Keep this file safe
```

**Time**: 30 seconds
**Result**: Your data is now safe on your disk

### Importing (Recovery)

```
1. After clearing cache
2. Click "📤 Import" button
3. Select your backup file
4. Click "Open"
5. Your data is restored! ✅
```

**Time**: 30 seconds
**Result**: All your prompts are back

---

## Step-by-Step Workflow

### To Protect Your Data

**Weekly (Sunday nights?)**:
```
1. Open Prompt Manager
2. Click "📥 Export"
3. File appears in Downloads
4. Done! ✅ (File is safe on your disk)
```

### Before Clearing Cache

```
1. Click "📥 Export" (backup just in case)
2. Clear your cache normally
3. Open Prompt Manager (empty)
4. Click "📤 Import"
5. Select your backup
6. Data restored ✅
```

### Organizing Your Backups

```
Create a folder: Downloads/Prompt Manager Backups/

Keep exports by date:
├── 2025-10-01.json
├── 2025-10-08.json
├── 2025-10-15.json
└── 2025-10-22.json

Or by category:
├── work-prompts-2025-10-24.json
├── personal-prompts-2025-10-24.json
└── learning-prompts-2025-10-24.json
```

---

## Technical Details

### IndexedDB Database
- **Name**: `PromptManagerDB`
- **Storage**: Binary format
- **View in**: DevTools → Application → IndexedDB
- **Limit**: 50MB+ (can be extended)
- **Lost when**: Clear "site data"

### localStorage Backup
- **Key name**: `prompts_backup`
- **Storage**: JSON text format (readable)
- **View in**: DevTools → Application → localStorage
- **Limit**: 5-10MB
- **Lost when**: Clear "site data"

### Exported JSON Format
```json
[
  {
    "id": "1234567890",
    "createdAt": "2025-10-24T12:00:00.000Z",
    "title": "Example Prompt",
    "content": "The full prompt text goes here...",
    "category": "Learning",
    "tags": ["important", "example"]
  }
]
```

---

## Storage Status Check

### Check in Console

Open DevTools (F12) and run:

```javascript
import { getStorageStatus } from './utils/storage.js';
getStorageStatus().then(s => console.table(s));
```

Shows:
```
indexedDBAvailable: true/false
backupStorageAvailable: true/false
promptsInIndexedDB: 5
promptsInBackup: 5
error: null
```

### What It Means

| Status | Meaning |
|--------|---------|
| Both true | Perfect, maximum redundancy ✅ |
| IndexedDB true, backup false | IndexedDB working, but no backup ⚠️ |
| IndexedDB false, backup true | Fallback mode, slower but safe ⚠️ |
| Both false | Data not being saved! 🚨 |
| Counts different | Sync issue (usually OK) |

---

## FAQ

**Q: My data disappeared. Can I recover it?**
A: Yes! If you exported:
1. Click "📤 Import"
2. Select your backup file
3. Data restored ✅

If you didn't export, sorry - it's gone. Export weekly going forward!

**Q: Will clearing cache delete my app?**
A: No. The app code isn't affected. Only your saved data is deleted.

**Q: Can I edit the backup file?**
A: Yes, it's valid JSON. Be careful with formatting.

**Q: How often should I export?**
A: Weekly is safest. More if you add lots of prompts.

**Q: What if I lose my backup file?**
A: Your data is still in IndexedDB until you clear site data. Export another copy!

**Q: Can I use the same backup to import multiple times?**
A: Yes, it will merge with existing data.

**Q: What happens if backup file is corrupted?**
A: Import will fail. Use an older backup or manually restore.

**Q: How much can I store?**
A: 10,000+ typical prompts fit easily.

---

## Troubleshooting

### Problem: "Export button doesn't download anything"

**Solution**:
1. Check if downloads are blocked: DevTools → Settings → Check Downloads
2. Check your Downloads folder
3. Check if browser is in restricted mode
4. Try different browser

### Problem: "Import shows 'invalid format'"

**Solution**:
1. Make sure file is .json (not .txt)
2. File must be from Export button
3. Check file isn't corrupted (open in text editor)
4. File must be valid JSON array

### Problem: "My prompts are still gone after import"

**Solution**:
1. Refresh the page after import
2. Check sidebar if they appear there
3. Check storage status in console
4. Try importing in different browser

### Problem: "Console shows IndexedDB errors"

**Solution**:
1. This is normal if IndexedDB was deleted
2. App falls back to localStorage automatically
3. No action needed
4. Check storage status to confirm it's working

---

## Browser-Specific

### Google Chrome
```
Settings → Privacy and security → Clear browsing data
Choose: "All time" for dates
Check: "Cookies and other site data"
Check: "Cached images and files"
Click: "Clear data"

⚠️ Both storages deleted! Export first!
```

### Firefox
```
Settings → Privacy & Security
Cookies and Site Data → Clear Data
Check: "Cookies and Site Data"
Check: "Cached Web Content"
Click: "Clear"

⚠️ Both storages deleted! Export first!
```

### Safari
```
Safari → Preferences → Privacy
Manage Website Data → Select site
Click: "Remove"

⚠️ Both storages deleted! Export first!
```

### Edge
```
Settings → Privacy, search, and services
Clear browsing data → Choose time range
Check: "Cookies and other site data"
Check: "Cached images and files"
Click: "Clear now"

⚠️ Both storages deleted! Export first!
```

---

## Best Practices

✅ **DO:**
- Export weekly
- Keep multiple backups
- Label backups by date
- Store backups in organized folder
- Sync backups to cloud
- Check storage status monthly
- Read console logs for warnings

❌ **DON'T:**
- Clear cache without exporting first
- Delete backup files
- Edit backup without understanding JSON
- Keep only one backup
- Forget to import after clearing cache
- Store sensitive passwords in prompts

---

## Cloud Backup Ideas

Since exported files are just JSON, you can:

### Google Drive
1. Export prompts
2. Upload to Google Drive
3. Access from any device

### Dropbox
1. Export prompts
2. Drop into Dropbox folder
3. Auto-synced everywhere

### GitHub
1. Create private repo
2. Upload backup files
3. Version controlled backups

### Email
1. Export prompts
2. Email to yourself
3. Always have a copy

### Cloud Storage
- OneDrive
- iCloud Drive
- AWS S3
- Any cloud service

---

## Emergency Recovery Checklist

If you lose your data:

- [ ] Check Downloads folder
- [ ] Check Cloud storage (Google Drive, Dropbox, etc)
- [ ] Check Email (sent backups to yourself?)
- [ ] Check other computers (browser sync)
- [ ] Check browser backup tools
- [ ] Ask others (if shared)
- [ ] Check offline backups (USB drives, etc)

If you find a backup:
1. Open Prompt Manager
2. Click "📤 Import"
3. Select file
4. Done! ✅

If you don't find a backup:
- Data is lost (this time)
- Start exporting weekly going forward!

---

## Key Takeaways

1. ✅ **Automatic dual-layer saving**: IndexedDB + localStorage
2. ⚠️ **Both deleted together**: When you clear "site data"
3. ✅ **Export/Import is your safety net**: 30 seconds per week
4. 📥 **Export regularly**: Weekly is recommended
5. 💾 **Keep backups on disk**: Safe from browser clears
6. 🔄 **Multiple backups**: Keep rolling 3-month backup
7. 📋 **Organize backups**: By date or category

---

## Need Help?

### Check Documentation:
- `STORAGE_DOCUMENTATION.md` - Technical architecture
- `TESTING_GUIDE.md` - Verify storage works
- `AUDIT_REPORT.md` - Detailed analysis
- `QUICK_REFERENCE.md` - Fast answers

### Check Console:
```javascript
import { getStorageStatus } from './utils/storage.js';
getStorageStatus().then(s => console.table(s));
```

### Verify App Health:
- Look for warning logs in console
- Check DevTools → Application → IndexedDB
- Check DevTools → Application → localStorage

---

## Summary

Your Prompt Manager uses industrial-grade storage with automatic redundancy and complete export/import backup capability.

**The one rule**: Export your prompts every week.

**That's it!** 🎉 Everything else is automatic.

---

**Last Updated**: October 24, 2025
**Version**: 1.0 with Robust Dual-Layer Storage
**Status**: Production Ready ✅
