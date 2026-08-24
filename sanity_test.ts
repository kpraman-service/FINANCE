import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

Deno.test("Project Configuration Test - deno.json exists and is valid", () => {
  const denoConfigText = Deno.readTextFileSync("./deno.json");
  assertExists(denoConfigText);
  const config = JSON.parse(denoConfigText);
  assertEquals(typeof config, "object");
});

Deno.test("Project Setup Test - MongoDB Schema exists", () => {
  const schemaText = Deno.readTextFileSync("./database/schema.mongodb.js");
  assertExists(schemaText);
});
