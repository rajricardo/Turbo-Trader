# Quick Start Guide

## Get Up and Running in 5 Minutes!

### 1. Install Dependencies (First Time Only)

**Install Node.js packages:**
```bash
npm install
```

**Install Python TWS API:**
```bash
pip3 install ib-insync
```

### 2. Start TWS or IB Gateway

- Launch TWS or IB Gateway on your computer
- Log in to your account
- **Enable API connections:**
  - Go to: **File → Global Configuration → API → Settings**
  - Check: **Enable ActiveX and Socket Clients**
  - Note the port number (usually 7496)

### 3. Run the App

```bash
npm start
```

### 4. Connect

1. The app opens with default settings:
   - Host: `127.0.0.1`
   - Port: `7496` (adjust if different)
   - Client ID: `1`

2. Click **Connect**

3. You should see: ✅ "Successfully connected to TWS..."

### Common Ports

| Platform | Mode | Port |
|----------|------|------|
| TWS | Paper Trading | 7496 |
| TWS | Live Trading | 7497 |
| IB Gateway | Paper Trading | 4001 |
| IB Gateway | Live Trading | 4002 |

### Troubleshooting

**Connection fails?**
1. ✅ Is TWS/Gateway running?
2. ✅ Are API connections enabled?
3. ✅ Using the correct port?
4. ✅ Is Python API installed?

**Test Python API:**
```bash
python3 -c "import ib_insync; print('ib_insync installed OK')"
```

### Need More Help?

See the full [README.md](README.md) for detailed instructions and troubleshooting.

---

**That's it! You're ready to start building! 🚀**
