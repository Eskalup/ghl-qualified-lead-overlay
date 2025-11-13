# Configuration Guide

This guide explains how to customize the GoHighLevel Qualified Lead Metrics script for your specific needs.

## Quick Configuration Checklist

Before deploying the script, verify these settings:

- [ ] Google Sheet ID is correct
- [ ] Google Sheet is published as CSV
- [ ] Account ID matches your GoHighLevel location
- [ ] Funnel ID matches your target funnel
- [ ] Column indices match your sheet structure
- [ ] Qualified indicator value is correct ("Si" by default)

## Configuration Options

### 1. Target Account and Funnel

Located at lines 17-18 in `ghl-qualified-lead-metrics.js`:

```javascript
const CONFIG = {
  ACCOUNT_ID: 'FKNp0s6MjnKx0dJcr7Ix',
  FUNNEL_ID: 'lzZnur5Cjl3ERFlFki6A',
  // ...
};
```

**How to find these values:**

1. Navigate to your funnel stats page in GoHighLevel
2. Look at the URL: `https://app.funnelup.io/v2/location/{ACCOUNT_ID}/funnels-websites/funnels/{FUNNEL_ID}/stats`
3. Copy the values from the URL

**Example:**
```
URL: https://app.funnelup.io/v2/location/ABC123/funnels-websites/funnels/XYZ789/stats
ACCOUNT_ID: 'ABC123'
FUNNEL_ID: 'XYZ789'
```

### 2. Google Sheets Settings

Located around line 22:

```javascript
PUBLISHED_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTi7bVNArCJ8e9ln-hROx2DPMTkvLD2GwQzN3zqv_KOducLGAXUvjc4X-a686C0SI874tKT2YVzLi-Q/pub?gid=0&single=true&output=csv',
```

**PUBLISHED_CSV_URL**: The full published CSV URL from Google Sheets

**How to get this URL:**
1. Open your Google Sheet
2. Go to **File** → **Share** → **Publish to web**
3. In the first dropdown, select your sheet
4. In the second dropdown, select **Comma-separated values (.csv)**
5. Click **Publish**
6. Copy the URL that appears (it will look like the example above)
7. Paste it into the `PUBLISHED_CSV_URL` field

**Note about GID:**
- The `gid=0` in the URL refers to the first sheet
- If you want a different sheet tab, change the GID in the published URL

### 3. Column Mapping

Located at lines 27-31:

```javascript
COLUMNS: {
  PATH: 7,        // Column H (0-indexed: 7)
  DATE: 9,        // Column J (0-indexed: 9)
  QUALIFIED: 10   // Column K (0-indexed: 10)
},
```

**Column Index Reference:**
| Letter | Index | Letter | Index | Letter | Index |
|--------|-------|--------|-------|--------|-------|
| A | 0 | I | 8 | Q | 16 |
| B | 1 | J | 9 | R | 17 |
| C | 2 | K | 10 | S | 18 |
| D | 3 | L | 11 | T | 19 |
| E | 4 | M | 12 | U | 20 |
| F | 5 | N | 13 | V | 21 |
| G | 6 | O | 14 | W | 22 |
| H | 7 | P | 15 | X | 23 |

**Example:** If your data is in columns C, E, and F:
```javascript
COLUMNS: {
  PATH: 2,        // Column C
  DATE: 4,        // Column E
  QUALIFIED: 5    // Column F
}
```

### 4. Performance Settings

Located at lines 34-35:

```javascript
UPDATE_DEBOUNCE_MS: 500,
CACHE_DURATION_MS: 60000,
```

**UPDATE_DEBOUNCE_MS**: Delay before updating after UI changes (milliseconds)
- Lower = More responsive but more CPU usage
- Higher = Less responsive but better performance
- Recommended: 300-1000ms

**CACHE_DURATION_MS**: How long to cache Google Sheet data (milliseconds)
- Lower = More up-to-date data but more API calls
- Higher = Better performance but potentially stale data
- Recommended: 30000-120000ms (30 seconds - 2 minutes)

## Google Sheet Structure

### Required Columns

Your Google Sheet must have these three columns (can be in any position):

1. **Path Column** (H by default)
   - Values: "A" or "B" (case-insensitive)
   - Example: `A`, `B`, `a`, `b`

2. **Date Column** (J by default)
   - Supported formats:
     - `Nov 13th 2025, 9:00 am` (with ordinal suffixes like st, nd, rd, th)
     - `MM/DD/YYYY` (e.g., 01/15/2025)
     - `YYYY-MM-DD` (e.g., 2025-01-15)
     - `DD/MM/YYYY` (e.g., 15/01/2025)
   - Must be a valid date
   - The script automatically removes ordinal suffixes (st, nd, rd, th) before parsing

3. **Qualified Column** (K by default)
   - Default value for qualified: "Si"
   - Can be customized (see below)
   - Case-insensitive

### Example Sheet Structure

| A | B | C | ... | H (Path) | I | J (Date) | K (Qualified) |
|---|---|---|-----|----------|---|----------|---------------|
| Name | Email | Phone | ... | A | ... | 01/15/2025 | Si |
| John | john@... | ... | ... | B | ... | 01/16/2025 | No |
| Jane | jane@... | ... | ... | A | ... | 01/17/2025 | Si |

## Advanced Customization

### Changing the "Qualified" Indicator

If you use a different value for qualified leads (not "Si"), modify line 273:

**Current:**
```javascript
if (qualified === 'si') {
  metrics.pathA.count++;
}
```

**Change to:**
```javascript
if (qualified === 'yes') {  // or 'qualified', 'true', etc.
  metrics.pathA.count++;
}
```

Also update line 282 for Path B.

### Supporting Multiple Path Values

If you have more than two paths (A and B), you'll need to:

1. Modify the `calculateQualifiedMetrics` function
2. Add additional metrics objects
3. Update the DOM manipulation to handle more rows

Example for three paths:
```javascript
const metrics = {
  pathA: { count: 0, total: 0 },
  pathB: { count: 0, total: 0 },
  pathC: { count: 0, total: 0 }  // Add new path
};

// Add another condition
else if (path === 'C') {
  metrics.pathC.total++;
  if (qualified === 'si') {
    metrics.pathC.count++;
  }
}
```

### Customizing Visual Indicators

To change the background color of updated cells (line 338):

```javascript
// Current: Light green
optinCell.style.backgroundColor = '#f0fdf4';

// Options:
optinCell.style.backgroundColor = '#e0f2fe'; // Light blue
optinCell.style.backgroundColor = '#fef3c7'; // Light yellow
optinCell.style.backgroundColor = '#fce7f3'; // Light pink
```

### Date Format Handling

The script uses JavaScript's `Date()` constructor which handles most common formats. If you have a special date format, modify the `parseSheetDate` function (around line 169):

```javascript
function parseSheetDate(dateStr) {
  if (!dateStr) return null;

  try {
    // Custom parsing for DD/MM/YYYY
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateStr.split('/');
      return new Date(year, month - 1, day);
    }

    // Default parsing
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch (error) {
    return null;
  }
}
```

## Testing Your Configuration

### Step 1: Test URL Detection

Add this temporary code at the top of the script (inside the IIFE):
```javascript
console.log('Current URL:', window.location.href);
console.log('Should run?', shouldRunScript());
```

Open the page and check the console. You should see:
```
Current URL: https://app.funnelup.io/v2/location/FKNp0s6MjnKx0dJcr7Ix/...
Should run? true
```

### Step 2: Test Google Sheet Access

Open this URL in your browser (use your actual published URL):
```
https://docs.google.com/spreadsheets/d/e/2PACX-1vTi7bVNArCJ8e9ln-hROx2DPMTkvLD2GwQzN3zqv_KOducLGAXUvjc4X-a686C0SI874tKT2YVzLi-Q/pub?gid=0&single=true&output=csv
```

You should see CSV data. If you get an error, the sheet isn't published correctly.

### Step 3: Test Data Parsing

Add this temporary code in the `updateMetrics` function:
```javascript
const data = await fetchGoogleSheetData();
console.log('First row:', data[0]);
console.log('Path column:', data[0][CONFIG.COLUMNS.PATH]);
console.log('Date column:', data[0][CONFIG.COLUMNS.DATE]);
console.log('Qualified column:', data[0][CONFIG.COLUMNS.QUALIFIED]);
```

Check that the correct values are being read.

### Step 4: Test Locally

1. Download `test.html` and `ghl-qualified-lead-metrics.js` to the same folder
2. Open `test.html` in your browser
3. Check the console for errors
4. Try updating the date range and clicking "Update Metrics"

## Common Configuration Issues

### Issue: Script not running

**Check:**
- Is the URL correct? (Account ID and Funnel ID match)
- Is the script in the Custom Code section?
- Any console errors?

**Solution:**
```javascript
// Add logging to shouldRunScript()
function shouldRunScript() {
  const url = window.location.href;
  console.log('Checking URL:', url);
  console.log('Account ID match:', url.includes(CONFIG.ACCOUNT_ID));
  console.log('Funnel ID match:', url.includes(`funnels/${CONFIG.FUNNEL_ID}/stats`));
  // ...
}
```

### Issue: No data fetched

**Check:**
- Is the Google Sheet published as CSV?
- Is the Sheet ID correct?
- Is the GID correct?
- Any CORS errors in console?

**Solution:**
Test the CSV URL directly in browser:
```
https://docs.google.com/spreadsheets/d/e/2PACX-1vTi7bVNArCJ8e9ln-hROx2DPMTkvLD2GwQzN3zqv_KOducLGAXUvjc4X-a686C0SI874tKT2YVzLi-Q/pub?gid=0&single=true&output=csv
```

### Issue: Wrong data displayed

**Check:**
- Are the column indices correct?
- Are the path values correct ("A" or "B")?
- Is the qualified indicator correct ("Si")?
- Are the dates in a supported format?

**Solution:**
Add logging to `calculateQualifiedMetrics`:
```javascript
data.forEach(row => {
  console.log('Row:', {
    path: row[CONFIG.COLUMNS.PATH],
    date: row[CONFIG.COLUMNS.DATE],
    qualified: row[CONFIG.COLUMNS.QUALIFIED]
  });
  // ...
});
```

### Issue: Metrics not updating

**Check:**
- Is the table structure different than expected?
- Are the CSS selectors finding the correct elements?

**Solution:**
Inspect the table structure and verify selectors:
```javascript
console.log('Table rows:', document.querySelectorAll('.n-data-table-tr'));
console.log('Optin cells:', document.querySelectorAll('td[data-col-key="optinsAll"]'));
```

## Security Considerations

### Google Sheet Privacy

**Important:** Publishing your Google Sheet as CSV makes it publicly readable. Do not include sensitive information like:
- Email addresses
- Phone numbers
- Personal identification numbers
- Financial information

Only include data necessary for metrics:
- Path identifier
- Opt-in date
- Qualified status

### Script Injection Safety

The script:
- ✅ Only runs on specific URLs
- ✅ Only reads from Google Sheets
- ✅ Only modifies specific DOM elements
- ✅ Does not send data to external servers
- ✅ Does not collect user information

### Best Practices

1. **Test in staging first** if you have a staging environment
2. **Keep backups** of your configuration
3. **Monitor console logs** for errors after deployment
4. **Update carefully** when changing configuration
5. **Document changes** if you customize the script

## Support

If you need help with configuration:

1. Check the README.md for general setup
2. Review this guide for specific settings
3. Use test.html to debug locally
4. Check browser console for error messages
5. Verify Google Sheet structure and publication settings
