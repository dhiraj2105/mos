import { PORT } from "./config/env.js";
import createApp from "./app.js";

const app = createApp();

app.listen(PORT, (): void => {
  console.log(`Server running on port ${PORT}`);
});
