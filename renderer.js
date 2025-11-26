// Status message
const statusMessage = document.getElementById('statusMessage');

// Trading DOM elements
const tradingSection = document.getElementById('tradingSection');
const tickerInput = document.getElementById('ticker');
const quantityInput = document.getElementById('quantity');
const expiryInput = document.getElementById('expiry');
const strikeInput = document.getElementById('strike');
const buyBtn = document.getElementById('buyBtn');
const closeAllBtn = document.getElementById('closeAllBtn');

// Portfolio elements
const portfolioBalance = document.getElementById('portfolioBalance');
const dailyPnLElement = document.getElementById('dailyPnL');

// Confirmation dialog
const confirmDialog = document.getElementById('confirmDialog');
const confirmDetails = document.getElementById('confirmDetails');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');

let isConnected = false;
let refreshInterval = null;
let pendingOrder = null;

// Set default expiry date to today
const today = new Date().toISOString().split('T')[0];
expiryInput.value = today;

// Get option type from radio buttons
function getOptionType() {
    const radioButtons = document.getElementsByName('optionType');
    for (const radio of radioButtons) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return 'C'; // Default to Call
}

// Auto-connect on page load
window.addEventListener('DOMContentLoaded', async () => {
    await handleConnect();
});

async function handleConnect() {
    try {
        showStatus('<span class="spinner"></span>Connecting to TWS...', 'connecting');

        // Call the API exposed by preload.js (connection params read from .env in main.js)
        const result = await window.api.connectTWS();

        if (result.success) {
            showStatus(result.message, 'success');
            isConnected = true;
            
            // Enable trading section
            enableTradingSection();
            
            // Show trading section
            tradingSection.style.display = 'block';
            
            // Load initial data
            await refreshBalance();
            await refreshDailyPnL();
            
            // Start auto-refresh
            startAutoRefresh();
        } else {
            showStatus(result.message, 'error');
        }
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
    }
}

// Trading functionality
buyBtn.addEventListener('click', () => {
    showOrderConfirmation('BUY');
});

closeAllBtn.addEventListener('click', () => {
    showCloseAllConfirmation();
});

// Confirmation dialog handlers
confirmBtn.addEventListener('click', async () => {
    confirmDialog.style.display = 'none';
    if (pendingOrder) {
        if (pendingOrder.type === 'BUY') {
            await executeBuyOrder(pendingOrder.data);
        } else if (pendingOrder.type === 'CLOSE_ALL') {
            await executeCloseAll();
        }
        pendingOrder = null;
    }
});

cancelBtn.addEventListener('click', () => {
    confirmDialog.style.display = 'none';
    pendingOrder = null;
});

// Close dialog on background click
confirmDialog.addEventListener('click', (e) => {
    if (e.target === confirmDialog) {
        confirmDialog.style.display = 'none';
        pendingOrder = null;
    }
});

function showOrderConfirmation(action) {
    const ticker = tickerInput.value.trim().toUpperCase();
    const quantity = parseInt(quantityInput.value);
    const expiry = expiryInput.value;
    const strike = parseFloat(strikeInput.value);
    const optionType = getOptionType();

    // Validate inputs
    if (!ticker) {
        showStatus('Please select a ticker symbol', 'error');
        return;
    }

    if (!quantity || quantity < 1) {
        showStatus('Please select a valid lot size', 'error');
        return;
    }

    if (!expiry) {
        showStatus('Please select an expiry date', 'error');
        return;
    }

    if (!strike || strike <= 0) {
        showStatus('Please enter a valid strike price', 'error');
        return;
    }

    const optionTypeName = optionType === 'C' ? 'Call' : 'Put';
    const details = `
        <p><strong>Action:</strong> ${action}</p>
        <p><strong>Symbol:</strong> ${ticker}</p>
        <p><strong>Quantity:</strong> ${quantity} contracts</p>
        <p><strong>Expiry:</strong> ${expiry}</p>
        <p><strong>Strike:</strong> $${strike.toFixed(2)}</p>
        <p><strong>Type:</strong> ${optionTypeName}</p>
    `;

    confirmDetails.innerHTML = details;
    confirmDialog.style.display = 'flex';
    
    pendingOrder = {
        type: 'BUY',
        data: {
            action: action,
            ticker: ticker,
            quantity: quantity,
            expiry: expiry.replace(/-/g, ''),
            strike: strike,
            optionType: optionType
        }
    };
}

function showCloseAllConfirmation() {
    const details = `
        <p>Are you sure you want to close <strong>all open positions</strong>?</p>
        <p style="color: #ff4579; margin-top: 10px;">This action cannot be undone.</p>
    `;

    confirmDetails.innerHTML = details;
    confirmDialog.style.display = 'flex';
    
    pendingOrder = {
        type: 'CLOSE_ALL'
    };
}

async function executeBuyOrder(orderData) {
    try {
        // Disable buttons
        buyBtn.disabled = true;
        closeAllBtn.disabled = true;
        
        showStatus(`<span class="spinner"></span>Placing order...`, 'connecting');

        const result = await window.api.placeOrder(orderData);

        if (result.success) {
            showStatus(result.message, 'success');
            
            // Refresh balance and Daily P&L
            await refreshBalance();
            await refreshDailyPnL();
            
            // Clear form
            tickerInput.selectedIndex = 0;
            strikeInput.value = '';
        } else {
            showStatus(result.message, 'error');
        }
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        buyBtn.disabled = false;
        closeAllBtn.disabled = false;
    }
}

async function executeCloseAll() {
    try {
        // Disable buttons
        buyBtn.disabled = true;
        closeAllBtn.disabled = true;
        
        showStatus(`<span class="spinner"></span>Closing all positions...`, 'connecting');

        const result = await window.api.closeAllPositions();

        if (result.success) {
            showStatus(result.message, 'success');
            
            // Refresh balance and Daily P&L
            await refreshBalance();
            await refreshDailyPnL();
        } else {
            showStatus(result.message, 'error');
        }
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        buyBtn.disabled = false;
        closeAllBtn.disabled = false;
    }
}

// Balance and Daily P&L refresh
async function refreshBalance() {
    try {
        const result = await window.api.getBalance();
        
        if (result.success) {
            portfolioBalance.textContent = `Balance: $${formatNumber(result.balance)}`;
        } else {
            console.error('Failed to fetch balance:', result.message);
        }
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}

async function refreshDailyPnL() {
    try {
        const result = await window.api.getDailyPnL();
        
        if (result.success) {
            const pnl = result.dailyPnL;
            const formattedPnL = formatNumber(Math.abs(pnl));
            const sign = pnl >= 0 ? '+' : '-';
            
            dailyPnLElement.textContent = `Daily P&L: ${sign}$${formattedPnL}`;
            
            // Remove previous classes
            dailyPnLElement.classList.remove('positive', 'negative');
            
            // Add appropriate class
            if (pnl >= 0) {
                dailyPnLElement.classList.add('positive');
            } else {
                dailyPnLElement.classList.add('negative');
            }
        } else {
            console.error('Failed to fetch daily P&L:', result.message);
        }
    } catch (error) {
        console.error('Error fetching daily P&L:', error);
    }
}

// Auto-refresh functionality
function startAutoRefresh() {
    // Refresh every 5 seconds
    refreshInterval = setInterval(async () => {
        if (isConnected) {
            await refreshBalance();
            await refreshDailyPnL();
        }
    }, 5000);
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// Helper functions
function showStatus(message, type) {
    statusMessage.innerHTML = message;
    statusMessage.className = `status-message show ${type}`;
}

function enableTradingSection() {
    tickerInput.disabled = false;
    quantityInput.disabled = false;
    expiryInput.disabled = false;
    strikeInput.disabled = false;
    
    // Enable radio buttons
    const radioButtons = document.getElementsByName('optionType');
    radioButtons.forEach(radio => radio.disabled = false);
    
    buyBtn.disabled = false;
    closeAllBtn.disabled = false;
}

function formatNumber(num) {
    return parseFloat(num).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
