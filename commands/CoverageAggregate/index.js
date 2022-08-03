// This script is run with assumption that `npm run test` has completed
// That command only generates the test coverage files for aggregating

const colors = require('colors/safe')
const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.join(__dirname, '..', '..')
const REPORTS_DIR_NAME = '.nyc_output'
const PACKAGES_DIR_NAME = 'packages'
const PACKAGE_PATH = path.join(ROOT_DIR, PACKAGES_DIR_NAME)
const REPORTS_DIR_PATH = path.join(ROOT_DIR, REPORTS_DIR_NAME)

const paths = [
  path.join(PACKAGE_PATH, 'node'),
  path.join(PACKAGE_PATH, 'utils'),
  path.join(PACKAGE_PATH, 'js'),
  path.join(PACKAGE_PATH, 'react'),
]

function coverageCopy (packageName, packagePath) {
  const targetDir = path.join(packagePath, 'coverage', 'coverage-final.json')
  if (fs.existsSync(targetDir)) {
    console.log(colors.green('INFO'), `Copying Coverage from '${packageName}' package ...`)
    fs.copyFileSync(targetDir, path.join(
      REPORTS_DIR_PATH, `${packageName}.json`,
    ))
  }
}

function aggregate () {
  console.log(`${colors.green('INFO')} Creating a temp ${REPORTS_DIR_NAME} directory ... `)
  if (!fs.existsSync(REPORTS_DIR_PATH)) {
    fs.mkdirSync(REPORTS_DIR_PATH)
  }

  // Copy the ccoverage from <rootdir> (if the jest is run as global)
  coverageCopy('root', ROOT_DIR)

  // Iterate the package directories to collect the coverage reports
  try {
    paths.forEach((dirPath, idx) => {
      fs.readdirSync(dirPath).forEach((packageName, idx) => {
        const packagePath = path.join(dirPath, packageName)
        if (fs.statSync(packagePath).isDirectory()) {
          coverageCopy(packageName, packagePath)
        }
      })
    })
  } catch (e) {
    console.log(colors.red('ERROR'), 'Failed when aggregating the Reports \n', e)
  }
  console.log(colors.green('DONE'), 'Coverage has been aggregated')
}

aggregate()
