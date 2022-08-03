const inquirer = require('inquirer')
const colors = require('colors/safe')
const commander = require('commander')
const fs = require('fs')
const path = require('path')
const templateGenerator = require('./template')
const cp = require('child_process')
const conf = require('../config')

// Commandline input for different argument input
commander
  .usage('[OPTIONS]')
  // name argument
  .requiredOption('--name <value>', 'Input Package name')
  // description for the package
  .option('--description', 'Sets Description for the package', ' Test Description ')
  // when this is set, we add on webpack bundling
  .option('--js', 'Sets Flag if the web bundler is needed for js')
  // setup reactjs package
  .option('--react', 'Sets flag if the package is react based')
  // setup vuejs package
  .option('--vue', 'Sets flag if the package is vuejs based') // currently this feature is not added yet
  .option('--yes', 'Forces to use CLI args and not prompt again to user')
  // if neither of react, js, vue is set, it would consider it as node package
  .parse(process.argv)

const options = commander.opts()

options.withBundler = options.js || options.react

// Just a wrapper for fs writeFile
function fileWritter (baseDir, fileName, content) {
  return fs.writeFileSync(path.join(baseDir, fileName), `${content}\n`, { encoding: 'utf8' })
}

// This sets up / make the necessary directories required under the package
function dirSetup (baseDir, withBundler) {
  if (fs.existsSync(baseDir)) return new Error(colors.red('Package already exist'))
  fs.mkdirSync(baseDir)
  fs.mkdirSync(path.join(baseDir, withBundler ? 'src' : 'lib'))
  fs.mkdirSync(path.join(baseDir, '__tests__'))
}

// This is for converting the Kebab-case name into CamelCase name
function toCamelCase (inp) {
  return inp.replace(/-\w/g, clearAndUpper)
}
// This is for converting the Kebab-case name into PascalCase name
function toPascalCase (inp) {
  return inp.replace(/(^\w|-\w)/g, clearAndUpper)
}

function clearAndUpper (inp) {
  return inp.replace(/-/, '').toUpperCase()
}

// Template file generator
function dirFileSetup (baseDir, name, fileName, description, withBundler, withReact) {
  fileWritter(
    path.join(baseDir, withBundler ? 'src' : 'lib'),
    `${fileName}.js${withReact ? 'x' : ''}`,
    templateGenerator.writeFile(fileName, withReact),
  )
  fileWritter(
    path.join(baseDir, '__tests__'),
    `${fileName}.test.js`,
    templateGenerator.writeTest(name, fileName, withReact, withBundler),
  )
  fileWritter(
    baseDir,
    'jest.config.js',
    templateGenerator.writeJestConf(name, withBundler),
  )
  fileWritter(
    baseDir,
    'babel.config.js',
    templateGenerator.writeBabelConf(name),
  )
  fileWritter(
    baseDir,
    'README.md',
    templateGenerator.writeReadme(name, fileName, description, withBundler),
  )
}

function setupStoryTemplate (baseDir, pkgName, name, desc) {
  const storyDir = path.join(baseDir, '__stories__')
  fs.mkdirSync(storyDir)
  fileWritter(
    storyDir,
    `${name}.stories.mdx`,
    templateGenerator.writeStory(pkgName, name, desc),
  )
}

// The main init function to handle the user inputs
function init (answers) {
  console.log(`\n${colors.green('INFO')} Package Setup Initiated ...\n`)
  const project = {}
  project.name = `${conf.SCOPE}/${answers.name}`
  project.version = '0.0.0' // default version, this when publish update the version to `1.0.0`
  project.description = answers.description
  project.author = 'Muthu Kumaran R <rsmuthu@duck.com>' // need to confirm on this
  project.homepage = '' // Update it once we have our storybook built
  project.keywords = []
  project.license = 'MIT' // defaulting to MIT license for all packages

  const withBundler = answers.type !== 'node'
  const isReact = answers.type === 'react'
  const filename = isReact ? toPascalCase(answers.name) : toCamelCase(answers.name)
  let repo

  // package setup for ESM modules .. will connect to bundler
  project.main = `${withBundler ? 'dist' : 'lib'}/${filename}.js`
  project.directories = {
    lib: withBundler ? 'dist' : 'lib',
    test: '__tests__',
  }
  project.files = [withBundler ? 'dist' : 'lib']
  try {
    repo = cp.execSync('git config --get remote.origin.url', { encoding: 'utf8' }).toString().split('\n')[0]
  } catch (e) {
    throw new Error(colors.red('Please check if remote origin is configured'))
  }
  project.repository = {
    type: 'git',
    url: repo,
  }
  project.publishConfig = {
    registry: conf.REGISTRY, // this url is the proxy registry i triggered
  }
  project.scripts = templateGenerator.scriptList(withBundler, `${filename}.js${isReact ? 'x' : ''}`)

  const baseDir = path.join('packages', answers.type, answers.name)

  // Directory setup is triggered
  dirSetup(baseDir, withBundler)
  console.log(`${colors.green.bold('✓ SUCCESS')} Directory Setup ... done !`)

  // Files setup from the template
  dirFileSetup(baseDir, project.name, filename, answers.description, withBundler, isReact)
  console.log(`${colors.green.bold('✓ SUCCESS')} Minimal template files setup ... done !`)

  // write down the template to package.json file
  fileWritter(baseDir, 'package.json', JSON.stringify(project, null, 2))

  console.log(`\n${colors.green('INFO')} Please Wait while linking packages ...`)
  if (withBundler) {
    // Setup the webpack bundler
    fileWritter(
      baseDir,
      'webpack.config.js',
      templateGenerator.writeBundler(filename, isReact),
    )
    const dependencies = templateGenerator.pkgDependencies(isReact)
    const installOpts = { dependencies: '', devDependencies: '--save-dev', peerDependencies: '--save-peer' }
    for (const type in dependencies) {
      if (dependencies[type].length) {
        const child = cp.spawnSync(
          'npm', ['i', installOpts[type], ...dependencies[type]], {
            stdio: 'inherit',
            encoding: 'utf-8',
            cwd: path.join(process.cwd(), baseDir),
          },
        )
        if (child.error || child.stderr) { throw new Error(child.error) }
        project[type] = dependencies[type]
      }
    }
    if (isReact) {
      // Seting up the Storybook for the react package
      setupStoryTemplate(baseDir, project.name, filename, answers.description)
    }

    console.log(`${colors.green.bold('✓ SUCCESS')} Linking required Packages ... done !`)
  }

  console.log(JSON.stringify(project, null, 2), '\n')
  console.log(`${colors.green.bold('✓ SUCCESS')} package.json creation ... done !`)
}

if (options.yes) {
  init({
    description: options.description,
    name: options.name,
    type: options.react ? 'react' : options.js ? 'js' : 'node',
  })
} else {
  inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: `${colors.cyan('> ')}Package Name (scope set to '${conf.SCOPE}' always): `,
      default: options.name,
    },
    {
      type: 'input',
      name: 'description',
      message: `${colors.cyan('> ')}Package Description: `,
      default: options.description,
    },
    {
      type: 'list',
      name: 'type',
      message: `${colors.cyan('> ')}Package type: `,
      choices: ['node', 'js', 'react'],
      default: options.js ? 'js' : options.react ? 'react' : 'node',
    },
  ]).then(init)
}
