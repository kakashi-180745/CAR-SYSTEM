import { execSync } from "node:child_process";
import fs from "node:fs";

if (!fs.existsSync("src/App.jsx") || !fs.existsSync("api/_seed.json")) {
  const url = "https://codeload.github.com/kakashi-180745/CAR-SYSTEM/tar.gz/arena/a2964455-car-system";
  console.log("Syncing CAR SYSTEM frontend & catalog seed from GitHub...");
  execSync(
    `curl -fsSL "${url}" | tar -xz --strip-components=3 "CAR-SYSTEM-arena-a2964455-car-system/car-system-fullstack-ready/frontend"`,
    { stdio: "inherit" }
  );
  console.log("Sync complete.");
}
