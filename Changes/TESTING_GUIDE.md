# Testing Guide for TWS Bridge Fixes

## Quick Start

### 1. Verify the Fixes
```bash
cd /home/ubuntu/tws_electron_app
python3 test_bridge.py
```

Expected output: All checks should pass ✓

### 2. Start TWS/IB Gateway
- Open TWS or IB Gateway (Paper Trading mode recommended)
- Go to File → Global Configuration → API → Settings
- Ensure "Enable ActiveX and Socket Clients" is checked
- Set Socket Port to 7496 (default)
- Add 127.0.0.1 to Trusted IP Addresses if needed
- Click OK and restart TWS if needed

### 3. Start the Electron App
```bash
cd /home/ubuntu/tws_electron_app
npm start
```

### 4. Connect and Test

#### Connection
Use these parameters (as shown in your screenshot):
- **Host:** 127.0.0.1
- **Port:** 7496
- **Client ID:** 1

Click "Connect" button.

#### Expected Results After Connection:
1. ✅ Connection status shows "Connected"
2. ✅ Balance displays immediately (e.g., "$10,000.00")
3. ✅ Green "Connected" indicator

---

## Test Cases

### Test 1: Balance Display ✓
**What to test:** Account balance shows after connection

**Steps:**
1. Connect to TWS using the connection form
2. Look at the "Account Balance" field

**Expected:**
- Balance displays immediately after connection
- Shows actual account balance from TWS (e.g., "$10,234.56")
- No more "$--" placeholder

**Debug if fails:**
Press F12 in Electron app and check:
- Main console for: "Python stdout: {success: true, balance: X, requestId: ...}"
- Look for Python stderr showing: "Getting balance..." and "Found NetLiquidation: X"

---

### Test 2: Order Placement Response ✓
**What to test:** Order placement returns immediate response

**Steps:**
1. Connect to TWS
2. Fill in order form:
   - Ticker: SPY
   - Expiry: (select future date)
   - Strike: (select strike price)
   - Type: Call or Put
   - Quantity: 1
   - Action: Buy
3. Click "Buy Market Order"

**Expected:**
- ✅ Success message appears immediately
- ✅ No timeout error
- ✅ Order appears in TWS order book

**Debug if fails:**
Press F12 and check:
- Look for "Handling command: place_order with requestId: X"
- Look for "Sent response: {success: true, ..., requestId: X}"
- Verify requestId matches in both messages

---

### Test 3: Positions Display ✓
**What to test:** Positions show in the positions table

**Prerequisites:**
- Have at least one active position in TWS

**Steps:**
1. Connect to TWS
2. Look at the "Positions" section

**Expected:**
- ✅ Positions table shows your active positions
- ✅ Each row shows: Symbol, Position, Avg Cost, Market Value, Unrealized P&L
- ✅ "Close Position" button available for each

**Debug if fails:**
Press F12 and check:
- Look for "Getting positions..."
- Look for "Got X positions from TWS"
- Verify X matches number of positions you have in TWS

---

## Debugging Tools

### 1. Electron DevTools
Press **F12** in the Electron app to open DevTools

**Console tab:**
- Shows all Python stdout messages
- Shows response objects with requestId
- Shows any JavaScript errors

**Example healthy output:**
```
Python stdout: {"success":true,"balance":10000,"requestId":1731614400.123}
Python stdout: {"success":true,"positions":[...],"requestId":1731614400.456}
```

### 2. Python Stderr Logs
Python bridge logs go to stderr (shown in Electron console)

**Example healthy output:**
```
Python stderr: Bridge ready, waiting for commands...
Python stderr: Handling command: get_balance with requestId: 1731614400.123
Python stderr: Getting balance...
Python stderr: Got 50 account values from TWS
Python stderr: Found NetLiquidation: 10000.0
Python stderr: Sent response: {"success":true,"balance":10000.0,"requestId":1731614400.123}
```

### 3. Common Issues and Solutions

#### Issue: Balance still shows "$--"
**Possible causes:**
1. TWS not connected properly
2. Paper Trading account has no simulated balance
3. requestId still missing (check logs)

**Solutions:**
1. Check TWS is fully started and showing green "Connected" status
2. In TWS, go to Account → Account Window to verify balance exists
3. Check DevTools console for error messages

#### Issue: Orders still timeout
**Possible causes:**
1. TWS not accepting API orders
2. Contract details incorrect
3. Network issue

**Solutions:**
1. In TWS, verify API settings allow order placement
2. Check Python stderr for error messages about contract
3. Try a simple stock order first (e.g., BUY 1 SPY stock)

#### Issue: Positions don't show
**Possible causes:**
1. No actual positions in TWS
2. Positions API not enabled
3. Contract details not parsing correctly

**Solutions:**
1. Verify positions exist in TWS Portfolio window
2. Check Python stderr for "Got X positions" message
3. Look for any error messages in position processing

---

## Understanding the Logs

### Successful Balance Fetch
```
# Electron sends command
→ Command sent to Python: {type: 'get_balance', requestId: 1731614400.123}

# Python processes
Python stderr: Handling command: get_balance with requestId: 1731614400.123
Python stderr: Getting balance...
Python stderr: Got 50 account values from TWS
Python stderr: Found NetLiquidation: 10000.0

# Python responds
Python stdout: {"success":true,"balance":10000.0,"requestId":1731614400.123}

# Electron receives
← Response received, balance updated to $10,000.00
```

### Successful Order Placement
```
# Electron sends command
→ Command sent to Python: {type: 'place_order', data: {...}, requestId: 1731614400.456}

# Python processes
Python stderr: Handling command: place_order with requestId: 1731614400.456
Python stderr: Placing order: {action: 'BUY', ticker: 'SPY', ...}

# Python responds
Python stdout: {"success":true,"message":"BUY order placed...","requestId":1731614400.456}

# Electron receives
← Response received, success message shown
```

---

## Performance Expectations

- **Connection time:** 2-5 seconds
- **Balance fetch:** < 1 second
- **Order placement response:** < 2 seconds
- **Positions fetch:** < 2 seconds

If operations take longer than 5 seconds, check TWS network connection and API configuration.

---

## Files Reference

| File | Purpose |
|------|---------|
| `tws_bridge.py` | Main Python bridge (fixed) |
| `test_bridge.py` | Test script to verify fixes |
| `BUGFIX_SUMMARY.md` | Detailed explanation of fixes |
| `TESTING_GUIDE.md` | This file |

---

## Need More Help?

1. Run the test script: `python3 test_bridge.py`
2. Check BUGFIX_SUMMARY.md for technical details
3. Review logs in Electron DevTools (F12)
4. Ensure TWS API is properly configured
