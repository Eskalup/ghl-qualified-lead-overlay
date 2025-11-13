# GoHighLevel Qualified Lead Metrics Overlay

This JavaScript code replaces the opt-in metrics in your GoHighLevel funnel stats page with qualified lead data from a Google Sheet.

## Features

- **Targeted Loading**: Only runs on the specific account and funnel page to minimize performance impact
- **Real-time Updates**: Automatically updates when the date range changes
- **Cached Data**: Fetches Google Sheet data every 60 seconds to reduce API calls
- **Visual Indicators**: Highlights updated metrics with a light green background
- **Performance Optimized**: Early exit mechanism ensures zero impact on other pages

## Setup Instructions

### 1. Prepare Your Google Sheet

Your Google Sheet needs to be published as CSV for the script to access it:

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1WPiVyEpsiUX3wqyE_XAkxj_5GfzOd3PvKq6ReEldAu4/edit
2. Click **File** → **Share** → **Publish to web**
3. In the dropdown, select:
   - **Sheet**: Select the specific sheet (or "Sheet1" if it's the first sheet)
   - **Format**: Select "Comma-separated values (.csv)"
4. Click **Publish**
5. Copy the published URL (you won't need it, the script uses the Sheet ID)

**Important**: Make sure your Google Sheet has the following columns:
- **Column H (index 7)**: Path (values should be "A" or "B")
- **Column J (index 9)**: Opt-in date (format: MM/DD/YYYY or YYYY-MM-DD)
- **Column K (index 10)**: Qualified status (value should be "Si" for qualified leads)

### 2. Install the Script in GoHighLevel

1. Log in to your GoHighLevel account
2. Navigate to **Agency Settings** → **Custom Code**
3. Copy the entire contents of `ghl-qualified-lead-metrics.js`
4. Paste it into the **Custom Code** section
5. Save the settings

### 3. Verify Installation

1. Navigate to the funnel stats page:
   https://app.funnelup.io/v2/location/FKNp0s6MjnKx0dJcr7Ix/funnels-websites/funnels/lzZnur5Cjl3ERFlFki6A/stats

2. Open your browser's Developer Console (F12 or Right-click → Inspect → Console)

3. You should see log messages like:
   ```
   [Qualified Lead Metrics] Script loaded on target page
   [Qualified Lead Metrics] Initializing...
   [Qualified Lead Metrics] Fetching data from Google Sheets...
   [Qualified Lead Metrics] Fetched X rows
   [Qualified Lead Metrics] Calculated metrics: {...}
   [Qualified Lead Metrics] Metrics updated successfully
   ```

4. The opt-in metrics in the table should now show:
   - Updated counts (only qualified leads)
   - Updated percentages
   - Light green background on the opt-in cells

## How It Works

### Performance Optimization

The script has a multi-layer performance optimization strategy:

1. **Early Exit**: The script immediately exits if not on the target page
   ```javascript
   if (!url.includes('FKNp0s6MjnKx0dJcr7Ix')) return;
   if (!url.includes('funnels/lzZnur5Cjl3ERFlFki6A/stats')) return;
   ```

2. **Caching**: Google Sheet data is cached for 60 seconds to minimize API calls

3. **Debouncing**: UI updates are debounced by 500ms to prevent excessive calculations

### Data Processing

1. **Fetches** Google Sheet data as CSV
2. **Parses** the date range from the UI date picker
3. **Filters** data for:
   - Dates within the selected range
   - Only qualified leads (Column K = "Si")
   - Separated by Path A and Path B (Column H)
4. **Calculates** opt-in counts and rates
5. **Updates** the DOM with new metrics

### Automatic Updates

The script uses a MutationObserver to watch for:
- Changes to the data table
- Changes to the date picker
- Page navigation (stops running if you leave the target page)

## Customization

### Changing Target Account/Funnel

Edit the configuration at the top of the script:

```javascript
const CONFIG = {
  ACCOUNT_ID: 'FKNp0s6MjnKx0dJcr7Ix',  // Change this
  FUNNEL_ID: 'lzZnur5Cjl3ERFlFki6A',   // Change this
  // ...
};
```

### Changing Google Sheet Columns

If your Google Sheet uses different columns:

```javascript
COLUMNS: {
  PATH: 7,        // Column H (0-indexed)
  DATE: 9,        // Column J (0-indexed)
  QUALIFIED: 10   // Column K (0-indexed)
}
```

### Changing Qualified Indicator

If you use a different value for qualified leads (not "Si"):

Find this line in the script:
```javascript
if (qualified === 'si') {
```

Change to:
```javascript
if (qualified === 'yes') {  // or whatever value you use
```

### Adjusting Cache Duration

To change how often the Google Sheet is fetched:

```javascript
CACHE_DURATION_MS: 60000, // 1 minute (in milliseconds)
```

## Troubleshooting

### Metrics Not Updating

1. **Check Console Logs**: Open Developer Console (F12) and look for errors
2. **Verify Google Sheet**: Make sure it's published as CSV
3. **Check Date Format**: Ensure dates in Column J match expected formats
4. **Check Path Values**: Ensure Column H has "A" or "B" (case-insensitive)
5. **Check Qualified Values**: Ensure Column K has "Si" for qualified leads

### Script Not Running

1. **Check URL**: Make sure you're on the exact funnel stats page
2. **Check Account ID**: Verify the account ID in the URL matches the script
3. **Check Console**: Look for the message "[Qualified Lead Metrics] Script loaded on target page"

### Wrong Date Range

1. The script reads dates from the UI date picker
2. Make sure the date picker has values
3. Check console for "Date range: ..." message
4. Verify the date format in your Google Sheet matches MM/DD/YYYY or YYYY-MM-DD

### Google Sheet Access Issues

1. **CORS Error**: Make sure the sheet is published as CSV (not just shared)
2. **404 Error**: Verify the SHEET_ID and SHEET_GID in the script
3. **Empty Data**: Check that the sheet has data and the correct columns

## Data Structure Example

Your Google Sheet should look like this:

| A | B | C | ... | H (Path) | I | J (Date) | K (Qualified) |
|---|---|---|-----|----------|---|----------|---------------|
| ... | ... | ... | ... | A | ... | 01/15/2025 | Si |
| ... | ... | ... | ... | B | ... | 01/16/2025 | No |
| ... | ... | ... | ... | A | ... | 01/17/2025 | Si |
| ... | ... | ... | ... | B | ... | 01/18/2025 | Si |

## Security & Privacy

- The script only runs on your specific account and funnel page
- All data is fetched client-side from Google Sheets
- No data is sent to external servers
- The Google Sheet must be published publicly (read-only)

## Support

If you encounter issues:

1. Check the Developer Console for error messages
2. Verify your Google Sheet structure and publication settings
3. Ensure the target page URL matches exactly
4. Check that all configuration values are correct

## License

This code is provided as-is for use with GoHighLevel custom code functionality.
