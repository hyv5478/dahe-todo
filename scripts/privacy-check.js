const { execFileSync } = require("node:child_process");

const blockedPathPatterns = [
  /^data\//,
  /^desktop\/release\//,
  /^desktop\/node_modules\//,
  /^desktop\/\.npm-cache\//,
  /^\.tools\//,
  /^\.chrome-test-profile\//,
  /^tmp_pdf_pages\//,
  /^tmp_.*\.txt$/i,
  /(^|\/)tasks\.json$/i,
  /(^|\/).*\.sqlite$/i,
  /(^|\/).*\.db$/i,
];

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function listTrackedFiles() {
  const output = git(["ls-files", "-z"]);
  return output.split("\0").filter(Boolean).map((file) => file.replace(/\\/g, "/"));
}

function main() {
  const trackedFiles = listTrackedFiles();
  const blocked = trackedFiles.filter((file) => blockedPathPatterns.some((pattern) => pattern.test(file)));

  if (blocked.length > 0) {
    console.error("Privacy check failed. These local/private files must not be tracked:");
    blocked.forEach((file) => console.error(`- ${file}`));
    process.exit(1);
  }

  console.log("OK: privacy check passed. No local task data or build artifacts are tracked.");
}

main();
