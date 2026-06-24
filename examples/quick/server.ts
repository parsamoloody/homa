import { HomaApp } from '../../src/core';
import { jsonParser, queryParser } from '../../src/middleware';
import { Request } from "../../src/core/request";
import { Response } from "../../src/core/response";

const app = new HomaApp();

app.use(jsonParser({ limit: 2 * 1024 * 1024 }));

// Set global route path perfix to /api
app.setGlobalPrefix('api')

// Get request to http://localhost:3000/api/ping
app.get('/ping', (req: Request, res: Response) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'ping'
    });
});

// GET with route params
app.get('/users/:id', (req: Request, res: Response) => {
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

// curl  -X POST \
//   'http://localhost:3000/api/users' \
//   --header 'Accept: */*' \
//   --header 'User-Agent: Thunder Client (https://www.thunderclient.com)' \
//   --header 'Content-Type: application/json' \
//   --data-raw '{
//   "name": "Parsa",
//   "email": "parsamoloody@gmail.com"
// }'
app.post('/users', async (req: Request, res: Response) => {
    try {
        const userData = req.body;
        if (!req.body) {
            res.status(200)
                .json({
                    error: "Body cannot be empty"
                })
        }
        console.log("Request body:", req.body)

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
app.put('/users/:id', async (req: Request, res: Response) => {
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
app.delete('/users/:id', (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);

    res.json({
        message: `User ${userId} deleted successfully`,
        deletedAt: new Date().toISOString()
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(` Test server running on http://localhost:${PORT}`);
});