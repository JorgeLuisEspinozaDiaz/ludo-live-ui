import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const out = "src/api/generated/schema.d.ts";
const local = "openapi.json";
const remote = `${process.env.VITE_API_URL || "http://localhost:3005"}/api-json`;

try {
  if (existsSync(local)) {
    execSync(`pnpm exec openapi-typescript ${local} -o ${out}`, { stdio: "inherit" });
  } else {
    execSync(`pnpm exec openapi-typescript ${remote} -o ${out}`, { stdio: "inherit" });
  }
  console.log(`API types written to ${out}`);
} catch (err) {
  console.error("gen:api failed. Ensure the backend Swagger is up or openapi.json exists.");
  process.exitCode = 1;
}
