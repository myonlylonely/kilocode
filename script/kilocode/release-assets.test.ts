import { expect, test } from "bun:test"
import { names, overlap, tag } from "./release-assets"

test("tag prefixes a leading v once", () => {
  expect(tag("7.8.0")).toBe("v7.8.0")
  expect(tag("v7.8.0")).toBe("v7.8.0")
})

test("overlap matches basename against existing release assets", () => {
  expect(
    overlap(
      ["/tmp/dist/kilo-darwin-x64.zip", "/tmp/dist/kilo-linux-x64.tar.gz"],
      ["kilo-darwin-x64.zip", "kilo-darwin-x64-baseline.zip"],
    ),
  ).toEqual(["kilo-darwin-x64.zip"])
})

test("names uses the file basename", () => {
  expect(names(["/tmp/dist/kilo-darwin-x64.zip"])).toEqual(["kilo-darwin-x64.zip"])
})
