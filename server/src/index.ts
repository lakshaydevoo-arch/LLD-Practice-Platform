import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';

const port = process.env.PORT || 3001;
const app = createApp();

app.listen(port, () => {
  console.log(`[LLD Arena Server] Listening on http://localhost:${port}`);
  console.log(`[LLD Arena Server] Health check available at http://localhost:${port}/api/health`);
});
