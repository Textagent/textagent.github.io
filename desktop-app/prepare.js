#!/usr/bin/env node

/**
 * prepare.js — Build script for the Neutralinojs desktop app.
 *
 * Copies shared browser-version files (script.js, styles.css, assets/)
 * from the repo root into desktop-app/resources/, and generates a
 * Neutralinojs-compatible index.html from the root index.html by
 * injecting the required Neutralinojs script tags and wrapper elements.
 *
 * Run from the desktop-app/ directory:
 *   node prepare.js
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const RESOURCES_DIR = path.resolve(__dirname, "resources");

/** @section Copy shared files */

/**
 * Recursively copy a directory, creating target dirs as needed.
 */
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/** script.js → resources/js/script.js */
const jsDest = path.join(RESOURCES_DIR, "js");
fs.mkdirSync(jsDest, { recursive: true });
fs.copyFileSync(
  path.join(ROOT_DIR, "script.js"),
  path.join(jsDest, "script.js"),
);
console.log("✓ Copied script.js → resources/js/script.js");

/** styles.css → resources/styles.css */
fs.copyFileSync(
  path.join(ROOT_DIR, "styles.css"),
  path.join(RESOURCES_DIR, "styles.css"),
);
console.log("✓ Copied styles.css → resources/styles.css");

/** assets/ → resources/assets/ */
copyDirSync(path.join(ROOT_DIR, "assets"), path.join(RESOURCES_DIR, "assets"));
console.log("✓ Copied assets/ → resources/assets/");

/** @section Generate index.html with Neutralinojs injections */

let html = fs.readFileSync(path.join(ROOT_DIR, "index.html"), "utf-8");

/** Fix relative asset paths → absolute (Neutralinojs documentRoot is /resources/) */
html = html.replace(/href="assets\//g, 'href="/assets/');
html = html.replace(/href="styles\.css"/g, 'href="/styles.css"');
/** Replace root script.js tag with neutralino.js + main.js + script.js under /js/ */
html = html.replace(
  /<script src="script\.js"><\/script>/,
  '<script src="/js/neutralino.js"></script>\n    <script src="/js/main.js"></script>\n    <script src="/js/script.js"></script>',
);

/** Inject Neutralinojs app-info element after .app-container */
html = html.replace(
  '<div class="app-container">',
  `<div class="app-container">
      <div id="neutralino-app">
        <div id="neutralino-info"></div>
      </div>`,
);

fs.writeFileSync(path.join(RESOURCES_DIR, "index.html"), html, "utf-8");
console.log(
  "✓ Generated resources/index.html (Neutralinojs injections applied)",
);

console.log("\nDone! Run `npm run dev` to start the desktop app.");
