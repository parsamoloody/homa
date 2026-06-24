import { HomaApp } from '../../src/core';
import { jsonParser, queryParser } from '../../src/middleware';
import { userRoutes } from './routes/user.route';

const app = new HomaApp();

app.use(jsonParser({ limit: 2 * 1024 * 1024 }));
app.use(queryParser({}));
app.setGlobalPrefix('api')
userRoutes(app.getRouter())

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});