# TWS Electron App

A cross-platform Electron-based application for connecting to Interactive Brokers TWS (Trader Workstation) or IB Gateway via Python API. This application provides a clean, native macOS-style interface for establishing API connections.

![TWS Connection Interface](screenshot.png)

## Features

- 🖥️ Native macOS look and feel
- 🔌 Easy connection to TWS/IB Gateway
- 🐍 Python bridge for TWS API integration
- ✨ Clean and intuitive user interface
- ⚡ Real-time connection status feedback
- 🛡️ Secure IPC communication between Electron and Python
- 🔄 Support for both `ib_insync` and `ibapi` libraries

## Prerequisites

Before running this application, ensure you have the following installed:

### 1. Node.js and npm
- **Version:** Node.js 16.x or higher
- **Download:** https://nodejs.org/

To check if Node.js is installed:
```bash
node --version
npm --version
```

### 2. Python 3
- **Version:** Python 3.7 or higher
- **macOS:** Usually pre-installed, or install via Homebrew:
```bash
brew install python3
```

To check if Python is installed:
```bash
python3 --version
```

### 3. TWS Python API Library

Install either `ib_insync` (recommended) or `ibapi`:

**Option A: ib_insync (Recommended)**
```bash
pip3 install ib_insync
```

**Option B: ibapi (Official IB API)**
```bash
pip3 install ibapi
```

**Note:** The application will try `ib_insync` first and fall back to `ibapi` if needed.

### 4. Interactive Brokers TWS or IB Gateway
- **Download TWS:** https://www.interactivebrokers.com/en/trading/tws.php
- **Download IB Gateway:** https://www.interactivebrokers.com/en/trading/ibgateway-latest.php

**Important:** Make sure to enable API connections in TWS/Gateway:
1. Open TWS or IB Gateway
2. Go to **File → Global Configuration → API → Settings**
3. Check **Enable ActiveX and Socket Clients**
4. Add `127.0.0.1` to **Trusted IP Addresses** if not already there
5. Note the **Socket Port** (default: 7496 for TWS paper trading)

## Installation

### Step 1: Clone or Download the Project

If you haven't already, navigate to the project directory:
```bash
cd /path/to/tws_electron_app
```

### Step 2: Install Node.js Dependencies

```bash
npm install
```

This will install Electron and all required Node.js packages.

### Step 3: Verify Python Dependencies

Make sure the TWS Python API is installed:
```bash
pip3 list | grep ib
```

You should see either `ib-insync` or `ibapi` in the output.

## Running the Application

### Development Mode

To run the application in development mode with console logging:

```bash
npm run dev
```

### Production Mode

To run the application normally:

```bash
npm start
```

## Using the Application

### 1. Start TWS or IB Gateway
- Launch TWS or IB Gateway on your computer
- Log in to your account
- Ensure API connections are enabled (see Prerequisites #4)

### 2. Launch the Electron App
```bash
npm start
```

### 3. Configure Connection Settings

The application will open with default values:
- **Host:** `127.0.0.1` (localhost)
- **Port:** `7496` (TWS paper trading default)
- **Client ID:** `1`

**Common Ports:**
- `7496` - TWS Paper Trading
- `7497` - TWS Live Trading
- `4001` - IB Gateway Paper Trading
- `4002` - IB Gateway Live Trading

### 4. Connect

Click the **Connect** button. You should see:
- A "Connecting to TWS..." message
- Connection status (success or error)
- If successful, the button changes to "Disconnect"

### 5. Troubleshooting Connection Issues

If connection fails, check:
1. ✅ TWS/IB Gateway is running
2. ✅ API connections are enabled in settings
3. ✅ Correct port number is used
4. ✅ No other application is using the same Client ID
5. ✅ Python TWS API is installed

## Project Structure

```
tws_electron_app/
├── main.js              # Main Electron process
├── preload.js           # Preload script for secure IPC
├── index.html           # Main UI markup
├── styles.css           # Application styling
├── renderer.js          # Renderer process (UI logic)
├── tws_bridge.py        # Python bridge for TWS API
├── package.json         # Node.js dependencies and scripts
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

### File Descriptions

#### `main.js`
- Main Electron process
- Creates the application window
- Handles IPC communication with renderer
- Spawns and manages Python bridge process
- Implements connection/disconnection logic

#### `preload.js`
- Secure bridge between main and renderer processes
- Exposes safe IPC methods to the renderer
- Uses Context Isolation for security

#### `index.html`
- Main application UI
- Input fields for connection parameters
- Status display area

#### `styles.css`
- macOS-native styling
- Responsive design
- Animations and transitions
- Status message styling

#### `renderer.js`
- UI interaction logic
- Form validation
- Status message management
- Connect/disconnect handling

#### `tws_bridge.py`
- Python script that connects to TWS API
- Tries `ib_insync` first, falls back to `ibapi`
- Maintains connection and reports status
- Handles errors and timeouts

## Building for Distribution

### macOS App Bundle

To create a distributable macOS app:

1. Install `electron-packager`:
```bash
npm install --save-dev electron-packager
```

2. Add build script to `package.json`:
```json
"scripts": {
  "build:mac": "electron-packager . TWS-Connector --platform=darwin --arch=x64 --icon=icon.icns --out=dist"
}
```

3. Build the app:
```bash
npm run build:mac
```

The app will be created in the `dist/` directory.

### Creating an Icon

For macOS, you'll need an `.icns` file. You can create one from a PNG:
1. Create a 1024x1024 PNG icon
2. Use online tools or macOS tools to convert to `.icns`
3. Place it in the project root as `icon.icns`

## Configuration

### Changing Default Values

Edit `index.html` to change default connection values:
```html
<input type="text" id="host" value="127.0.0.1" placeholder="127.0.0.1">
<input type="text" id="port" value="7496" placeholder="7496">
<input type="text" id="clientId" value="1" placeholder="1">
```

### Adjusting Timeouts

Edit `main.js` to change connection timeout (default: 10 seconds):
```javascript
// Timeout after 10 seconds
setTimeout(() => {
  // ...
}, 10000);  // Change this value (in milliseconds)
```

## Troubleshooting

### Common Issues and Solutions

#### 1. "Python bridge failed to start"
**Solution:** Ensure Python 3 is installed and accessible via `python3` command.
```bash
which python3
python3 --version
```

#### 2. "Connection timeout"
**Solutions:**
- Verify TWS/IB Gateway is running
- Check if API connections are enabled
- Confirm the correct port number
- Try increasing timeout in `main.js`

#### 3. "ib_insync not installed"
**Solution:** Install the Python library:
```bash
pip3 install ib_insync
```

#### 4. Connection refused (Error 502)
**Solutions:**
- Enable API connections in TWS settings
- Add `127.0.0.1` to trusted IPs
- Restart TWS/IB Gateway
- Check firewall settings

#### 5. "Client ID already in use"
**Solution:** Either:
- Use a different Client ID in the app
- Close other applications using the same Client ID
- Restart TWS/IB Gateway

#### 6. Application won't start
**Solutions:**
- Delete `node_modules` and reinstall:
```bash
rm -rf node_modules
npm install
```
- Check for errors:
```bash
npm run dev
```

### Debug Mode

Run the application in development mode to see console logs:
```bash
npm run dev
```

Then open DevTools: **View → Toggle Developer Tools** or `Cmd+Option+I`

### Python Debug

Test the Python bridge directly:
```bash
python3 tws_bridge.py 127.0.0.1 7496 1
```

This will show Python-specific errors.

## Security Notes

- The application uses Context Isolation and disables Node Integration for security
- IPC communication is handled through a secure preload script
- Python processes are properly terminated when the app closes
- No sensitive data is stored or transmitted

## Development

### Adding New Features

1. **UI Changes:** Modify `index.html` and `styles.css`
2. **UI Logic:** Update `renderer.js`
3. **Main Process:** Edit `main.js`
4. **Python Integration:** Modify `tws_bridge.py`

### Hot Reload

For development with hot reload, you can use `electron-reload`:
```bash
npm install --save-dev electron-reload
```

Add to `main.js`:
```javascript
require('electron-reload')(__dirname);
```

## API Information

### TWS API Documentation
- **ib_insync:** https://ib-insync.readthedocs.io/
- **ibapi:** https://interactivebrokers.github.io/tws-api/

### Electron Documentation
- **Official Docs:** https://www.electronjs.org/docs

## Important Note

⚠️ **Localhost Information:** When running this application, the localhost (127.0.0.1) refers to the computer where the application is running, not necessarily your local machine if accessing remotely. To access it locally or remotely, you'll need to deploy the application on your own system following the installation instructions above.

## License

MIT License - Feel free to modify and distribute as needed.

## Support

For issues related to:
- **Electron App:** Check the Troubleshooting section above
- **TWS API:** Refer to Interactive Brokers documentation
- **ib_insync:** Visit https://github.com/erdewit/ib_insync
- **ibapi:** Visit https://www.interactivebrokers.com/en/trading/ib-api.php

## Version History

### v1.0.0 (Current)
- Initial release
- Basic connection functionality
- Support for both ib_insync and ibapi
- macOS-style UI
- Connection status feedback
- Error handling and timeouts

## Future Enhancements

Potential features for future versions:
- [ ] Save connection settings
- [ ] Multiple connection profiles
- [ ] Connection monitoring and auto-reconnect
- [ ] Basic market data display
- [ ] Order placement interface
- [ ] Account information display
- [ ] Windows and Linux UI optimizations
- [ ] System tray integration

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

---

**Happy Trading! 📈**
