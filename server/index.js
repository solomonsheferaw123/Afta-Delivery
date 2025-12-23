import express from 'express';
import cors from 'cors';
import db from './db.js';
import bcrypt from 'bcrypt';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', msg: 'Afta Server Running' });
});

// Dashboard Data
app.get('/api/dashboard', async (req, res) => {
    try {
        const [services] = await db.query('SELECT * FROM services WHERE is_active = 1');
        const [partners] = await db.query('SELECT * FROM partners ORDER BY rating DESC LIMIT 5');

        res.json({
            services,
            partners,
            status: 'success'
        });
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.status(500).json({ error: 'Database fetch failed', details: err.message });
    }
});

// Products & Items
app.get('/api/products', async (req, res) => {
    const { partnerId, category } = req.query;
    try {
        let query = 'SELECT * FROM products WHERE is_available = 1';
        const params = [];

        if (partnerId) {
            query += ' AND partner_id = ?';
            params.push(partnerId);
        }
        if (category && category !== 'ALL') {
            query += ' AND category = ?';
            params.push(category);
        }

        const [products] = await db.query(query, params);
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Add New Product
app.post('/api/products', async (req, res) => {
    const { partnerId, name, description, price, category, image_url } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO products (partner_id, name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [partnerId, name, description, price, category, image_url]
        );

        const [newProduct] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, product: newProduct[0] });
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).json({ success: false, error: 'Failed to add product' });
    }
});

// Update Product
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, image_url, is_available } = req.body;
    try {
        await db.query(
            'UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ?, is_available = ? WHERE id = ?',
            [name, description, price, category, image_url, is_available, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ success: false, error: 'Failed to update product' });
    }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ success: false, error: 'Failed to delete product' });
    }
});

// Orders & Wallet Flow
app.post('/api/orders', async (req, res) => {
    const { userId, partnerId, totalAmount, items } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Check Balance
        const [users] = await connection.query('SELECT wallet_balance FROM users WHERE id = ? FOR UPDATE', [userId]);
        if (users[0].wallet_balance < totalAmount) {
            throw new Error('Insufficient balance');
        }

        // 2. Create Order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, partner_id, total_amount, status) VALUES (?, ?, ?, ?)',
            [userId, partnerId, totalAmount, 'pending']
        );
        const orderId = orderResult.insertId;

        // 2.5 Save Order Items
        if (items && items.length > 0) {
            for (const item of items) {
                await connection.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price_per_unit) VALUES (?, ?, ?, ?)',
                    [orderId, item.id, item.quantity || 1, item.price]
                );
            }
        }

        // 3. Update Wallet
        await connection.query('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?', [totalAmount, userId]);

        // 4. Record Transaction
        await connection.query(
            'INSERT INTO wallet_transactions (user_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)',
            [userId, -totalAmount, 'payment', `Order #${orderId}`]
        );

        // 5. Fetch updated user
        const [updatedUsers] = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);

        await connection.commit();
        res.json({ success: true, orderId: orderId, user: updatedUsers[0] });
    } catch (err) {
        await connection.rollback();
        res.status(400).json({ success: false, error: err.message });
    } finally {
        connection.release();
    }
});

// Get User Orders
app.get('/api/orders/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        // Fetch orders with partner names
        const [orders] = await db.query(
            `SELECT o.*, p.name as partner_name, p.image_url as partner_image 
             FROM orders o 
             JOIN partners p ON o.partner_id = p.id 
             WHERE o.user_id = ? 
             ORDER BY o.created_at DESC`,
            [userId]
        );

        // For each order, fetch its items
        for (let order of orders) {
            const [items] = await db.query(
                `SELECT oi.*, pr.name, pr.image_url 
                 FROM order_items oi 
                 JOIN products pr ON oi.product_id = pr.id 
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        res.json({ success: true, orders });
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
});

// Get Partner Orders
app.get('/api/partner/orders/:partnerId', async (req, res) => {
    const { partnerId } = req.params;
    try {
        const [orders] = await db.query(
            `SELECT o.*, u.full_name as customer_name, u.phone_number as customer_phone
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             WHERE o.partner_id = ? 
             ORDER BY o.created_at DESC`,
            [partnerId]
        );

        for (let order of orders) {
            const [items] = await db.query(
                `SELECT oi.*, pr.name, pr.image_url 
                 FROM order_items oi 
                 JOIN products pr ON oi.product_id = pr.id 
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        res.json({ success: true, orders });
    } catch (err) {
        console.error('Error fetching partner orders:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
});

// Update Order Status
app.put('/api/orders/:orderId/status', async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    try {
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
        res.json({ success: true });
    } catch (err) {
        console.error('Order status update error:', err);
        res.status(500).json({ success: false, error: 'Failed to update status' });
    }
});


// Express Requests
app.post('/api/express', async (req, res) => {
    const { userId, pickup, dropoff, type, vehicle, price } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO express_requests (user_id, pickup_location, dropoff_location, package_type, vehicle_type, estimated_price) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, pickup, dropoff, type, vehicle, price]
        );
        res.json({ success: true, requestId: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Request failed' });
    }
});

// User Auth (Username/Password)

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (users.length === 0) {
            return res.json({ success: false, error: 'Invalid username or password' });
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.json({ success: false, error: 'Invalid username or password' });
        }

        // Don't send password hash to frontend
        delete user.password_hash;
        res.json({ success: true, user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// User Signup
app.post('/api/auth/signup', async (req, res) => {
    const { username, password, fullName, email, phone, userType } = req.body;
    try {
        // Validate required fields
        if (!username || !password || !fullName || !phone) {
            return res.json({ success: false, error: 'All fields are required' });
        }

        // Check if username already exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.json({ success: false, error: 'Username already taken' });
        }

        // Check if phone already exists
        const [existingPhone] = await db.query('SELECT * FROM users WHERE phone_number = ?', [phone]);
        if (existingPhone.length > 0) {
            return res.json({ success: false, error: 'Phone number already registered' });
        }

        // Check if email already exists (if provided)
        if (email) {
            const [existingEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            if (existingEmail.length > 0) {
                return res.json({ success: false, error: 'Email already registered' });
            }
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create new user with initial wallet balance
        const result = await db.query(
            'INSERT INTO users (username, email, full_name, phone_number, password_hash, wallet_balance, user_type, is_activated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [username, email || null, fullName, phone, passwordHash, 1000, userType || 'customer', 0]
        );

        const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result[0].insertId]);
        // Don't return hash
        delete newUser[0].password_hash;

        res.json({ success: true, user: newUser[0] });

    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ success: false, error: 'Signup failed. Please try again.' });
    }
});

// --- ADMIN ENDPOINTS ---

// Admin Stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
        const [orderCount] = await db.query('SELECT COUNT(*) as count FROM orders');
        const [revenue] = await db.query('SELECT SUM(total_amount) as total FROM orders');

        // Get recent signups
        const [recentUsers] = await db.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 5');

        res.json({
            success: true,
            stats: {
                totalUsers: userCount[0].count,
                totalOrders: orderCount[0].count,
                totalRevenue: revenue[0].total || 0
            },
            recentUsers
        });
    } catch (err) {
        console.error('Admin stats error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch admin stats' });
    }
});

// Get All Users (Admin)
app.get('/api/admin/users', async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, full_name, username, user_type, phone_number, wallet_balance, created_at FROM users ORDER BY created_at DESC');
        res.json({ success: true, users });
    } catch (err) {
        console.error('Admin users fetch error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
});

// Get All Partners (Admin)
app.get('/api/admin/partners', async (req, res) => {
    try {
        // Fetch partners with some stats
        const query = `
            SELECT p.*, 
            (SELECT COUNT(*) FROM orders o WHERE o.partner_id = p.id) as order_count,
            (SELECT COALESCE(SUM(total_amount), 0) FROM orders o WHERE o.partner_id = p.id) as total_revenue
            FROM partners p
            ORDER BY p.rating DESC
        `;
        const [partners] = await db.query(query);
        res.json({ success: true, partners });
    } catch (err) {
        console.error('Admin partners fetch error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch partners' });
    }
});

// Add New Partner (Admin)
app.post('/api/admin/partners', async (req, res) => {
    const { name, category, image_url, delivery_time } = req.body;
    try {
        if (!name || !category) {
            return res.status(400).json({ success: false, error: 'Name and category are required' });
        }

        const [result] = await db.query(
            'INSERT INTO partners (name, category, image_url, delivery_time, rating) VALUES (?, ?, ?, ?, ?)',
            [name, category, image_url || null, delivery_time || '30-45 min', 5.0] // Default 5.0 rating for new partners
        );

        const [newPartner] = await db.query('SELECT * FROM partners WHERE id = ?', [result.insertId]);
        res.json({ success: true, partner: newPartner[0] });
    } catch (err) {
        console.error('Admin add partner error:', err);
        res.status(500).json({ success: false, error: 'Failed to add partner' });
    }
});


// Wallet Activation
app.post('/api/auth/activate', async (req, res) => {
    const { userId } = req.body;
    try {
        await db.query('UPDATE users SET is_activated = 1 WHERE id = ?', [userId]);
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        const user = users[0];
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        delete user.password_hash;
        res.json({ success: true, user });
    } catch (err) {
        console.error('Activation Error:', err);
        res.status(500).json({ success: false, error: 'Activation failed', details: err.message });
    }
});



// --- PAYMENT INTEGRATION (Chapa) ---

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-xxxxxxxxxxxxxxxxxxxxx';

// Initialize Chapa Payment
app.post('/api/payment/chapa/init', async (req, res) => {
    const { userId, amount, email, fullName } = req.body;
    const tx_ref = `afta_${Date.now()}_${userId}`;

    try {
        const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount.toString(),
                currency: 'ETB',
                email: email || `${userId}@aftadelivery.com`,
                first_name: fullName.split(' ')[0],
                last_name: fullName.split(' ')[1] || 'User',
                tx_ref: tx_ref,
                callback_url: 'https://webhook.site/0000-0000-0000', // You can set yours
                return_url: `${req.headers.origin}/?payment_status=success&tx_ref=${tx_ref}`,
                customization: {
                    title: 'Afta Wallet Top-up',
                    description: `Top up wallet with ${amount} ETB`
                }
            })
        });

        const data = await response.json();
        if (data.status === 'success') {
            res.json({ success: true, checkout_url: data.data.checkout_url, tx_ref });
        } else {
            res.status(400).json({ success: false, error: data.message });
        }
    } catch (err) {
        console.error('Chapa init error:', err);
        res.status(500).json({ success: false, error: 'Payment initialization failed' });
    }
});

// Verify Chapa Payment
app.get('/api/payment/chapa/verify/:tx_ref', async (req, res) => {
    const { tx_ref } = req.params;

    try {
        const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
            headers: { 'Authorization': `Bearer ${CHAPA_SECRET_KEY}` }
        });

        const data = await response.json();

        if (data.status === 'success' && data.data.status === 'success') {
            const amount = parseFloat(data.data.amount);
            // Extract user ID from tx_ref (afta_timestamp_userId)
            const userId = tx_ref.split('_')[2];

            const connection = await db.getConnection();
            try {
                await connection.beginTransaction();

                // Check if transaction already processed
                const [existing] = await connection.query('SELECT * FROM wallet_transactions WHERE description LIKE ?', [`%${tx_ref}%`]);
                if (existing.length > 0) {
                    await connection.rollback();
                    return res.json({ success: true, message: 'Already processed', user: null });
                }

                // 1. Update User Balance
                await connection.query('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', [amount, userId]);

                // 2. Record Transaction
                await connection.query(
                    'INSERT INTO wallet_transactions (user_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)',
                    [userId, amount, 'topup', `Top-up via Chapa (Telebirr/CBE) - Ref: ${tx_ref}`]
                );

                // 3. Fetch updated user
                const [updatedUsers] = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);

                await connection.commit();
                res.json({
                    success: true,
                    message: 'Payment Verified & Wallet Updated',
                    user: updatedUsers[0]
                });
            } catch (err) {
                await connection.rollback();
                throw err;
            } finally {
                connection.release();
            }
        } else {
            res.status(400).json({ success: false, error: 'Payment not verified' });
        }
    } catch (err) {
        console.error('Verification error:', err);
        res.status(500).json({ success: false, error: 'Verification failed' });
    }
});

// Simulate Payment Initiation (Legacy Mock kept for testing)
app.post('/api/payment/simulate', async (req, res) => {
    const { userId, amount, provider } = req.body;
    try {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            await connection.query('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', [amount, userId]);
            await connection.query(
                'INSERT INTO wallet_transactions (user_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)',
                [userId, amount, 'topup', `Top-up via ${provider} (Simulated)`]
            );
            const [updatedUsers] = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);
            await connection.commit();
            res.json({ success: true, message: 'Payment Successful', user: updatedUsers[0] });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Payment simulation error:', err);
        res.status(500).json({ success: false, error: 'Payment processing failed' });
    }
});


// Wallet Transactions (Peer-to-Peer Transfer)
app.post('/api/wallet/transfer', async (req, res) => {
    const { senderId, receiverPhone, amount } = req.body;
    const transferAmount = parseFloat(amount);

    if (isNaN(transferAmount) || transferAmount <= 0) {
        return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get Sender and check balance
        const [senders] = await connection.query('SELECT * FROM users WHERE id = ? FOR UPDATE', [senderId]);
        const sender = senders[0];

        if (!sender) throw new Error('Sender not found');
        if (sender.wallet_balance < transferAmount) throw new Error('Insufficient balance');

        // 2. Get Receiver by Phone
        const [receivers] = await connection.query('SELECT * FROM users WHERE phone_number = ? FOR UPDATE', [receiverPhone]);
        const receiver = receivers[0];

        if (!receiver) throw new Error('Receiver not found with this phone number');
        if (sender.id === receiver.id) throw new Error('Cannot transfer to yourself');

        // 3. Deduct from Sender
        await connection.query('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?', [transferAmount, senderId]);

        // 4. Add to Receiver
        await connection.query('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', [transferAmount, receiver.id]);

        // 5. Record Transactions
        const txRef = `TRF-${Date.now()}`;

        // Sender Outgoing
        await connection.query(
            'INSERT INTO wallet_transactions (user_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)',
            [senderId, -transferAmount, 'payment', `Transfer to ${receiver.full_name} (${receiverPhone}) - Ref: ${txRef}`]
        );

        // Receiver Incoming
        await connection.query(
            'INSERT INTO wallet_transactions (user_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)',
            [receiver.id, transferAmount, 'topup', `Transfer from ${sender.full_name} (${sender.phone_number}) - Ref: ${txRef}`]
        );

        await connection.commit();

        // Fetch updated sender info
        const [updatedSenders] = await connection.query('SELECT * FROM users WHERE id = ?', [senderId]);

        res.json({
            success: true,
            message: 'Transfer successful',
            user: updatedSenders[0],
            txRef
        });

    } catch (err) {
        await connection.rollback();
        console.error('Transfer Error:', err);
        res.status(400).json({ success: false, error: err.message });
    } finally {
        connection.release();
    }
});

// Get Wallet Transactions
app.get('/api/wallet/transactions/:userId', async (req, res) => {

    const { userId } = req.params;
    try {
        const [transactions] = await db.query(
            'SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
            [userId]
        );
        res.json({ success: true, transactions });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
