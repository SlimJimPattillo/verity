# XLSX Upload Testing Instructions

**Date:** December 13, 2025
**Feature:** XLSX/Excel file upload bug fixes
**Status:** Ready for testing

---

## 🐛 Bugs Fixed

### 1. **Case-Sensitive File Extension Bug** ✅
- **Problem**: Files named "Data.XLSX" or "report.XLS" (uppercase extensions) were rejected
- **Fix**: File extension check now case-insensitive
- **Impact**: All .xlsx, .XLSX, .xls, .XLS files now accepted

### 2. **Enhanced Error Logging** ✅
- Added comprehensive console logging throughout XLSX parsing
- Better error messages for debugging
- File reading error handlers added

---

## 🧪 How to Test

### Step 1: Start Development Server
```bash
cd verity
npm run dev
```

### Step 2: Open Browser Developer Console
1. Open the app in your browser (usually http://localhost:5173)
2. Press **F12** to open developer tools
3. Click the **Console** tab
4. Keep this open during testing to see debug logs

### Step 3: Navigate to Asset Vault
1. Log in to Verity
2. Click **Asset Vault** in the sidebar

### Step 4: Test XLSX Upload
1. Click **"Import Data"** button
2. Try uploading an Excel file (.xlsx or .xls)
3. **Watch the browser console** for debug output

---

## 📋 Test Cases

### ✅ Test Case 1: Valid XLSX File
**File**: Any .xlsx file with columns: label, value, unit, type
**Expected**:
- Console shows: "Parsing XLSX file: [filename]"
- Console shows: "Workbook parsed. Sheets found: [sheet names]"
- Console shows: "Rows extracted from Excel: [number]"
- Preview screen appears with parsed data
- Import button enabled

### ✅ Test Case 2: Uppercase Extension (.XLSX)
**File**: Rename a file to have uppercase extension (e.g., "Data.XLSX")
**Expected**:
- File is accepted (no error about file type)
- Parsing proceeds normally

### ✅ Test Case 3: Legacy Excel (.xls)
**File**: Any .xls file (older Excel format)
**Expected**:
- File is accepted
- Parsing works same as .xlsx

### ✅ Test Case 4: Empty Excel File
**File**: Excel file with no data rows
**Expected**:
- Console shows: "Rows extracted from Excel: 0"
- Toast error: "Excel file is empty or has no data rows"

### ✅ Test Case 5: Missing Required Columns
**File**: Excel file without "label" or "value" columns
**Expected**:
- Toast error: "File must have 'label' and 'value' columns"

### ✅ Test Case 6: Mixed Valid/Invalid Rows
**File**: Excel file with some rows missing required data
**Expected**:
- Preview shows all rows
- Valid rows have green checkmark
- Invalid rows highlighted in red
- Summary shows count of valid vs invalid

---

## 🔍 What to Look For in Console

You should see logs like this when uploading:

```
Parsing XLSX file: metrics.xlsx Size: 12456 bytes
Starting XLSX parse, buffer size: 12456
Workbook parsed. Sheets found: ["Sheet1"]
Using sheet: Sheet1
Rows extracted from Excel: 5
First row columns: ["Label", "Value", "Unit", "Type"]
Normalized first row columns: ["label", "value", "unit", "type"]
Parsed rows: 5
```

---

## ❌ If Errors Occur

### Error: "Failed to read file content"
- **Cause**: File reading failed
- **Check**: Browser console for detailed error message
- **Fix**: Try a different file or check file permissions

### Error: "Excel file has no worksheets"
- **Cause**: Corrupted or invalid Excel file
- **Check**: Open the file in Excel to verify it's valid
- **Fix**: Re-save the file from Excel

### Error: "Error parsing Excel file: [message]"
- **Cause**: Invalid Excel format or corrupted data
- **Check**: Browser console for stack trace
- **Share**: Full error message and console output for debugging

### Error: "File must have 'label' and 'value' columns"
- **Cause**: Missing required columns
- **Fix**: Add columns named "label" and "value" to your Excel file

---

## 📝 Sample Excel File Structure

Your Excel file should have these columns in the first row:

| label | value | unit | type | comparison | previousValue |
|-------|-------|------|------|------------|---------------|
| Meals Served | 5000 | # | output | +19% vs last year | 4200 |
| Hunger Reduction | 15 | % | outcome | across service area | 8 |
| Families Assisted | 1250 | People | output | | |

**Required columns**: label, value
**Optional columns**: unit, type, comparison, previousValue

---

## ✅ Success Criteria

The XLSX upload is working correctly if:

1. ✅ Files with uppercase extensions (.XLSX, .XLS) are accepted
2. ✅ Console shows detailed parsing logs
3. ✅ Preview screen displays parsed data correctly
4. ✅ Valid rows can be imported successfully
5. ✅ Invalid rows are properly identified and skipped
6. ✅ Error messages are clear and helpful

---

## 🐛 Reporting Issues

If you encounter any problems, please provide:

1. **Screenshot of error message** (if any)
2. **Browser console output** (copy/paste the logs)
3. **Sample Excel file** (that caused the issue)
4. **Steps to reproduce**

Copy the console output like this:
1. Right-click in the Console tab
2. Select "Save as..."
3. Or copy/paste the relevant error messages

---

## 🎯 Next Steps After Testing

### If tests PASS ✅
- Mark feature as production-ready
- Update documentation
- Consider deploying to production

### If tests FAIL ❌
- Share console output and error details
- I'll investigate and fix any remaining issues
- Re-test after fixes applied

---

**Ready to test!** Follow the steps above and let me know the results.
