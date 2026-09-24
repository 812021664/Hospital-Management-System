import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const python = process.env.PYTHON || (process.platform === 'win32' ? 'python.exe' : 'python3');
const mode = process.argv[2] ?? 'dev';
const args = mode === 'test' ? ['-m', 'pytest', '-q'] : ['-m', 'uvicorn', 'backend.app.main:app', '--host', '127.0.0.1', '--port', '8000', '--reload'];
if (!['dev', 'test'].includes(mode)) { console.error('Use api.mjs with dev or test.'); process.exit(1); }
const child = spawn(python, args, { cwd: root, env: process.env, stdio: 'inherit' });
child.on('error', (error) => { console.error('Unable to start Python:', error.message); process.exit(1); });
child.on('exit', (code) => process.exit(code ?? 1));
