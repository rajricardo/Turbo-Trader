# TWS Options Trading App - User Guide

## Overview
This Electron application provides a user-friendly interface for trading options through Interactive Brokers TWS (Trader Workstation) or IB Gateway. The app supports placing market orders, viewing positions, and managing your portfolio.

## Features

### 1. Connection Management
- Connect to TWS/IB Gateway with custom host, port, and client ID
- Automatic connection status monitoring
- Clean disconnect functionality

### 2. Options Trading
- **Place Market Orders**: Buy or sell options contracts with market orders
- **Order Parameters**:
  - Symbol: Stock ticker symbol (e.g., AAPL, TSLA, SPY)
  - Quantity: Number of option contracts
  - Expiry Date: Option expiration date (defaults to today)
  - Strike Price: Option strike price
  - Type: Call or Put option

### 3. Positions Management
- **Real-time Position Tracking**: View all your current positions
- **Position Details**:
  - Symbol with contract details
  - Position size (positive for long, negative for short)
  - Average cost per contract
  - Current market value
  - Unrealized P&L (profit/loss)
- **Quick Close**: Close any position with a single click
- **Auto-refresh**: Positions update automatically every 5 seconds

### 4. Portfolio Balance
- Real-time account balance display in the header
- Shows net liquidation value
- Updates automatically with positions

## How to Use

### Initial Setup
1. Ensure TWS or IB Gateway is running
2. Enable API connections in TWS/Gateway settings:
   - In TWS: Edit → Global Configuration → API → Settings
   - Enable "Enable ActiveX and Socket Clients"
   - Note the Socket port (default: 7496 for paper trading)

### Connecting to TWS
1. Enter your connection details:
   - **Host**: Usually `127.0.0.1` for local connection
   - **Port**: 
     - `7496` for TWS paper trading
     - `7497` for TWS live trading
     - `4001` for IB Gateway paper trading
     - `4002` for IB Gateway live trading
   - **Client ID**: Any number (default: 1)
2. Click **Connect**
3. Wait for the "Successfully connected" message
4. Trading and positions sections will appear automatically

### Placing an Options Order
1. After connecting, scroll to the "Place Options Order" section
2. Fill in the order details:
   - **Symbol**: Enter the stock ticker (e.g., AAPL)
   - **Quantity**: Enter number of contracts (minimum 1)
   - **Expiry Date**: Select the option expiration date
   - **Strike Price**: Enter the strike price (e.g., 150.00)
   - **Type**: Select Call or Put
3. Click **Buy Market Order** to go long or **Sell Market Order** to go short
4. Wait for order confirmation
5. Your positions will automatically update

### Managing Positions
1. View your positions in the "Current Positions" table
2. Each position shows:
   - Full contract details (symbol, expiry, strike, type)
   - Position size
   - Average cost
   - Current market value
   - Unrealized P&L (green for profit, red for loss)
3. To close a position:
   - Click the **Close** button in the Action column
   - Confirm the closure
   - Position will be closed with a market order

### Disconnecting
1. Click the **Disconnect** button
2. All trading functionality will be disabled
3. Python bridge will disconnect from TWS

## Technical Details

### Architecture
- **Frontend**: Electron + HTML/CSS/JavaScript
- **Backend**: Python bridge using ib_insync (preferred) or ibapi
- **Communication**: IPC (Inter-Process Communication) between Electron and Python

### Files Modified
- `index.html`: Added trading UI and positions table
- `styles.css`: Styled all new components
- `renderer.js`: Implemented trading logic and UI handlers
- `tws_bridge.py`: Added options trading functionality
- `main.js`: Added IPC handlers for trading operations
- `preload.js`: Exposed new API methods

### Python Dependencies
The app requires either:
- `ib_insync` (recommended): `pip install ib_insync`
- OR `ibapi` (fallback): `pip install ibapi`

### Auto-refresh
When connected, the app automatically refreshes:
- Positions: Every 5 seconds
- Balance: Every 5 seconds

## Important Notes

⚠️ **Risk Warning**: This is a trading application. Always test with paper trading accounts first before using with live accounts.

⚠️ **Market Orders**: This app uses market orders which execute immediately at the best available price. Be cautious with illiquid options.

⚠️ **Options Multiplier**: Remember that each option contract represents 100 shares of the underlying stock.

⚠️ **Connection**: Keep TWS/IB Gateway running throughout your session. If disconnected, reconnect using the Connect button.

## Troubleshooting

### Connection Issues
- Ensure TWS/Gateway is running
- Check that API connections are enabled
- Verify the correct port number
- Try a different Client ID if "Already connected" error occurs

### Orders Not Executing
- Verify you have sufficient buying power
- Check that the option contract exists (valid expiry and strike)
- Ensure market is open (or use paper trading)

### Positions Not Showing
- Wait a few seconds after connecting
- Click the Refresh button
- Check Python console for error messages

### Balance Shows $0
- Wait for account data to load
- Ensure you're connected to the correct account
- Check TWS/Gateway is properly logged in

## Support
For issues related to:
- TWS/Gateway setup: Contact Interactive Brokers support
- App functionality: Check the logs in the Electron dev console

## Version
Options Trading Version: 1.0.0
Last Updated: November 2025
