import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as esbuild from 'esbuild';

const COPIABLE_FILES = ['plugin.json', 'SettingsTemplate.yaml', 'LICENSE', 'LICENSE.md'].map(v => v.toLowerCase());

const PLUGIN_ID_REGEX = /^([a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}|[a-f0-9]{32})$/i;

const IMAGE_REGEX = /\.(png|jpg|jpeg|bmp)$/i;

const RETRY_DELAY = 1000;
const retryQueue = [];

const retryInterval = setInterval(async () => {
  if (retryQueue.length === 0) return;
  const queue = retryQueue.slice();
  while (queue.length > 0) {
    const data = queue.shift();
    if (data.type === 'delete') {
      await deleteFile(data.dest);
    } else if (data.type === 'copy') {
      await copyFile(data.src, data.dest);
    }
  }
}, RETRY_DELAY);

/**
 * @param {RetryQueueData} data
 * @returns {void}
 */
function addToRetryQueue(data) {
  retryQueue.push(data);
}

/**
 * @param {string} filename
 * @returns {string}
 */
function getFilePath(filename) {
  return path.join(process.cwd(), filename);
}

/**
 * @param {string} filename
 * @returns {boolean}
 */
function checkIfFileExists(filename) {
  return fs.existsSync(getFilePath(filename));
}

if (!checkIfFileExists('plugin.json') || !checkIfFileExists('package.json')) {
  console.log('Current working directory is not the root of the plugin');
  process.exit();
}

const js = checkIfFileExists('index.js');
const ts = checkIfFileExists('index.ts');

if (!js && !ts) {
  console.log('Current working directory does not contain `index.js` or `index.ts`');
  process.exit();
}

/** @type {PluginManifest} */
const pluginJson = JSON.parse(fs.readFileSync(getFilePath('plugin.json'), 'utf8'));

if (!PLUGIN_ID_REGEX.test(pluginJson.ID)) {
  console.log('`ID` field in plugin.json is not a valid UUID');
  process.exit();
}

const pluginDirName = pluginJson.Name.replace(/[^a-z0-9]/gi, '_') + '-' + pluginJson.ID;
const pluginDir = path.join(process.env.APPDATA, 'FlowLauncher', 'Plugins', pluginDirName);
if (!fs.existsSync(pluginDir)) {
  fs.mkdirSync(pluginDir);
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `flow-launcher-extended-jsts-plugin-${pluginJson.ID}-`));

/**
 * @param {string} filepath
 * @returns {string}
 */
function getShortFilePath(filepath) {
  return filepath
    .replace(process.cwd(), '')
    .replace(tempDir, '')
    .replace(path.resolve(process.env.APPDATA), '')
    .slice(1);
}

/**
 * @param {string} filepath
 * @returns {Promise<void>}
 */
async function deleteFile(filepath) {
  try {
    await fs.promises.unlink(filepath);
  } catch (err) {
    if (err) {
      if (err.code === 'EBUSY' || err.code === 'EACCES') {
        console.log(`File locked, retrying later: ${getShortFilePath(filepath)}`);
        addToRetryQueue({type: 'delete', dest: filepath});
      } else if (err.code !== 'ENOENT') {
        console.error(`Error deleting file: ${getShortFilePath(filepath)}`, err);
      }
    } else {
      console.log('Deleted file:', getShortFilePath(filepath));
    }
  }
}

/**
 * @param {string} src
 * @param {string} dest
 * @returns {Promise<void>}
 */
async function copyFile(src, dest) {
  try {
    await fs.promises.copyFile(src, dest);
    console.log('Copied file:', getShortFilePath(src), '->', getShortFilePath(dest));
  } catch (err) {
    if (err.code === 'EBUSY' || err.code === 'EACCES') {
      console.log(`File locked, retrying later: ${getShortFilePath(dest)}`);
      addToRetryQueue({type: 'copy', src, dest});
    } else {
      console.error(`Error copying file: ${getShortFilePath(src)} -> ${getShortFilePath(dest)}`, err);
    }
  }
}

/**
 * @param {WatchEventType} eventType
 * @param {string} srcPath
 * @param {string} destPath
 * @returns {Promise<void>}
 */
async function watcherHandler(eventType, srcPath, destPath) {
  if (eventType === 'rename') {
    try {
      await fs.promises.access(srcPath, fs.constants.F_OK);
      await copyFile(srcPath, destPath);
    } catch {
      await deleteFile(destPath);
    }
  } else if (eventType === 'change') {
    await copyFile(srcPath, destPath);
  }
}
const tempWatcher = fs.watch(tempDir, {recursive: true}, async (eventType, filePath) => {
  if (!filePath) return;
  const srcPath = path.join(tempDir, filePath);
  const destPath = path.join(pluginDir, filePath);

  await watcherHandler(eventType, srcPath, destPath);
});

/**
 * @param {string | null | undefined} filepath
 * @returns {boolean}
 */
function checkIfSourceFileShouldBeCopied(filepath) {
  if (!filepath) return false;
  if (filepath.includes('node_modules')) return false;
  const fileName = path.basename(filepath).toLowerCase();
  return COPIABLE_FILES.includes(fileName) || IMAGE_REGEX.test(fileName);
}

const sourceWatcher = fs.watch(process.cwd(), {recursive: true}, async (eventType, filePath) => {
  if (!filePath) return;
  if (!checkIfSourceFileShouldBeCopied(filePath)) return;
  const srcPath = path.join(process.cwd(), filePath);
  const destPath = path.join(pluginDir, filePath);

  await watcherHandler(eventType, srcPath, destPath);
});

/**
 * Copies the static plugin files to `FlowLauncher/Plugins/PluginName`. These files include:
 * * `plugin.json`
 * * `SettingsTemplate.yaml`
 * * `LICENSE`
 * * image files
 * @returns {Promise<void>}
 */
async function initialSync() {
  const cwd = process.cwd();
  const files = await fs.promises.readdir(cwd, {recursive: true});
  for (const file of files) {
    if (!checkIfSourceFileShouldBeCopied(file)) continue;
    const srcPath = path.join(cwd, file);
    const destPath = path.join(pluginDir, file);
    await copyFile(srcPath, destPath);
  }
}

initialSync();

/**
 * @type {esbuild.BuildContext}
 */
let context;
esbuild
  .context({
    entryPoints: [
      getFilePath(js ? 'index.js' : 'index.ts'),
    ],
    bundle: true,
    target: 'ES2015',
    outdir: tempDir,
    platform: 'node',
    format: 'esm',
    minify: !true,
  })
  .then(v => {
    context = v;
    return v.watch();
  })
  .catch(_ => process.exit(1));

let cleanedUp = false;

/**
 * Cleans up all intervals, file watchers, and deletes the temporary directory.
 * @returns {void}
 */
function cleanup() {
  if (cleanedUp) return;
  cleanedUp = true;
  clearInterval(retryInterval);
  tempWatcher.close();
  sourceWatcher.close();
  context.dispose();
  fs.rmdirSync(tempDir, {recursive: true});
}

process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit();
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit();
});
process.on('uncaughtException', (err) => {
  cleanup();
  process.exit(1);
});
