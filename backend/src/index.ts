import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

const app = createApp();
const parsedPort = Number(process.env.PORT);
const port = Number.isNaN(parsedPort) ? 3000 : parsedPort;

app.listen(port, () => {
  process.stdout.write(`Server running on port ${port}\n`);
});
