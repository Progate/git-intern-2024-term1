# mygit

## How to run

```bash
# step 1: build the package
npm install
npm run watch

# open another terminal

# step 2: install the mygit package globally for ease of testing
npm -g install .

# open another terminal

# step 3: run the mygit command
mygit
mygit add somefile
mygit commit 'some message'
```

## Run tests

```bash
npm test

# to run the tests in watch mode
npm run test:watch
```

## Linter and Formatter

```bash
# run the linter
npm run lint:check
npm run lint:fix


# run the formatter
npm run format:check
npm run format:fix
```

## publish the package

```bash
# update the patch version
npm version patch
# publish the package to npm
npm publish
```
