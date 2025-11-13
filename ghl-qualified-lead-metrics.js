/**
 * GoHighLevel Qualified Lead Metrics Overlay
 *
 * This script replaces opt-in metrics with qualified lead data from Google Sheets
 * Only runs on specific account and funnel page for performance
 */

(function() {
  'use strict';

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  const CONFIG = {
    // Target account and funnel identifiers
    ACCOUNT_ID: 'FKNp0s6MjnKx0dJcr7Ix',
    FUNNEL_ID: 'lzZnur5Cjl3ERFlFki6A',

    // Google Sheets published CSV URL
    // Get this from: File -> Share -> Publish to web -> CSV format
    PUBLISHED_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTi7bVNArCJ8e9ln-hROx2DPMTkvLD2GwQzN3zqv_KOducLGAXUvjc4X-a686C0SI874tKT2YVzLi-Q/pub?gid=0&single=true&output=csv',

    // Column indices (0-based)
    COLUMNS: {
      PATH: 7,        // Column H (0-indexed: 7)
      DATE: 9,        // Column J (0-indexed: 9)
      QUALIFIED: 10   // Column K (0-indexed: 10)
    },

    // Performance settings
    UPDATE_DEBOUNCE_MS: 500,
    CACHE_DURATION_MS: 60000, // 1 minute cache
    INITIAL_DELAY_MS: 3000,   // Wait 3 seconds for page to load
    RETRY_DELAY_MS: 2000,     // Retry every 2 seconds
    MAX_RETRIES: 10           // Try up to 10 times
  };

  // ============================================================================
  // EARLY EXIT - Performance optimization
  // ============================================================================

  /**
   * Check if we're on the correct account and page
   * Exit immediately if not to minimize performance impact
   */
  function shouldRunScript() {
    const url = window.location.href;

    // Check if we're on the correct account
    if (!url.includes(CONFIG.ACCOUNT_ID)) {
      return false;
    }

    // Check if we're on the correct funnel stats page
    if (!url.includes(`funnels/${CONFIG.FUNNEL_ID}/stats`)) {
      return false;
    }

    return true;
  }

  // Exit early if not on target page
  if (!shouldRunScript()) {
    return; // Exit immediately - no performance impact
  }

  console.log('[Qualified Lead Metrics] Script loaded on target page');

  // ============================================================================
  // DATA FETCHING & CACHING
  // ============================================================================

  let cachedData = null;
  let cacheTimestamp = 0;

  /**
   * Fetch Google Sheet data as CSV
   */
  async function fetchGoogleSheetData() {
    // Check cache first
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CONFIG.CACHE_DURATION_MS) {
      console.log('[Qualified Lead Metrics] Using cached data');
      return cachedData;
    }

    try {
      console.log('[Qualified Lead Metrics] Fetching data from Google Sheets...');
      const response = await fetch(CONFIG.PUBLISHED_CSV_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const csvText = await response.text();
      const data = parseCSV(csvText);

      // Cache the data
      cachedData = data;
      cacheTimestamp = now;

      console.log(`[Qualified Lead Metrics] Fetched ${data.length} rows`);
      return data;

    } catch (error) {
      console.error('[Qualified Lead Metrics] Error fetching data:', error);
      return null;
    }
  }

  /**
   * Improved CSV parser that properly handles quoted fields with commas
   */
  function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const row = [];
      let currentField = '';
      let insideQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        const nextChar = line[j + 1];

        if (char === '"') {
          // Handle escaped quotes ("")
          if (insideQuotes && nextChar === '"') {
            currentField += '"';
            j++; // Skip next quote
          } else {
            // Toggle quote state
            insideQuotes = !insideQuotes;
          }
        } else if (char === ',' && !insideQuotes) {
          // End of field
          row.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }

      // Add last field
      row.push(currentField.trim());
      data.push(row);
    }

    return data;
  }

  // ============================================================================
  // DATE PARSING
  // ============================================================================

  /**
   * Extract date range from the UI date picker
   */
  function getDateRangeFromUI() {
    try {
      // Find date inputs by placeholder text
      const allInputs = document.querySelectorAll('input[type="text"]');
      let startInput = null;
      let endInput = null;

      allInputs.forEach(input => {
        const placeholder = input.placeholder?.toLowerCase() || '';
        if (placeholder.includes('start') && placeholder.includes('date')) {
          startInput = input;
        } else if (placeholder.includes('end') && placeholder.includes('date')) {
          endInput = input;
        }
      });

      if (!startInput || !endInput) {
        console.warn('[Qualified Lead Metrics] Date inputs not found');
        return null;
      }

      const startDateStr = startInput.value;
      const endDateStr = endInput.value;

      if (!startDateStr || !endDateStr) {
        console.warn('[Qualified Lead Metrics] Date values not set');
        return null;
      }

      // Parse dates (assuming format like "MM/DD/YYYY" or "YYYY-MM-DD")
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      // Set time to start/end of day for proper comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      console.log('[Qualified Lead Metrics] Date range:', startDateStr, 'to', endDateStr);

      return { startDate, endDate };

    } catch (error) {
      console.error('[Qualified Lead Metrics] Error parsing dates:', error);
      return null;
    }
  }

  /**
   * Parse date from Google Sheets (handles various formats)
   */
  function parseSheetDate(dateStr) {
    if (!dateStr) return null;

    try {
      // Handle dates with ordinal suffixes like "Nov 13th 2025, 9:00 am"
      // Remove ordinal suffixes (st, nd, rd, th) from dates
      let cleanedDate = dateStr.replace(/(\d+)(st|nd|rd|th)/gi, '$1');

      // Try parsing the cleaned date string
      // Supports formats:
      // - "Nov 13 2025, 9:00 am" (after cleaning)
      // - "MM/DD/YYYY"
      // - "YYYY-MM-DD"
      // - "DD/MM/YYYY"
      const date = new Date(cleanedDate);

      // Check if valid date
      if (isNaN(date.getTime())) {
        return null;
      }

      return date;
    } catch (error) {
      return null;
    }
  }

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================

  /**
   * Filter and count qualified leads by path
   */
  function calculateQualifiedMetrics(data, dateRange) {
    if (!data || !dateRange) {
      return null;
    }

    const { startDate, endDate } = dateRange;
    const metrics = {
      pathA: { count: 0 },
      pathB: { count: 0 }
    };

    data.forEach(row => {
      // Get values from columns
      const path = row[CONFIG.COLUMNS.PATH]?.trim().toUpperCase();
      const dateStr = row[CONFIG.COLUMNS.DATE]?.trim();
      const qualified = row[CONFIG.COLUMNS.QUALIFIED]?.trim().toLowerCase();

      // Parse the date
      const rowDate = parseSheetDate(dateStr);
      if (!rowDate) return;

      // Check if date is in range
      if (rowDate < startDate || rowDate > endDate) {
        return;
      }

      // Only count qualified leads ("Si")
      if (qualified === 'si') {
        if (path === 'A') {
          metrics.pathA.count++;
        } else if (path === 'B') {
          metrics.pathB.count++;
        }
      }
    });

    console.log('[Qualified Lead Metrics] Calculated qualified leads:', metrics);

    return metrics;
  }

  // ============================================================================
  // DOM MANIPULATION
  // ============================================================================

  /**
   * Wait for GoHighLevel to finish loading table data
   */
  async function waitForTableLoad(maxAttempts = 20, delayMs = 500) {
    for (let i = 0; i < maxAttempts; i++) {
      // Check for loading indicators
      const loadingSpinner = document.querySelector('#funnel-stats-details .n-spin');
      const loadingBar = document.querySelector('#funnel-stats-details .n-progress');

      // Check if table has actual data
      const detailsSection = document.querySelector('#funnel-stats-details');
      if (detailsSection) {
        const tbody = detailsSection.querySelector('.n-data-table-tbody');
        if (tbody) {
          const rows = tbody.querySelectorAll('tr.n-data-table-tr');
          const hasData = rows.length >= 2;

          // Check if rows have actual numbers (not loading or empty)
          if (hasData) {
            const firstRow = rows[0];
            const pageViewCell = firstRow.querySelector('td[data-col-key="pageViewsAll"]');
            if (pageViewCell) {
              const text = pageViewCell.textContent.trim();
              const hasNumbers = /\d+/.test(text);

              if (hasNumbers && !loadingSpinner && !loadingBar) {
                console.log('[Qualified Lead Metrics] GHL table loaded and ready');
                return true;
              }
            }
          }
        }
      }

      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    console.warn('[Qualified Lead Metrics] Timeout waiting for GHL table to load');
    return false;
  }

  /**
   * Update the opt-in metrics in the table
   */
  async function updateOptinMetrics(metrics) {
    if (!metrics) {
      console.warn('[Qualified Lead Metrics] No metrics to update');
      return;
    }

    try {
      // Wait for GoHighLevel to finish loading the table
      console.log('[Qualified Lead Metrics] Waiting for GHL table to finish loading...');
      const loaded = await waitForTableLoad();

      if (!loaded) {
        console.warn('[Qualified Lead Metrics] Could not confirm table loaded, attempting update anyway');
      }

      // Find the detail table inside the expanded row
      const detailsSection = document.querySelector('#funnel-stats-details');
      if (!detailsSection) {
        console.warn('[Qualified Lead Metrics] Details section not found');
        return;
      }

      const tbody = detailsSection.querySelector('.n-data-table-tbody');
      if (!tbody) {
        console.warn('[Qualified Lead Metrics] Details table body not found');
        return;
      }

      const rows = tbody.querySelectorAll('tr.n-data-table-tr');
      console.log('[Qualified Lead Metrics] Found', rows.length, 'detail rows');

      if (rows.length < 2) {
        console.warn('[Qualified Lead Metrics] Not enough rows in details table');
        return;
      }

      // Update Path A (first row)
      updateRow(rows[0], metrics.pathA, 'A');

      // Update Path B (second row)
      updateRow(rows[1], metrics.pathB, 'B');

      console.log('[Qualified Lead Metrics] ✅ Metrics updated successfully!');

    } catch (error) {
      console.error('[Qualified Lead Metrics] Error updating metrics:', error);
    }
  }

  /**
   * Update a single row with new metrics
   */
  function updateRow(row, pathMetrics, pathName) {
    try {
      const optinCell = row.querySelector('td[data-col-key="optinsAll"]');

      if (!optinCell) {
        console.warn(`[Qualified Lead Metrics] Optin cell not found for path ${pathName}`);
        return;
      }

      // Get unique page views from the same row
      const pageViewsCell = row.querySelector('td[data-col-key="pageViewsAll"]');
      let uniquePageViews = 0;

      if (pageViewsCell) {
        const pageViewDivs = pageViewsCell.querySelectorAll('.flex.text-center > div');
        if (pageViewDivs.length >= 2) {
          // Second div contains unique page views
          uniquePageViews = parseInt(pageViewDivs[1].textContent) || 0;
        }
      }

      // Calculate rate: qualified leads / unique page views
      const rate = uniquePageViews > 0
        ? ((pathMetrics.count / uniquePageViews) * 100).toFixed(2)
        : '0.00';

      // Update the optin cell
      const optinDivs = optinCell.querySelectorAll('.flex.text-center > div');

      if (optinDivs.length >= 2) {
        // Update count (first div)
        optinDivs[0].textContent = pathMetrics.count.toString();

        // Update rate (second div)
        optinDivs[1].textContent = `${rate}%`;

        // Add visual indicator
        optinCell.style.backgroundColor = '#f0fdf4';
        optinCell.title = 'Qualified leads only';

        console.log(`[Qualified Lead Metrics] Updated Path ${pathName}:`, {
          qualifiedLeads: pathMetrics.count,
          uniquePageViews: uniquePageViews,
          rate: `${rate}%`
        });
      }

    } catch (error) {
      console.error(`[Qualified Lead Metrics] Error updating row for path ${pathName}:`, error);
    }
  }

  // ============================================================================
  // MAIN EXECUTION WITH RETRY LOGIC
  // ============================================================================

  let updateTimeout = null;
  let retryCount = 0;
  let hasSucceeded = false;
  let lastDateKey = null;
  let dateListenersAttached = false;
  let isUpdating = false;
  let tableObserver = null;

  /**
   * Main function to fetch data and update metrics
   */
  async function updateMetrics() {
    if (isUpdating) {
      console.log('[Qualified Lead Metrics] Update already in progress, skipping...');
      return;
    }

    isUpdating = true;
    console.log('[Qualified Lead Metrics] Attempting to update metrics...');

    try {
      // Get date range from UI
      const dateRange = getDateRangeFromUI();
      if (!dateRange) {
        if (!hasSucceeded && retryCount < CONFIG.MAX_RETRIES) {
          retryCount++;
          console.log(`[Qualified Lead Metrics] Retry ${retryCount}/${CONFIG.MAX_RETRIES} in ${CONFIG.RETRY_DELAY_MS/1000} seconds...`);
          isUpdating = false;
          setTimeout(updateMetrics, CONFIG.RETRY_DELAY_MS);
          return;
        }

        if (!hasSucceeded) {
          console.error('[Qualified Lead Metrics] ❌ Failed to find date picker after', CONFIG.MAX_RETRIES, 'attempts');
        }
        isUpdating = false;
        return;
      }

      // Check if dates have actually changed
      const dateKey = `${dateRange.startDate.getTime()}-${dateRange.endDate.getTime()}`;
      if (lastDateKey === dateKey && hasSucceeded) {
        console.log('[Qualified Lead Metrics] Dates unchanged, skipping fetch but re-applying display');
        // Re-apply the display in case the table was refreshed by GHL
        const data = cachedData.data;
        if (data) {
          const metrics = calculateQualifiedMetrics(data, dateRange);
          updateOptinMetrics(metrics);
        }
        isUpdating = false;
        return;
      }
      lastDateKey = dateKey;

      // Fetch Google Sheet data
      const data = await fetchGoogleSheetData();
      if (!data) {
        console.error('[Qualified Lead Metrics] Could not fetch data from Google Sheets');
        isUpdating = false;
        return;
      }

      // Calculate metrics
      const metrics = calculateQualifiedMetrics(data, dateRange);

      // Update DOM
      updateOptinMetrics(metrics);

      // Mark as succeeded
      hasSucceeded = true;
      retryCount = 0;

      // Set up observers after first successful update
      if (!dateListenersAttached) {
        attachDateChangeListeners();
        attachTableObserver();
      }
    } finally {
      isUpdating = false;
    }
  }

  /**
   * Attach event listeners to date picker inputs
   */
  function attachDateChangeListeners() {
    const dateInputs = Array.from(document.querySelectorAll('input[type="text"]'))
      .filter(input => {
        const placeholder = input.placeholder?.toLowerCase() || '';
        return placeholder.includes('start') && placeholder.includes('date') ||
               placeholder.includes('end') && placeholder.includes('date');
      });

    if (dateInputs.length >= 2) {
      dateInputs.forEach(input => {
        // Listen for changes to the date inputs
        input.addEventListener('change', scheduleUpdate);
        input.addEventListener('blur', scheduleUpdate);
      });
      dateListenersAttached = true;
      console.log('[Qualified Lead Metrics] Date change listeners attached');
    }
  }

  /**
   * Attach observer to watch for table refreshes by GoHighLevel
   */
  function attachTableObserver() {
    // Watch for changes to the details table so we can re-apply our updates
    // if GoHighLevel refreshes it
    const detailsSection = document.querySelector('#funnel-stats-details');
    if (!detailsSection) {
      console.warn('[Qualified Lead Metrics] Could not find details section for observation');
      return;
    }

    tableObserver = new MutationObserver((mutations) => {
      // Check if the table content was actually modified
      const hasRelevantChanges = mutations.some(mutation => {
        // Only trigger on childList changes or specific attribute changes
        return mutation.type === 'childList' ||
               (mutation.type === 'attributes' && mutation.attributeName === 'class');
      });

      if (hasRelevantChanges && !isUpdating) {
        console.log('[Qualified Lead Metrics] Table updated by GHL, re-applying metrics...');
        scheduleUpdate();
      }
    });

    tableObserver.observe(detailsSection, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    console.log('[Qualified Lead Metrics] Table observer attached');
  }

  /**
   * Debounced update function
   */
  function scheduleUpdate() {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    updateTimeout = setTimeout(() => {
      updateMetrics();
    }, CONFIG.UPDATE_DEBOUNCE_MS);
  }

  /**
   * Initialize the script
   */
  function init() {
    console.log('[Qualified Lead Metrics] Initializing...');

    // Wait for page to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initial update with longer delay to let the page render
    console.log(`[Qualified Lead Metrics] Waiting ${CONFIG.INITIAL_DELAY_MS/1000} seconds for page to load...`);
    setTimeout(() => {
      updateMetrics();
    }, CONFIG.INITIAL_DELAY_MS);

    // Listen for URL changes (in case of SPA navigation)
    let lastUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;

        // Check if we should still run
        if (!shouldRunScript()) {
          urlObserver.disconnect();
          if (tableObserver) {
            tableObserver.disconnect();
          }
          console.log('[Qualified Lead Metrics] Navigated away from target page, stopping');
        }
      }
    });

    urlObserver.observe(document.querySelector('title') || document.body, {
      subtree: true,
      characterData: true,
      childList: true
    });

    console.log('[Qualified Lead Metrics] Initialized - will update on page load, date changes, and table refreshes');
  }

  // Expose updateMetrics for manual testing (test.html)
  if (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.updateMetrics = updateMetrics;
    console.log('[Qualified Lead Metrics] Test mode: updateMetrics() exposed to window');
  }

  // Start the script
  init();

})();
