const path = require(`path`)
const fs = require(`fs`)
const glob = require(`glob`)
const Stryker = require(`@stryker-mutator/core`).default
const defaultBabelOptions = require(`../.babelrc`)
const defaultJestConfig = require(`../jest.config`)

function resolvePkg(pkg) {
  const pkgPath = path.resolve(`./packages/${pkg}`)
  if (!fs.existsSync(pkgPath)) {
    throw new Error(`Could not find package: ${pkg}`)
  }
  return pkgPath
}

function resolveBabelRc(pkgPath) {
  if (fs.existsSync(path.join(pkgPath, `.babelrc`))) {
    return path.resolve(pkgPath, `.babelrc`)
  }
  return null
}

function resolveFilesToMutate(pkgPath) {
  const ignoredDirectories = [
    `__tests__`,
    `__testfixtures__`,
    `__mocks__`,
    `node_modules`,
    `dist`,
    `cache-dir`,
  ].join(`,`)
  const ignore = `**/{${ignoredDirectories}}/**`
  const src = path.join(pkgPath, `src`)
  const cwd = fs.existsSync(src) ? src : pkgPath
  const files = glob.sync(`**/!(lazy-fields).js`, { cwd, ignore })
  return files.map(file => path.resolve(cwd, file))
}

function resolveBabelConfig(pkgPath) {
  const optionsFile = resolveBabelRc(pkgPath)
  const options = optionsFile ? {} : defaultBabelOptions
  return {
    optionsFile,
    options: Object.assign({}, options, {
      ignore: [
        `**/node_modules/**`,
        `**/__tests__/**`,
        `**/__testfixtures__/**`,
        `**/__mocks__/**`,
        `**/dist/**`,
        `**/cache-dir/**`,
      ],
    }),
  }
}

function resolveContext(pkg) {
  const pkgPath = resolvePkg(pkg)
  const mutate = resolveFilesToMutate(pkgPath)
  const babel = resolveBabelConfig(pkgPath)
  const files = [
    `${pkgPath}/**/*`,
    `${pkgPath}/**/.*`,
    `packages/gatsby/**`,
    `packages/gatsby/**/.*`,
    `jest-transformer.js`,
  ]
  return { pkg, pkgPath, babel, mutate, files }
}

function createConfig({ mutate, babel, files, pkg }) {
  return {
    mutate,
    babel,
    files,
    mutator: `javascript`,
    testRunner: `jest`,
    reporters: [`html`, `progress`],
    htmlReporter: { baseDir: `mutation/${pkg}` },
    coverageAnalysis: `off`,
    transpilers: [`babel`],
    timeoutMS: 60000,
    logLevel: `fatal`,
    jest: {
      config: Object.assign({}, defaultJestConfig, { notify: false }),
    },
  }
}

async function mutate(pkg) {
  try {
    console.log(`-> package: ${pkg}`)
    const context = resolveContext(pkg)
    const config = createConfig(context)
    console.log(`Found ${context.mutate.length} source file(s) to mutate`)
    const stryker = new Stryker(config)
    const result = await stryker.runMutationTest()
    if (!result.length) {
      console.log(`It's a mutant-free world, nothing to test.`)
    }
    console.log(`\n`)
  } catch (err) {
    console.log(`Error: ${err.message}\n\n`)
  }
}

async function run(packages) {
  for (const pkg of packages) {
    try {
      await mutate(pkg)
    } catch (_) {
      continue
    }
  }
  process.exit(0)
}

const args = process.argv.slice(2)
const packages = fs.readdirSync(`./packages`)

if (!args.length) {
  console.error(
    `Please specify at least one package to mutate (or pass the --all flag)`
  )
  process.exit(1)
} else if (args.includes(`--all`)) {
  run(packages)
} else {
  run(args)
}
