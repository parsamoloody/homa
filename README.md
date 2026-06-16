<p align="center">
  <a href="https://github.com/parsamoloody/homa" target="_blank"><img src="https://raw.githubusercontent.com/stringperson/565d70656ff8egr54eg5t3562899r5t5b48eger/15657490dccf161016528e1bb903dedde38d61bc/homa-no-bg-wht.png" width="120" alt="Homa Logo" /></a>
</p>

<h1 align="center">HOMA</h1>

<center>Lightweight, fast, simple and modern <b>Node.js web framework</b> with native TypeScript support</center>

<hr/>
Unlike bloated frameworks that come with unnecessary abstractions, Homa stays close to Node.js native modules while providing just enough structure to build maintainable applications. It follows these core principles:

- **Minimal but complete** - Provides essential features without bloat
- **Type-safe by design** - Full TypeScript support with intelligent inference
- **Zero dependencies** - No hidden baggage, keeping your project secure and fast
- **Intuitive API** - Learn once, use everywhere with consistent patterns
- **Performance matters** - Optimized internals with minimal overhead

### Why Homa?
- Building lightweight HTTP servers
- Performance-critical applications
- Projects where dependency minimization is important
- Easy to use

### Quick Start

```js
import { jsonParser } from "@middleware/bodyParser";
import HomaApp from "@homa";

const app = new HomaApp();

app.use(jsonParser({ limit: 2 * 1024 * 1024 }));

app.get('/ping', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'ping'
    });
});

// GET with query params
app.get('/api/users', (req, res) => {
    res.json({
        users: [
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Smith' }
        ],
        query: req.query,
        timestamp: new Date().toISOString()
    });
});

// GET with route params
app.get('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    res.json({
        id: userId,
        name: `User ${userId}`,
        email: `user${userId}@example.com`,
        params: req.params
    });
});

// POST - Create user
app.post('/api/users', async (req, res) => {
    try {
        const userData = req.body;

        // Validate
        if (!userData.name || !userData.email) {
            return res.status(400).json({
                error: 'Name and email are required'
            });
        }

        // Simulate saving
        const newUser = {
            id: Date.now(),
            ...userData,
            createdAt: new Date().toISOString()
        };

        res.status(201).json({
            message: 'User created successfully',
            user: newUser
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' + error });
    }
});

// PUT - Update user
app.put('/api/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    const updates = req.body;

    if (!updates.name && !updates.email) {
        return res.status(400).json({
            error: 'At least one field (name or email) is required'
        });
    }

    res.json({
        message: `User ${userId} updated successfully`,
        updates: updates,
        params: req.params
    });
});

// DELETE - Delete user
app.delete('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);

    res.json({
        message: `User ${userId} deleted successfully`,
        deletedAt: new Date().toISOString()
    });
});

// POST with urlencoded data
app.post('/api/login', async (req, res) => {
    await req.body; // If not using bodyParser middleware

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: 'Username and password required'
        });
    }

    if (username === 'admin' && password === 'password123') {
        res.json({
            success: true,
            token: 'fake-jwt-token-12345',
            user: { id: 1, username: 'admin' }
        });
    } else {
        res.status(401).json({
            error: 'Invalid credentials'
        });
    }
});

// File upload endpoint (multipart)
app.post('/api/upload', (req, res) => {
    // Handle file upload (simplified)
    res.json({
        message: 'File uploaded successfully',
        body: req.body,
        headers: req.headers['content-type']
    });
});

// Error handling demo
app.get('/api/error', (req, res) => {
    try {
        throw new Error('Something went wrong');
    } catch (error: any) {
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(` Test server running on http://localhost:${PORT}`);
});
```
<hr/>

#### Want to Contribute to Homa?
I love your help making Homa better! Whether you're fixing bugs, adding features, improving docs, or sharing ideas - every contribution matters.
<hr/>

Built with ❤️ for the Node.js community
