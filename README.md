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

### Quick Start

```js
import { jsonParser } from "@middleware";
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

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(` Test server running on http://localhost:${PORT}`);
});
```
<hr/>

## Global Route Prefix

You can set a prefix that automatically applies to all registered routes, so you don't need to repeat it on every route definition.


```ts
app.setGlobalPrefix('api');
// or with multiple segments
app.setGlobalPrefix(['api', 'v1']);
```

With the example above, a route registered as `/users` will be matched as `/api/v1/users`.

## Middlewares

These body parsing middleware automatically extract and parse incoming request data (JSON, URL-encoded, multipart, or plain text) based on the Content-Type header, then attach the parsed data to req.body for easy access in route handlers. They also enforce size limits to prevent large payload attacks and handle parsing errors gracefully.

### Body Parsing Middleware

The framework provides built-in middleware to parse incoming request bodies. Middleware is registered using `app.use()` and executes in the order they are added.

```typescript
// Register middleware - order matters! They execute in sequence
app.use(jsonParser({ limit: 1024 * 1024 })); // Parse JSON bodies up to 1MB
app.use(urlencodedParser()); // Parse URL-encoded form data
```
### Query Parser Middleware

Parses and transforms URL query parameters with support for nested objects (dot notation), arrays, and automatic type conversion (numbers and booleans). The parsed result is attached to `req.query` for easy access in route handlers.

```typescript
app.use(queryParser()); // Enable query parsing with default options

// URL: /users?name=John&age=25&tags[]=dev&address.city=NYC
app.get('/users', (req, res) => {
  console.log(req.query); // { name: "John", age: 25, tags: ["dev"], address: { city: "NYC" } }
});
```

with complex request URI
```typescript
// Complex URL: /api/users?filters[role]=admin&filters[active]=true&sort=age&order=desc&fields[]=name&fields[]=email&page=2&limit=10
app.get('/api/users', (req, res) => {
  // req.query automatically parsed into nested object structure:
  const { filters, sort, order, fields, page, limit } = req.query;
  
  // Easily access nested properties
  console.log(filters.role);    // "admin"
  console.log(filters.active);  // true (auto-converted to boolean)
  console.log(fields);           // ["name", "email"] (array)
  console.log(page);            // 2 (auto-converted to number)
  
  const users = fetchUsers({ filters, sort, order, fields, page, limit });
  res.json(users);
});
```
#### Query Parser Options

Customize query parsing behavior using the following options:

##### Available Options

- **`allowDots`** (default: `true`) - Convert dot notation to nested objects  
  `?user.name=John&user.age=25` → `{ user: { name: "John", age: 25 } }`

- **`allowArrays`** (default: `true`) - Parse array syntax  
  `?ids[]=1&ids[]=2` → `{ ids: ["1", "2"] }`

- **`parseNumbers`** (default: `true`) - Auto-convert numeric strings to numbers  
  `?page=2&limit=10` → `{ page: 2, limit: 10 }`

- **`parseBooleans`** (default: `true`) - Auto-convert 'true'/'false' to booleans  
  `?active=true&admin=false` → `{ active: true, admin: false }`

- **`decodeURIComponent`** (default: `true`) - Decode URI-encoded characters  
  `?name=John%20Doe` → `{ name: "John Doe" }`

##### Custom Configuration

```typescript
// Disable type conversion, keep everything as strings
app.use(queryParser({
  parseNumbers: false,
  parseBooleans: false
}));

// Enable dot notation and arrays only
app.use(queryParser({
  allowDots: true,
  allowArrays: true,
  parseNumbers: false,
  parseBooleans: false
}));

// Strict parsing - no transformations
app.use(queryParser({
  allowDots: false,
  allowArrays: false,
  parseNumbers: false,
  parseBooleans: false,
  decodeURIComponent: false
}));
```