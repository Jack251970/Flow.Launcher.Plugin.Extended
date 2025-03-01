import { intro, outro, select, text, confirm, isCancel, cancel } from '@clack/prompts';

import path from 'node:path';
import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import process from 'node:process';

intro('Welcome to the Flow Launcher plugin generator!');

const pluginLocation = await text({
  message: 'Where would you like to create the plugin?',
  placeholder: 'my-new-plugin',
  validate(input) {
    if (!input) return 'Please enter a location';
    if (!path.resolve(process.cwd(), input)) return 'Please enter a valid location';
  },
});

if (isCancel(pluginLocation)) {
  cancel("The plugin creation has been cancelled.");
  process.exit(0);
}

const fullPath = path.resolve(process.cwd(), pluginLocation);

if (existsSync(pluginLocation) && (await fs.readdir(fullPath)).length > 0) {
  const directoryNotEmptyConfirmation = await confirm({
    message: 'The directory is not empty. Data may be deleted or overwritten if you decide to continue. Are you sure?',
    active: 'Yes, continue',
    inactive: 'No, cancel',
  });

  if (isCancel(directoryNotEmptyConfirmation) || !directoryNotEmptyConfirmation) {
    cancel("The plugin creation has been cancelled.");
    process.exit(0);
  }
}

const pluginName = await text({
  message: 'What is the name of the plugin?',
  placeholder: 'My Plugin',
  validate(input) {
    if (!input.trim()) return 'Please enter a name';
  },
});

if (isCancel(pluginName)) {
  cancel("The plugin creation has been cancelled.");
  process.exit(0);
}

const pluginActionKeyword = await text({
  message: 'Action keyword used to trigger the plugin. Leave it empty to allow your plugin to be triggered without a keyword.',
  placeholder: 'mp',
  initialValue: 'mp',
  defaultValue: '*',
});

if (isCancel(pluginActionKeyword)) {
  cancel("The plugin creation has been cancelled.");
  process.exit(0);
}

const pluginLanguage = await select({
  message: 'Which language would you like to use?',
  options: [
    {value: 'js', label: 'JavaScript'},
    {value: 'ts', label: 'TypeScript'},
  ],
  initialValue: 'ts',
});

if (isCancel(pluginLanguage)) {
  cancel("The plugin creation has been cancelled.");
  process.exit(0);
}

const pluginDescription = await text({
  message: 'Plugin description',
  placeholder: 'My awesome plugin',
  validate(input) {
    if (!input.trim()) return 'Please enter a description';
  },
});

if (isCancel(pluginDescription)) {
  cancel("The plugin creation has been cancelled.");
  process.exit(0);
}

const pluginAuthor = await text({
  message: 'Author',
  placeholder: 'John Doe',
  validate(input) {
    if (!input.trim()) return 'Please enter an author';
  },
});

if (isCancel(pluginAuthor)) {
  cancel("The plugin creation has been cancelled.");
  process.exit(0);
}

const pluginLicense = await select({
  message: 'Which license would you like to use?',
  options: [
    {value: 'mit', label: 'MIT License'},
    {value: 'apache', label: 'Apache License 2.0'},
    {value: 'bsd', label: 'BSD-3-Clause License'},
    {value: 'isc', label: 'ISC License'},
    {value: 'no', label: 'None', hint: 'You can add your own license later'},
  ],
});

if (isCancel(pluginLicense)) {
  cancel("The plugin creation has been cancelled.");
  process.exit(0);
}

outro(`The plugin has been created successfully. Happy coding!`);
