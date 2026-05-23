import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { ViberClient } from "./viber/client.js";
import { buildServer } from "./server.js";

const config = loadConfig();
const client = new ViberClient(config);
const server = buildServer(client);
await server.connect(new StdioServerTransport());
