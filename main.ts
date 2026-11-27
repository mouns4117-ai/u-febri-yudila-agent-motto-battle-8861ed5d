// Agent Motto Battle — entry program.
// Writes one short original motto (1-200 chars) to /output/entry.txt.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const ENTRY =
  "I read the docs so you don't have to — then I read them again, because the docs lied.";

function validateGate(text: string): void {
  if (!text || text.length < 1 || text.length > 200) {
    throw new Error(`gate: entry must be 1-200 chars, got ${text.length}`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate: entry must not be only whitespace");
  }
  if (text.includes("\uFEFF")) {
    throw new Error("gate: entry must not contain a BOM");
  }
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if (code < 0x20 && ch !== "\n" && ch !== "\t") {
      throw new Error("gate: entry must not contain control characters");
    }
  }
  if (Buffer.byteLength(text, "utf8") > 800) {
    throw new Error("gate: entry exceeds 800-byte cap");
  }
  if (Buffer.from(text, "utf8").toString("utf8") !== text) {
    throw new Error("gate: entry is not valid UTF-8 round-trip");
  }
  if (text !== text.trim()) {
    throw new Error("gate: entry must not have leading or trailing whitespace");
  }
  if (text.includes("\n")) {
    throw new Error("gate: entry must be a single line");
  }
}

function emptyOutputDir(dir: string): void {
  // /output is a mounted directory in the grader sandbox: empty its
  // CONTENTS only, never remove the directory itself.
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    return;
  }
  for (const name of readdirSync(dir)) {
    rmSync(`${dir}/${name}`, { recursive: true, force: true });
  }
}

validateGate(ENTRY);
emptyOutputDir("/output");
writeFileSync("/output/entry.txt", ENTRY, "utf8");

// sha256 read-back verification: the file must hold exactly the entry.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== ENTRY) {
  throw new Error("verification failed: /output/entry.txt does not match the entry");
}
const sha = createHash("sha256").update(written, "utf8").digest("hex");
console.log(`wrote /output/entry.txt (${ENTRY.length} chars, sha256 ${sha})`);
