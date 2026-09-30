#!/usr/bin/env node
//
// sync.js - Sync agent skills from the canonical `skills/` directory into every
// provider plugin's skills directory.
//
// The canonical source of truth for every skill is the repo-root `skills/`
// directory. Edit a skill there once, run `node scripts/sync.js`, and the change
// is duplicated into each provider plugin folder (Claude, Codex, Cursor).
//
// Usage:
//   node scripts/sync.js          # copy canonical skills into all providers
//   node scripts/sync.js --check  # verify providers are in sync; exit 1 if not
//
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const REPO_ROOT = path.join(__dirname, "..");

// Canonical source of truth for all skills.
const SKILLS_DIR = path.join(REPO_ROOT, "skills");

// Provider plugin skill directories that mirror the canonical skills.
const PLUGIN_SKILLS_DIRS = [
  path.join(REPO_ROOT, "providers/claude/plugin/skills"),
  path.join(REPO_ROOT, "providers/codex/plugin/skills"),
  path.join(REPO_ROOT, "providers/cursor/plugin/skills"),
  path.join(REPO_ROOT, "providers/agent-plugins/plugin/skills"),
];

// Files preserved in provider skill dirs during cleanup (never deleted).
const PRESERVE_FILES = new Set(["README.md", ".gitkeep"]);

// ---------------------------------------------------------------------------
// Version bumping (DISABLED by default).
//
// Flip BUMP_VERSION to `true` to auto-bump plugin/marketplace versions whenever
// a skill change is detected. The supporting logic below is ready to use.
// ---------------------------------------------------------------------------
const BUMP_VERSION = false;

const VERSION_FILES = [
  path.join(REPO_ROOT, ".claude-plugin/marketplace.json"),
  path.join(REPO_ROOT, ".codex-plugin/marketplace.json"),
  path.join(REPO_ROOT, ".cursor-plugin/marketplace.json"),
  path.join(REPO_ROOT, "providers/claude/plugin/.claude-plugin/plugin.json"),
  path.join(REPO_ROOT, "providers/codex/plugin/.codex-plugin/plugin.json"),
  path.join(REPO_ROOT, "providers/cursor/plugin/.cursor-plugin/plugin.json"),
  path.join(REPO_ROOT, "providers/agent-plugins/plugin/plugin.json"),
];

const bumpVersion = (version, type) => {
  const [major, minor, patch] = version.split(".").map(Number);
  if (type === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
};

const updateVersionFile = async (filePath, bumpType) => {
  const raw = await fs.readFile(filePath, "utf8");
  const content = JSON.parse(raw);
  if (content.version) {
    content.version = bumpVersion(content.version, bumpType);
  }
  if (content.plugins) {
    for (const plugin of content.plugins) {
      if (plugin.version) plugin.version = bumpVersion(plugin.version, bumpType);
    }
  }
  await fs.writeFile(filePath, JSON.stringify(content, null, 2) + "\n", "utf8");
  console.log(`  Bumped version in: ${path.relative(REPO_ROOT, filePath)}`);
};

// Returns { added, deleted, modified } by inspecting git working-tree status
// for the provider skill directories after files have been written.
const getGitSkillChanges = () => {
  const rels = PLUGIN_SKILLS_DIRS.map((d) => path.relative(REPO_ROOT, d));
  try {
    const output = execSync(
      `git status --porcelain -- ${rels.map((r) => `"${r}"`).join(" ")}`,
      { cwd: REPO_ROOT, encoding: "utf8" },
    );
    const lines = output.trim().split("\n").filter(Boolean);
    const added = lines.some((l) => l.startsWith("??"));
    const deleted = lines.some((l) => l[1] === "D");
    const modified = lines.some((l) => !l.startsWith("??") && l[1] !== "D");
    return { added, deleted, modified };
  } catch {
    return { added: false, deleted: false, modified: false };
  }
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Recursively list files under a directory, relative to it.
const listFiles = async (dir) => {
  const out = [];
  const walk = async (current, prefix) => {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const rel = prefix ? path.join(prefix, entry.name) : entry.name;
      if (entry.isDirectory()) {
        await walk(path.join(current, entry.name), rel);
      } else {
        out.push(rel);
      }
    }
  };
  await walk(dir, "");
  return out;
};

// Remove everything from a provider skills dir except preserved files.
const cleanDirectory = async (dir) => {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return; // dir does not exist yet
  }
  for (const entry of entries) {
    if (PRESERVE_FILES.has(entry.name)) continue;
    await fs.rm(path.join(dir, entry.name), { recursive: true, force: true });
  }
};

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

const collectCanonicalFiles = async () => {
  if (!fsSync.existsSync(SKILLS_DIR)) {
    throw new Error(`Canonical skills directory not found: ${SKILLS_DIR}`);
  }
  const files = (await listFiles(SKILLS_DIR)).filter(
    (f) => !PRESERVE_FILES.has(path.basename(f)),
  );
  if (files.length === 0) {
    throw new Error(`No skill files found under ${SKILLS_DIR}`);
  }
  return files;
};

const runSync = async () => {
  const files = await collectCanonicalFiles();
  console.log(`Found ${files.length} skill file(s) in canonical skills/`);

  for (const dir of PLUGIN_SKILLS_DIRS) {
    await fs.mkdir(dir, { recursive: true });
    await cleanDirectory(dir);
  }

  for (const file of files) {
    const content = await fs.readFile(path.join(SKILLS_DIR, file), "utf8");
    for (const dir of PLUGIN_SKILLS_DIRS) {
      const outputPath = path.join(dir, file);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, content, "utf8");
      console.log(`  Written: ${path.relative(REPO_ROOT, outputPath)}`);
    }
  }

  if (BUMP_VERSION) {
    const { added, deleted, modified } = getGitSkillChanges();
    if (added || deleted || modified) {
      const bumpType = added || deleted ? "minor" : "patch";
      console.log(`Skills changed (type: ${bumpType}), bumping plugin versions`);
      for (const versionFile of VERSION_FILES) {
        await updateVersionFile(versionFile, bumpType);
      }
    } else {
      console.log("No skill changes detected, skipping version bump");
    }
  }

  console.log("Sync complete.");
};

// --check: verify each provider mirror matches the canonical source. Does not
// write anything; exits 1 if any provider is out of sync (useful in CI).
const runCheck = async () => {
  const files = await collectCanonicalFiles();
  let outOfSync = 0;

  for (const dir of PLUGIN_SKILLS_DIRS) {
    for (const file of files) {
      const canonical = await fs.readFile(path.join(SKILLS_DIR, file), "utf8");
      const targetPath = path.join(dir, file);
      let target;
      try {
        target = await fs.readFile(targetPath, "utf8");
      } catch {
        console.error(`  MISSING: ${path.relative(REPO_ROOT, targetPath)}`);
        outOfSync++;
        continue;
      }
      if (target !== canonical) {
        console.error(`  OUT OF SYNC: ${path.relative(REPO_ROOT, targetPath)}`);
        outOfSync++;
      }
    }
  }

  if (outOfSync > 0) {
    throw new Error(
      `${outOfSync} provider skill file(s) out of sync. Run \`node scripts/sync.js\`.`,
    );
  }
  console.log("All provider skills are in sync with canonical skills/.");
};

const main = async () => {
  const check = process.argv.includes("--check");
  if (check) {
    await runCheck();
  } else {
    await runSync();
  }
};

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
