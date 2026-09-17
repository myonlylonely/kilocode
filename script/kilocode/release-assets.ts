import { $ } from "bun"
import { basename } from "node:path"

export function tag(version: string) {
  return version.startsWith("v") ? version : `v${version}`
}

export function names(files: string[]) {
  return files.map((file) => basename(file))
}

export function overlap(files: string[], existing: string[]) {
  const want = new Set(names(files))
  return existing.filter((name) => want.has(name))
}

type Asset = {
  id: number
  name: string
}

export async function ensure(input: { version: string; repo?: string; prerelease: boolean }) {
  const name = tag(input.version)
  const repo = input.repo ? ["--repo", input.repo] : []
  const extra = input.prerelease ? ["--prerelease"] : []
  const created = await $`gh release create ${name} -d --title ${name} ${extra} ${repo}`.nothrow()
  if (created.exitCode !== 0) {
    const err = created.stderr.toString()
    if (!/already exists/i.test(err)) throw new Error(err.trim() || `gh release create failed for ${name}`)
    console.log(`Reusing existing GitHub release ${name}`)
  }
  return (await $`gh release view ${name} --json tagName,databaseId ${repo}`.json()) as {
    tagName: string
    databaseId: number
  }
}

export async function upload(files: string[], input: { version: string; repo?: string; id?: string }) {
  const name = tag(input.version)
  const repo = input.repo ? ["--repo", input.repo] : []
  if (input.id && input.repo) await purge(files, input.repo, input.id)
  for (const file of files) {
    console.log(`Uploading ${basename(file)} to ${name}`)
    await put(name, file, repo)
  }
}

async function purge(files: string[], slug: string, id: string) {
  const want = new Set(names(files))
  const listed = await assets(slug, id)
  for (const asset of listed) {
    if (!want.has(asset.name)) continue
    console.log(`Removing existing release asset ${asset.name}`)
    await $`gh api --method DELETE repos/${slug}/releases/assets/${asset.id}`.nothrow()
  }
}

async function assets(slug: string, id: string) {
  const result = await $`gh api repos/${slug}/releases/${id}/assets`.nothrow()
  if (result.exitCode !== 0) return []
  const data: unknown = JSON.parse(result.text() || "[]")
  if (!Array.isArray(data)) return []
  return data.flatMap((item): Asset[] => {
    if (!item || typeof item !== "object") return []
    if (!("id" in item) || !("name" in item)) return []
    if (typeof item.id !== "number" || typeof item.name !== "string") return []
    return [{ id: item.id, name: item.name }]
  })
}

async function put(name: string, file: string, repo: string[], attempt = 1) {
  const result = await $`gh release upload ${name} ${file} --clobber ${repo}`.nothrow()
  if (result.exitCode === 0) return
  const err = result.stderr.toString()
  if (!err.includes("already exists") || attempt >= 3) {
    throw new Error(err.trim() || `gh release upload failed for ${file}`)
  }
  await $`gh release delete-asset ${name} ${basename(file)} --yes ${repo}`.nothrow()
  await Bun.sleep(1000 * attempt)
  return put(name, file, repo, attempt + 1)
}
