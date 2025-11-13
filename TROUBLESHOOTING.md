# Troubleshooting Guide - Step by Step

Let's diagnose what's happening. Follow these steps in order:

## Step 1: Check if Script is Running

1. Open the funnel stats page: https://app.funnelup.io/v2/location/FKNp0s6MjnKx0dJcr7Ix/funnels-websites/funnels/lzZnur5Cjl3ERFlFki6A/stats

2. Open Developer Console (F12 or Right-click → Inspect → Console)

3. Look for ANY messages that start with `[Qualified Lead Metrics]`

**What you see will tell us:**
- ✅ If you see messages → Script is running, go to Step 2
- ❌ If you see NOTHING → Script isn't loading, go to Step 1A

### Step 1A: Script Not Loading

If you don't see ANY console messages, the script might not be installed correctly:

**Check these:**
1. In GoHighLevel, go to Agency Settings → Custom Code
2. Verify the code is actually there and saved
3. Try refreshing the page with Ctrl+Shift+R (hard refresh)
4. Check if the code starts with `<script>` and ends with `</script>`

**Common issues:**
- The code wasn't saved in GoHighLevel
- Browser cache is preventing the script from loading
- The script has a syntax error (check console for red errors)

---

## Step 2: Check URL Detection

In the console, type this command and press Enter:

```javascript
window.location.href
```

**Expected result:** You should see the full URL
```
https://app.funnelup.io/v2/location/FKNp0s6MjnKx0dJcr7Ix/funnels-websites/funnels/lzZnur5Cjl3ERFlFki6A/stats
```

**Check:**
- Does it contain `FKNp0s6MjnKx0dJcr7Ix`? (account ID)
- Does it contain `lzZnur5Cjl3ERFlFki6A`? (funnel ID)
- Does it end with `/stats`?

If ANY of these are wrong, the script won't run (by design for performance).

---

## Step 3: Check Date Picker

The script needs to read the date range from the UI. Let's verify the date picker exists:

In console, type:

```javascript
document.querySelectorAll('.n-input--pair input[type="text"]')
```

**Expected result:** You should see 2 input elements (start date and end date)

**If you see 0 elements:**
- The date picker hasn't loaded yet
- The page structure is different than expected
- Wait a few seconds and try again

**Check the dates:**
Type this in console:
```javascript
document.querySelectorAll('.n-input--pair input[type="text"]')[0].value
document.querySelectorAll('.n-input--pair input[type="text"]')[1].value
```

You should see your start and end dates. If they're empty, select a date range first.

---

## Step 4: Test Google Sheets Access

Open this URL directly in a new browser tab:
https://docs.google.com/spreadsheets/d/e/2PACX-1vTi7bVNArCJ8e9ln-hROx2DPMTkvLD2GwQzN3zqv_KOducLGAXUvjc4X-a686C0SI874tKT2YVzLi-Q/pub?gid=0&single=true&output=csv

**Expected result:** You should see CSV data with your leads

**If you see an error:**
- The sheet isn't published correctly
- Republish: File → Share → Publish to web → CSV format
- Make sure you selected the correct sheet tab

**If the CSV looks good:**
- Check that column H has "A" or "B" for paths
- Check that column J has dates
- Check that column K has "Si" for qualified leads

---

## Step 5: Check Table Structure

The script looks for specific CSS classes in the table. Let's verify they exist:

In console, type:

```javascript
document.querySelector('.n-data-table-tbody')
```

**Expected result:** Should show an HTML element

**Then check the rows:**
```javascript
document.querySelectorAll('.n-data-table-tbody tr.n-data-table-tr')
```

**Expected result:** Should show 2 or more rows (your Optin rows)

**Check the optin cells:**
```javascript
document.querySelectorAll('td[data-col-key="optinsAll"]')
```

**Expected result:** Should show 2 cells (one for each Optin row)

**If any of these return null or 0 elements:**
- The page structure has changed
- The table hasn't loaded yet
- We need to adjust the CSS selectors

---

## Step 6: Manual Test

Let's manually trigger the update to see what happens. In the console, paste this entire block:

```javascript
// Test if we can fetch the data
fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTi7bVNArCJ8e9ln-hROx2DPMTkvLD2GwQzN3zqv_KOducLGAXUvjc4X-a686C0SI874tKT2YVzLi-Q/pub?gid=0&single=true&output=csv')
  .then(response => response.text())
  .then(data => {
    console.log('✅ Successfully fetched data!');
    console.log('First 500 characters:', data.substring(0, 500));
    const lines = data.split('\n');
    console.log(`Total rows: ${lines.length}`);
  })
  .catch(error => {
    console.error('❌ Error fetching data:', error);
  });
```

**Expected result:**
- ✅ Successfully fetched data!
- First 500 characters: [your CSV data]
- Total rows: [number of rows]

**If you get an error:**
- CORS error → Sheet isn't published correctly
- 404 error → Wrong URL
- Other error → Network issue or browser blocking

---

## Step 7: Check for JavaScript Errors

Look at the console for any RED error messages.

**Common errors:**
- `SyntaxError` → Code has a typo
- `Uncaught ReferenceError` → Variable not defined
- `CORS error` → Google Sheet not published
- `Uncaught (in promise)` → Async function error

Copy the full error message if you see one.

---

## Step 8: Enable Debug Mode

I'll create a debug version of the script that logs everything. Replace your current script with the debug version (next file).

---

## Summary - What to Report

After going through these steps, please tell me:

1. **Step 1:** Do you see ANY console messages with `[Qualified Lead Metrics]`?
   - If yes, what do they say?
   - If no, does the code show in Agency Settings?

2. **Step 2:** What URL does `window.location.href` show?

3. **Step 3:** How many date inputs do you see? What are the values?

4. **Step 4:** Does the CSV URL load in a new tab? Do you see data?

5. **Step 5:** Do all the querySelector commands return elements?

6. **Step 6:** Does the manual fetch work? What does it say?

7. **Step 7:** Are there any RED errors in the console?

With this information, I can pinpoint exactly what's wrong and fix it!
