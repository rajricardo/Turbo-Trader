# Testing the TWS Bridge Fixes

## Prerequisites
1. Ensure TWS is running and connected on 127.0.0.1:7496
2. Ensure you have an active position (preferably an option contract)
3. Start the Electron app: `npm start`

## Test 1: Balance Fetching (NetLiquidation Only)

### Steps:
1. Click the "Get Balance" button in the app
2. Check the console/logs for messages like:
   ```
   Account value: tag=NetLiquidation, value=XXXXX, currency=USD
   Found NetLiquidation: XXXXX
   ```
3. Verify that only NetLiquidation is logged and the loop breaks immediately

### Expected Result:
- Balance displays correctly
- Only NetLiquidation tag is used
- No other account values are processed

---

## Test 2: avgCost Display (Fixed for Options)

### Steps:
1. Click "Get Positions" button
2. Look at any option position in the list
3. Check the avgCost value displayed

### Expected Result:
- **Before Fix**: avgCost showed 1011.0459 USD (per-contract cost)
- **After Fix**: avgCost shows 10.11 USD (per-share cost)

### Verification in Logs:
Look for log messages like:
```
Option position detected, adjusted avgCost from 1011.0459 to 10.11
```

### Note:
- Stock positions are NOT affected (no division)
- Only option contracts (secType='OPT') are divided by 100

---

## Test 3: Close Position (Fixed Exchange Error)

### Steps:
1. Have an open option position
2. Click "Close Position" on any option position
3. Observe the result

### Expected Result:
- **Before Fix**: Error 321 - "Missing order exchange" or invalid exchange 'bG'
- **After Fix**: Position closes successfully with "Position closed for [symbol]" message

### Verification in Logs:
Look for log messages like:
```
Reconstructed contract: Contract(symbol='TSLA', secType='OPT', exchange='SMART', ...)
Placing closing order: action=SELL, quantity=1
Position closed for TSLA 20251121 410.0C
```

---

## Quick Visual Test

### Before Starting:
Take note of:
1. Your current balance (should match TWS)
2. avgCost of any option position in TWS
3. Any error messages when trying to close positions

### After Fixes:
1. ✅ Balance should match TWS NetLiquidation exactly
2. ✅ avgCost should match the per-share price in TWS (not 100x)
3. ✅ Close position should work without errors

---

## Debugging

If you encounter issues:

1. **Check TWS Connection**: Ensure TWS is running and the app is connected
2. **Check Logs**: Look at the terminal running the Electron app for detailed logs
3. **Check Python Bridge**: The Python process logs to stderr with detailed information

### Enable More Verbose Logging:
The Python bridge already logs extensively. Check the terminal for messages starting with:
- `"Requesting account values from ib_insync..."`
- `"Processing position: ..."`
- `"Reconstructed contract: ..."`

---

## Expected Log Output

### For Balance:
```
Requesting account values from ib_insync...
Got 50 account values from TWS
Account value: tag=NetLiquidation, value=125000.50, currency=USD
Found NetLiquidation: 125000.50
Balance result: {'success': True, 'balance': 125000.5}
```

### For Positions (Option):
```
Processing position: Position(account='...', contract=Option(symbol='TSLA', ...), position=1.0, avgCost=1011.0459, ...)
Option position detected, adjusted avgCost from 1011.0459 to 10.11
Position data: {'symbol': 'TSLA 20251121 410.0C', 'position': 1.0, 'avgCost': 10.11, ...}
```

### For Close Position:
```
Closing position: {'symbol': 'TSLA 20251121 410.0C', 'position': 1.0}
Reconstructed contract: Contract(symbol='TSLA', secType='OPT', exchange='SMART', lastTradeDateOrContractMonth='20251121', strike=410.0, right='C', multiplier='100', currency='USD')
Placing closing order: action=SELL, quantity=1
Position closed for TSLA 20251121 410.0C
```
