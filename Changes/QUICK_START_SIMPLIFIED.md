# TWS Electron App - Quick Start Guide (Simplified Version)

## What's New in the Simplified Version

### Removed Elements
- ❌ Connection Settings UI (now in .env file)
- ❌ Positions Table
- ❌ Refresh Positions Button
- ❌ Sell Market Order Button
- ❌ Individual Close Position Buttons

### New Features
✨ **Auto-Connect** - App connects automatically on startup
✨ **Symbol Dropdown** - Pre-populated with popular trading symbols
✨ **Lot Size Dropdown** - Quick selection of common lot sizes
✨ **Radio Buttons** - Easy Call/Put selection
✨ **Confirmation Dialog** - Safety check before executing orders
✨ **Close All Button** - Quickly close all positions with one click

## Setup Instructions

1. **Configure Connection Settings**
   ```bash
   # Edit the .env file in the project root
   nano .env
   ```
   
   Set your TWS connection details:
   ```
   TWS_HOST=127.0.0.1
   TWS_PORT=7496
   TWS_CLIENT_ID=1
   ```

2. **Start the Application**
   ```bash
   npm start
   ```

   The app will automatically connect to TWS on startup.

## Using the Simplified Interface

### Placing a Buy Order

1. **Select Symbol** - Choose from dropdown (SPY, QQQ, AAPL, etc.)
2. **Select Lot Size** - Choose from dropdown (1, 2, 5, 10, 20, 50, 100)
3. **Select Expiry Date** - Pick from date picker (defaults to today)
4. **Enter Strike Price** - Type the strike price
5. **Select Type** - Click radio button for Call or Put
6. **Click "Buy Market Order"**
7. **Confirm** - Review order details in dialog and click Confirm

### Closing All Positions

1. Click **"Close All Positions"** button
2. Review warning in confirmation dialog
3. Click **Confirm** to execute or **Cancel** to abort

### Monitoring Portfolio

- **Balance** - Displayed in top-right corner of header
- **Daily P&L** - Displayed below balance (green for profit, red for loss)
- Both values refresh automatically every 5 seconds

## Interface Layout

```
┌─────────────────────────────────────────────────────┐
│  TWS Options Trading    Balance: $XXX  Daily P&L   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Status Message Area]                             │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  Place Options Order                        │  │
│  │                                             │  │
│  │  Symbol:        [Dropdown ▼]               │  │
│  │  Lot Size:      [Dropdown ▼]               │  │
│  │  Expiry Date:   [Date Picker 📅]           │  │
│  │  Strike Price:  [Text Input]               │  │
│  │  Contract Type: ◉ Call  ○ Put              │  │
│  │                                             │  │
│  │  [Buy Market Order] [Close All Positions]  │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Keyboard Shortcuts

- **Esc** - Close confirmation dialog (if open)
- All other shortcuts removed for simplicity

## Troubleshooting

### App won't connect
- Check `.env` file exists and has correct values
- Ensure TWS/IB Gateway is running
- Verify port number matches TWS settings
- Check TWS API settings allow connections

### Dropdown not working
- Ensure you're not clicking while app is loading
- Check browser console for JavaScript errors

### Order not executing
- Verify all fields are filled correctly
- Check TWS is properly connected
- Review TWS error messages

## Configuration Files

- **`.env`** - Connection settings (edit this)
- **`.env.example`** - Template with sample values
- **`main.js`** - Reads .env file
- **`tws_bridge.py`** - Python backend

## Benefits of Simplified Interface

✅ **Faster workflow** - Less clicking, fewer fields
✅ **Less errors** - Dropdowns prevent typos
✅ **Safer trading** - Confirmation dialogs
✅ **Cleaner UI** - Removed unused sections
✅ **Auto-connect** - No manual connection needed
✅ **Better UX** - Logical flow, clear actions

## Support

For issues or questions, refer to:
- `SIMPLIFICATION_SUMMARY.md` - Complete list of changes
- `README.md` - Original documentation
- `TESTING_GUIDE.md` - Testing procedures

---

**Version**: Simplified v1.0
**Last Updated**: November 2025
