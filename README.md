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
import homa ,{ Request, Response } from 'homa';

// Basic route
homa.get('/', (req: Request, res: Response) => {
  res.send('Hello from Homa!');
});

// Route with parameters
homa.get('/users/:id', (req: Request, res: Response) => {
  const userId = req.params.id;
  res.json({ userId, message: 'User found' });
});

// JSON body parsing
homa.post('/api/data', (req: Request, res: Response) => {
  const data = req.body; // Automatically parsed JSON
  res.status(201).json({ received: data });
});

// Middleware example
homa.use((req: Request, res: Response, next: Function) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Start server
homa.listen(3000, () => {
  console.log("Server started on port:3000");
});
```
<hr/>

#### Want to Contribute to Homa?
I love your help making Homa better! Whether you're fixing bugs, adding features, improving docs, or sharing ideas - every contribution matters.
<hr/>

Built with ❤️ for the Node.js community
