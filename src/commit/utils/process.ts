import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import type { CommandResult } from '../types';

const execPromise = promisify(exec);
const isWindows = process.platform === 'win32';

function getShellEnv(env?: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const pathSeparator = isWindows ? ';' : ':';
  const additionalPaths = isWindows
    ? []
    : ['/usr/local/bin', '/opt/homebrew/bin', `${process.env.HOME}/.local/bin`];

  return {
    ...process.env,
    ...env,
    PATH: [process.env.PATH, ...additionalPaths].filter(Boolean).join(pathSeparator),
  };
}

export async function execAsync(
  command: string,
  options: { timeout?: number; cwd?: string; env?: NodeJS.ProcessEnv } = {}
): Promise<CommandResult> {
  const { timeout = 60000, cwd, env } = options;

  const result = await execPromise(command, {
    timeout,
    cwd,
    env: getShellEnv(env),
    maxBuffer: 10 * 1024 * 1024,
  });

  return {
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

export async function execWithAbort(
  command: string,
  options: {
    timeout?: number;
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    signal?: AbortSignal;
  } = {}
): Promise<CommandResult> {
  const { timeout = 60000, cwd, env, signal } = options;

  return new Promise((resolve, reject) => {
    const child = spawn('sh', ['-c', command], {
      cwd,
      env: getShellEnv(env),
    });

    let stdout = '';
    let stderr = '';
    let killed = false;

    const timeoutId = setTimeout(() => {
      killed = true;
      child.kill('SIGTERM');
      reject(new Error('Command timeout'));
    }, timeout);

    const abortHandler = () => {
      killed = true;
      child.kill('SIGTERM');
      clearTimeout(timeoutId);
      reject(new Error('Aborted'));
    };

    if (signal) {
      if (signal.aborted) {
        child.kill('SIGTERM');
        clearTimeout(timeoutId);
        reject(new Error('Aborted'));
        return;
      }
      signal.addEventListener('abort', abortHandler);
    }

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timeoutId);
      if (signal) {
        signal.removeEventListener('abort', abortHandler);
      }

      if (killed) {
        return;
      }

      if (code !== 0) {
        reject(new Error(stderr || `Command exited with code ${code}`));
      } else {
        resolve({ stdout, stderr });
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeoutId);
      if (signal) {
        signal.removeEventListener('abort', abortHandler);
      }
      reject(error);
    });
  });
}

export async function spawnWithStdin(
  command: string,
  args: string[],
  stdin: string,
  options: {
    timeout?: number;
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    signal?: AbortSignal;
  } = {}
): Promise<CommandResult> {
  const { timeout = 60000, cwd, env, signal } = options;

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: getShellEnv(env),
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let killed = false;

    const timeoutId = setTimeout(() => {
      killed = true;
      child.kill('SIGTERM');
      reject(new Error('Command timeout'));
    }, timeout);

    const abortHandler = () => {
      killed = true;
      child.kill('SIGTERM');
      clearTimeout(timeoutId);
      reject(new Error('Aborted'));
    };

    if (signal) {
      if (signal.aborted) {
        child.kill('SIGTERM');
        clearTimeout(timeoutId);
        reject(new Error('Aborted'));
        return;
      }
      signal.addEventListener('abort', abortHandler);
    }

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timeoutId);
      if (signal) {
        signal.removeEventListener('abort', abortHandler);
      }

      if (killed) {
        return;
      }

      if (code !== 0) {
        reject(new Error(stderr || `Command exited with code ${code}`));
      } else {
        resolve({ stdout, stderr });
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeoutId);
      if (signal) {
        signal.removeEventListener('abort', abortHandler);
      }
      reject(error);
    });

    child.stdin.write(stdin);
    child.stdin.end();
  });
}
