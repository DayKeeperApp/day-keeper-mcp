import { z } from "zod";

const ConfigSchema = z.object({
  DAY_KEEPER_API_URL: z.url(),
  DAY_KEEPER_TENANT_ID: z.uuid(),
  DAY_KEEPER_API_KEY: z.string().min(1),
  MCP_TRANSPORT: z.enum(["stdio", "http"]).default("stdio"),
  MCP_HTTP_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  DAY_KEEPER_DEFAULT_SPACE_ID: z.uuid().optional(),
  DAY_KEEPER_DEFAULT_TIMEZONE: z.string().default("UTC"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const result = ConfigSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = z.prettifyError(result.error);
    throw new Error(`Invalid configuration:\n${formatted}`);
  }
  return result.data;
}
