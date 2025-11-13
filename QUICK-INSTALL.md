# Quick Install Guide

## Step 1: Publish Your Google Sheet

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1WPiVyEpsiUX3wqyE_XAkxj_5GfzOd3PvKq6ReEldAu4/edit
2. Click **File** → **Share** → **Publish to web**
3. Select:
   - First dropdown: Your sheet name or "Sheet1"
   - Second dropdown: **Comma-separated values (.csv)**
4. Click **Publish**
5. Close the dialog (you don't need the URL)

## Step 2: Install in GoHighLevel

1. Open the `INSTALL-CODE.txt` file in this repository
2. Click "Select All" (Ctrl+A or Cmd+A) to select everything
3. Copy it (Ctrl+C or Cmd+C)
4. Go to GoHighLevel → **Agency Settings** → **Custom Code**
5. Paste the code (Ctrl+V or Cmd+V)
6. Click **Save**

## Step 3: Test It

1. Go to: https://app.funnelup.io/v2/location/FKNp0s6MjnKx0dJcr7Ix/funnels-websites/funnels/lzZnur5Cjl3ERFlFki6A/stats
2. Press F12 to open Developer Console
3. Look for: `[Qualified Lead Metrics] Script loaded on target page`
4. Check the opt-in cells - they should have a light green background
5. The numbers should show only qualified leads (where column K = "Si")

## Troubleshooting

### "No data fetched" error
- Make sure your Google Sheet is published as CSV (Step 1)
- Try opening this URL in your browser: https://docs.google.com/spreadsheets/d/1WPiVyEpsiUX3wqyE_XAkxj_5GfzOd3PvKq6ReEldAu4/export?format=csv&gid=0
- You should see CSV data. If you get an error, republish the sheet.

### "Script not loaded" message
- Make sure you're on the exact funnel stats URL
- Check that the account ID and funnel ID in the URL match the ones in the script

### Wrong numbers showing
- Check that your Google Sheet has:
  - Column H = Path ("A" or "B")
  - Column J = Date (MM/DD/YYYY format)
  - Column K = Qualified status ("Si" for qualified)
- Select a date range that includes data in your sheet

## Performance Impact

✅ **Zero impact on other accounts** - The script exits immediately if not on the target page

✅ **Zero impact on other pages** - Only runs on the specific funnel stats page

✅ **Minimal impact on target page** - Data is cached for 60 seconds, updates are debounced

## Support

For detailed documentation, see:
- **README.md** - Full setup and usage guide
- **CONFIGURATION.md** - Customization options
- **test.html** - Local testing page

For issues or questions, check the console logs (F12) first - they'll tell you what's happening.
