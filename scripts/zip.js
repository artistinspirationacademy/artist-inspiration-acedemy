import archiver from "archiver";
import { createWriteStream, readdirSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const EXCLUDED_DIRS = new Set([
    "node_modules",
    ".next",
    ".turbo",
    ".git",
    "dist",
    "out",
    ".cache",
    ".vercel",
    ".swc",
]);

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const outputPath = join(rootDir, "project.zip");

const output = createWriteStream(outputPath);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
    const mb = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log(`✓ Created ${outputPath}`);
    console.log(`  ${mb} MB (${archive.pointer()} bytes)`);
});

archive.on("warning", (err) => {
    if (err.code === "ENOENT") console.warn("Warning:", err.message);
    else throw err;
});

archive.on("error", (err) => {
    throw err;
});

archive.pipe(output);

function addDirectory(dirPath) {
    const entries = readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
            if (!EXCLUDED_DIRS.has(entry.name)) addDirectory(fullPath);
            else console.log(`  Skipping: ${relative(rootDir, fullPath)}`);
        } else archive.file(fullPath, { name: relative(rootDir, fullPath) });
    }
}

console.log(`Zipping project: ${rootDir}`);
console.log(`Output: ${outputPath}\n`);

addDirectory(rootDir);
await archive.finalize();
