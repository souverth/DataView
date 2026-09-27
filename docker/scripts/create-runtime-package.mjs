#!/usr/bin/env node
/**
 * Generates a minimal package.json containing only the server-side database
 * drivers needed at runtime by the Nitro output.
 *
 * Why: knex loads drivers (pg, mysql2, sqlite3, oracledb, ...) through dynamic
 * `require()` calls that Nitro's file tracer cannot always follow, and several
 * drivers ship native binaries that must be compiled for the runtime image
 * (Alpine/musl). Installing them in a dedicated stage keeps the final image
 * small instead of copying the whole dev `node_modules` (storybook, playwright...).
 *
 * Versions are pinned to what package-lock.json resolved, so the image runs
 * exactly the drivers that were tested.
 *
 * Usage: node create-runtime-package.mjs <package.json> <package-lock.json> <output-dir>
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const RUNTIME_PACKAGES = [
  'knex',
  'pg',
  'pg-copy-streams',
  'pg-query-stream',
  'mysql2',
  'sqlite3',
  'better-sqlite3',
  '@libsql/client',
  'oracledb',
  'mongodb',
  'redis',
  'ssh2',
];

const [, , rootPackagePath, lockfilePath, outputDir] = process.argv;

if (!rootPackagePath || !lockfilePath || !outputDir) {
  console.error(
    'Usage: node create-runtime-package.mjs <package.json> <package-lock.json> <output-dir>'
  );
  process.exit(1);
}

const rootPackage = JSON.parse(readFileSync(rootPackagePath, 'utf-8'));
const lockfile = JSON.parse(readFileSync(lockfilePath, 'utf-8'));

const resolveLockedVersion = name =>
  lockfile.packages?.[`node_modules/${name}`]?.version;

const missingPackages = RUNTIME_PACKAGES.filter(
  name => !resolveLockedVersion(name)
);

if (missingPackages.length > 0) {
  console.error(
    `Runtime packages missing from package-lock.json: ${missingPackages.join(', ')}`
  );
  process.exit(1);
}

const runtimeDependencies = Object.fromEntries(
  RUNTIME_PACKAGES.map(name => [name, resolveLockedVersion(name)])
);

mkdirSync(outputDir, { recursive: true });
writeFileSync(
  join(outputDir, 'package.json'),
  JSON.stringify(
    {
      name: `${rootPackage.name}-runtime`,
      version: rootPackage.version,
      private: true,
      dependencies: runtimeDependencies,
    },
    null,
    2
  ) + '\n'
);

console.log('Runtime dependencies:', runtimeDependencies);
