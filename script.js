// Get elements from the page
const menuContainer = document.getElementById('menu');
const cartItems = document.getElementById('cartItems');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const tableNumberDisplay = document.getElementById('tableNumber');

// Get table number from URL (e.g., ?table=5)
const urlParams = new URLSearchParams(window.location.search);
const tableNumber = urlParams.get('table') || 'Unknown';
tableNumberDisplay.textContent = tableNumber;

// Your Loyverse access token
const LOYVERSE_TOKEN = 'YOUR_ACCESS_TOKEN_HERE';

// Current order items
let cart = [];

// Fetch menu from Loyverse API
async function fetchMenu() {
    try {
        const response = await fetch('https://api.loyverse.com/v1.0/items', {
            headers: {
                'Authorization': `Bearer ${LOYVERSE_TOKEN}`
            }
        });
        
        const data = await response.json();
        displayMenu(data.items);
    } catch (error) {
        console.error('Error fetching menu:', error);
        menuContainer.innerHTML = '<p>Failed to load menu. Please try again.</p>';
    }
}

// Display menu items
function displayMenu(items) {
    menuContainer.innerHTML = '';
    
    items.forEach(item => {
        if (item.price > 0) { // Only show items with price
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <strong>${item.item_name}</strong>
                <p>RM ${(item.price / 100).toFixed(2)}</p>
            `;
            
            menuItem.addEventListener('click', () => addToCart(item));
            menuContainer.appendChild(menuItem);
        }
    });
}

// Add item to cart
function addToCart(item) {
    cart.push(item);
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    cartItems.innerHTML = '';
    
    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.item_name} - RM ${(item.price / 100).toFixed(2)}`;
        cartItems.appendChild(li);
    });
}

// Send order to Loyverse
async function placeOrder() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const orderData = {
        line_items: cart.map(item => ({
            item_id: item.id,
            quantity: 1
        })),
        note: `Table ${tableNumber} - QR Order`
    };
    
    try {
        const response = await fetch('https://api.loyverse.com/v1.0/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${LOYVERSE_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            alert('Order placed successfully!');
            cart = [];
            updateCartDisplay();
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (error) {
        console.error('Order failed:', error);
        alert('Failed to place order. Please notify staff.');
    }
}

// Initialize
fetchMenu();
placeOrderBtn.addEventListener('click', placeOrder);