#!/usr/bin/env bun

import { Script } from "@opencode-ai/script"

console.log("=== publishing ===\n")

if (!Script.release) {
  console.log("Skipping publish: not a release build (no draft GitHub release)")
  process.exit(0)
}

// kilocode_change start - fork publish path: only attach VSIX and publish the draft release.
// Upstream also publishes npm/marketplace/AUR/Homebrew/GHCR and pushes a release commit;
// those steps need org secrets and are intentionally omitted here.
console.log("\n=== vscode ===\n")
await import(`../packages/kilo-vscode/script/publish.ts`)

console.log("\n=== release notes ===\n")
const { publishNotes } = await import("./kilocode/release-notes")
await publishNotes({
  version: Script.version,
  prerelease: Script.preview,
  repo: process.env.GH_REPO,
  temp: process.env.RUNNER_TEMP,
})
// kilocode_change end

console.log("\n✨ GitHub release published with VSIX assets")
