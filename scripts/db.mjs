import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const action = process.argv[2];
if (action !== 'up' && action !== 'down') {
  console.error('Usage: node scripts/db.mjs <up|down>');
  process.exit(1);
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRootForWsl = repoRoot.replace(/\\/g, '/');

function run(command, args, opts = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: opts.stdio ?? 'pipe',
    ...opts,
  });
}

let wslPath;
try {
  wslPath = run('wsl.exe', ['wslpath', '-a', repoRootForWsl]).trim();
} catch (error) {
  console.error(
    'Could not resolve the repo path inside WSL. Is WSL installed and docker available there?',
  );
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const composeArgs =
  action === 'up'
    ? ['compose', 'up', '-d', 'postgres']
    : ['compose', 'down'];

const remoteCommand = `cd ${JSON.stringify(wslPath)} && docker ${composeArgs.join(' ')}`;

try {
  run('wsl.exe', ['-e', 'bash', '-lc', remoteCommand], { stdio: 'inherit' });
} catch {
  process.exit(1);
}
