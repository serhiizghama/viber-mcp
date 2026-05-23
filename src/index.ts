#!/usr/bin/env node
import { loadConfig } from "./config.js";
import { ViberClient } from "./viber/client.js";

const config = loadConfig();
const _client = new ViberClient(config);
