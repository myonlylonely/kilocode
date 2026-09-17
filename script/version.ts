#!/usr/bin/env bun

import { Script } from "@opencode-ai/script"
import { ensure } from "./kilocode/release-assets"

const output = [`version=${Script.version}`]

if (!Script.preview || Script.channel === "beta" || Script.channel === "rc") {
  // kilocode_change start - reuse an existing draft when re-running the same version
  const release = await ensure({
    version: Script.version,
    repo: process.env.GH_REPO,
    prerelease: Script.preview,
  })
  output.push(`release=${release.databaseId}`)
  output.push(`tag=${release.tagName}`)
  // kilocode_change end
}

output.push(`repo=${process.env.GH_REPO}`)

if (process.env.GITHUB_OUTPUT) {
  await Bun.write(process.env.GITHUB_OUTPUT, output.join("\n"))
}

process.exit(0)
