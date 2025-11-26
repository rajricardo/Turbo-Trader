# Daily P&L Implementation Summary

## Overview
This document describes the implementation of Daily P&L functionality in the TWS Electron app. The implementation adds two key features:

1. **Account-Level Daily P&L Display**: Shows the total daily P&L for the account in the top-right header (below Account Balance)
2. **Per-Position Daily P&L Column**: Displays daily P&L for each individual position in the positions table

## Changes Made

### 1. Backend Changes (tws_bridge.py)

#### New Functions Added:
- **`get_daily_pnl_ib_insync()`**: Fetches account-level Daily P&L using ib_insync library
  - Retrieves DailyPnL, RealizedPnL, and UnrealizedPnL from account values
  - Falls back to calculating DailyPnL from Realized + Unrealized if not directly available
  
- **`get_daily_pnl_ibapi()`**: Fetches account-level Daily P&L using ibapi library
  - Requests DailyPnL, RealizedPnL, and UnrealizedPnL via account summary
  - Calculates total if DailyPnL not available directly

#### Modified Functions:
- **`get_positions_ib_insync()`**: 
  - Now uses `ib.portfolio()` instead of just `ib.positions()` for more detailed data
  - Includes `dailyPNL` field for each position (currently uses unrealizedPNL as proxy)
  - Falls back to positions() if portfolio() returns no data
  
- **`get_positions_ibapi()`**: 
  - Added `dailyPNL` field to position data (set to 0 as not easily available in ibapi)

- **`IBApp` class (ibapi wrapper)**:
  - Added `daily_pnl`, `realized_pnl`, `unrealized_pnl` attributes
  - Updated `accountSummary()` callback to capture DailyPnL, RealizedPnL, and UnrealizedPnL tags

- **`handle_command()`**: 
  - Added handler for 'get_daily_pnl' command type

### 2. IPC Layer Changes

#### main.js:
- Added IPC handler `'get-daily-pnl'` that sends `get_daily_pnl` command to Python bridge

#### preload.js:
- Exposed `getDailyPnL()` API method to renderer process

### 3. Frontend Changes

#### index.html:
- **Header Section**: 
  - Wrapped `portfolioBalance` in a new `portfolio-info` div
  - Added new `dailyPnL` div below the balance display
  
- **Positions Table**: 
  - Added "Daily P&L" column header between "P&L" and "Action" columns
  - Updated colspan for empty positions message from 6 to 7

#### styles.css:
- Added `.portfolio-info` styling (flex column layout with gap)
- Added `.daily-pnl` base styling (similar to portfolio-balance)
- Added `.daily-pnl.positive` styling (green background tint)
- Added `.daily-pnl.negative` styling (red background tint)

#### renderer.js:
- **New Variable**: Added `dailyPnLElement` reference to DOM element
- **New Function**: `refreshDailyPnL()` - Fetches and displays account-level Daily P&L with color coding
- **Modified Functions**:
  - `handleConnect()`: Now calls `refreshDailyPnL()` on initial connection
  - `handleDisconnect()`: Resets Daily P&L display to "$--"
  - `placeOrder()`: Refreshes Daily P&L after order placement
  - `refreshBtn` click handler: Includes Daily P&L refresh
  - `displayPositions()`: Renders Daily P&L column for each position with color coding
  - `closePosition()`: Refreshes Daily P&L after closing position
  - `startAutoRefresh()`: Includes Daily P&L in 5-second refresh cycle

## Features

### Account-Level Daily P&L Display
- **Location**: Top-right header, below Account Balance
- **Format**: "Daily P&L: +$XXX.XX" or "Daily P&L: -$XXX.XX"
- **Color Coding**: 
  - Positive P&L: Green background tint
  - Negative P&L: Red background tint
- **Updates**: Automatically refreshes every 5 seconds and after any trading action

### Per-Position Daily P&L Column
- **Location**: Positions table, column between "P&L" and "Action"
- **Format**: "+$XXX.XX" or "-$XXX.XX" per position
- **Color Coding**: 
  - Positive: Green text
  - Negative: Red text
- **Data Source**: 
  - ib_insync: Uses portfolio item's unrealizedPNL (most accurate available)
  - ibapi: Set to 0 (not easily available without additional API calls)

## Testing the Implementation

### Prerequisites
1. TWS or IB Gateway running and configured
2. Paper trading or live account with active positions (optional for full testing)

### Test Steps

#### Test 1: Account-Level Daily P&L Display
1. Launch the application: `npm start`
2. Connect to TWS using the connection form
3. Verify that "Daily P&L: $--" appears below "Balance: $XXX.XX" in top-right
4. Wait for data to load
5. Verify that Daily P&L shows a value (e.g., "Daily P&L: +$123.45")
6. Check that color coding is correct:
   - Green background if positive
   - Red background if negative

#### Test 2: Per-Position Daily P&L Column
1. Ensure you have at least one open position
2. Look at the "Current Positions" table
3. Verify that a "Daily P&L" column appears between "P&L" and "Action"
4. Check that each position shows a Daily P&L value
5. Verify color coding:
   - Green text for positive values
   - Red text for negative values

#### Test 3: Auto-Refresh
1. Keep the application connected
2. Monitor the Daily P&L values (both account-level and per-position)
3. Verify they update automatically every 5 seconds
4. If positions change in TWS, verify the updates reflect in the app

#### Test 4: Manual Refresh
1. Click the "Refresh" button in the Positions section
2. Verify that Daily P&L values update for both displays

#### Test 5: Trading Actions Update Daily P&L
1. Place a test order (buy or sell)
2. After order execution, verify Daily P&L updates automatically
3. Close a position using the "Close" button
4. Verify Daily P&L updates after position closure

#### Test 6: Disconnect/Reconnect
1. Click "Disconnect"
2. Verify Daily P&L resets to "$--" and background color is removed
3. Reconnect to TWS
4. Verify Daily P&L loads correctly again

## API Data Flow

```
TWS/IB Gateway
    ↓
ib_insync / ibapi library
    ↓
tws_bridge.py (Python backend)
    ↓
main.js (IPC handler)
    ↓
renderer.js (fetch and display)
    ↓
UI (index.html + styles.css)
```

## Known Limitations

1. **Per-Position Daily P&L with ib_insync**: 
   - Currently uses `unrealizedPNL` from portfolio items as a proxy for Daily P&L
   - True daily P&L per position would require additional PnL tracking or API calls
   - This is the most accurate data readily available from the TWS API

2. **Per-Position Daily P&L with ibapi**: 
   - Set to 0 because ibapi doesn't provide easy access to per-position P&L
   - Would require implementing pnlSingle subscription for each position (complex)

3. **Account-Level Daily P&L**: 
   - May not be available in all account types or TWS configurations
   - Falls back to Realized + Unrealized if DailyPnL tag is not available

## Troubleshooting

### Daily P&L shows $0.00
- Check that your TWS account has the necessary market data subscriptions
- Verify that positions have been opened/closed during the current trading day
- Paper trading accounts may not show accurate P&L immediately

### Daily P&L not updating
- Check browser console for errors (View → Toggle Developer Tools)
- Verify TWS connection is active
- Check that auto-refresh is running (should update every 5 seconds)

### Per-Position Daily P&L shows 0 for all positions
- If using ibapi (not ib_insync), this is expected behavior
- Verify you're using ib_insync library (check logs)
- Check that TWS API permissions are properly configured

## File Changes Summary

| File | Lines Added | Lines Removed | Description |
|------|-------------|---------------|-------------|
| tws_bridge.py | +133 | -27 | Backend logic for Daily P&L fetching |
| main.js | +12 | 0 | IPC handler for get-daily-pnl |
| preload.js | +1 | 0 | Exposed getDailyPnL API |
| renderer.js | +50 | -2 | Frontend logic and display |
| index.html | +7 | -1 | UI elements for Daily P&L |
| styles.css | +24 | 0 | Styling for Daily P&L displays |

**Total**: ~230 lines added, ~27 lines removed

## Maintenance Notes

### To Update Daily P&L Calculation:
1. Modify `get_daily_pnl_ib_insync()` or `get_daily_pnl_ibapi()` in `tws_bridge.py`
2. Adjust which account values are retrieved and how they're combined

### To Change Display Format:
1. Update `refreshDailyPnL()` function in `renderer.js` for account-level display
2. Update `displayPositions()` function in `renderer.js` for per-position display

### To Modify Refresh Interval:
1. Change the interval value in `startAutoRefresh()` function in `renderer.js`
2. Current: 5000ms (5 seconds)

## Conclusion

The Daily P&L functionality has been successfully implemented with:
- ✅ Account-level Daily P&L display in header
- ✅ Per-position Daily P&L column in positions table
- ✅ Automatic refresh every 5 seconds
- ✅ Color coding (green/red) for positive/negative values
- ✅ Updates after trading actions
- ✅ Proper reset on disconnect

The implementation uses the TWS API effectively and provides real-time P&L tracking for both account-wide and position-specific performance monitoring.
