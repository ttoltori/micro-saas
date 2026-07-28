import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { env, validateEnv } from "./config/env.js";

validateEnv();

const app = createApp();

serve(
  {
    fetch: app.fetch,
    port: env.port,
  },
  (info) => {
    console.log(`🚀 World VS API server running at http://localhost:${info.port}`);
  },
);
