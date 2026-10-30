import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const isGhPages = process.env.GITHUB_PAGES === 'true';
const apiDir = path.resolve('app/api');
const tempDir = path.resolve('app/_api_temp_export');

let moved = false;

try {
  // Next.js static export (output: 'export' for GitHub Pages) does not support
  // dynamic server-side Route Handlers. Temporarily move app/api during static export.
  if (isGhPages && fs.existsSync(apiDir)) {
    fs.renameSync(apiDir, tempDir);
    moved = true;
  }

  execSync('next build', {
    stdio: 'inherit',
    env: process.env
  });
} finally {
  if (moved && fs.existsSync(tempDir)) {
    fs.renameSync(tempDir, apiDir);
  }
}
