import http from "node:http";
import { env } from "./commom/utils/env.js";
import { createServerApplication } from "./commom/app/index.js";

async function main() {
  try {
    const PORT: number = env.PORT ? +env.PORT : 8080;
    const server = http.createServer(createServerApplication());
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    throw error;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
