const dedent = require('dedent')

function writeReadme (name, fileName, description, doBundle) {
  return dedent`
    # \`${name}\`

    > ${description}

    ## Usage

    \`\`\`
    ${
      doBundle
      ? `import ${fileName} from '${name}'`
      : `const ${fileName} = require('${name}')`
    }

    // TODO: DEMONSTRATE API
    \`\`\`
  `
}

function writeFile (name, doBundle) {
  return doBundle
    ? dedent`
      export default function ${name} () {
        // TODO
        return <></>
      }
    `
    : dedent`
      'use strict'

      module.exports = ${name}

      function ${name} () {
        // TODO
        return true
      }
  `
}

function writeTest (name, fileName, isReact, doBundle) {
  return doBundle
    ? dedent`
      import ${fileName} from '../src/${fileName}'
      ${isReact
        ? "import { render } from '@testing-library/react'"
        : ''
      }

      describe('${name}', () => {
        it('needs tests', () => {
          // TODO
          ${isReact ? `render(<${fileName} />)` : `${fileName}()`}
        })
      })
    `
    : dedent`
      'use strict'

      const ${fileName} = require('../lib/${fileName}')

      describe('${name}', () => {
        it('needs tests', () => {
          // TODO
          ${fileName}()
        })
      })
    `
}

function writeStory (pkgName, name, description) {
  return dedent`
    <!-- ${name}.stories.mdx -->
    <!-- FYI, please install the MDX extension in VScode if you need syntax support -->

    import { Meta, Story, Canvas } from '@storybook/addon-docs'

    import StoryComponent from '../src/${name}'

    # ${pkgName}
    > ${description}

    <!-- The title prop determines where your story goes in the story list -->
    <Meta title="${name}" component={ StoryComponent } />

    <!-- We create a “template” of how args map to rendering -->
    export const Template = args => <StoryComponent { ...args } />;

    <!-- If you use <Story>, you can only integrate with it -->
    <!-- to see the code on how to use that component, you need to wrap <Story/> under <Canvas/> -->

    <!-- The args you need here will depend on your component -->
    <Canvas>
      <Story
        name="FirstStory"
        argTypes={{}}
        args={{}}
      >
        { Template.bind({}) }
      </Story>
    </Canvas>
  `
}

function writeJestConf (name, isDom) {
  return dedent`
  module.exports = {
    ...require('../../../jest.base.config'),
    displayName: '${name}',
    testEnvironment: '${!isDom ? 'node' : 'jsdom'}',
    collectCoverageFrom: [
      '${isDom ? 'src/**.{js,jsx}' : 'lib/**.js'}',
    ],
    setupFilesAfterEnv: ['../../../jestEnvSetup.js'],
  }
  `
}

function writeBabelConf (name) {
  return dedent`
  module.exports = require('../../../babel.config')
  `
}

function writeBundler (name, isReact) {
  return dedent`
    'use strict'

    const path = require('path')
    // Load the base bundler config
    const config = require('../../../webpack.base.config')(path.resolve(__dirname, 'src', '${name}.js${isReact ? 'x' : ''}'), '${name}.js', '${name}')

    // TODO: if you would like to alter the base configuration
    // - To alter the destination path, change \`config.output.path\`
    // - To alter the destination file, change \`config.output.filename\`
    // - To alter the entry file, change \`config.entry.main\`
    // - By default, the config is set for production, if you want to change it, alter
    // \`config.devtool = 'inline-source-map'\`

    // Before returning, alter the config, if needed for change in base config
    module.exports = config
  `
}

function scriptList (isWebMode, filename) {
  return {
    clean: `rm -rf ${isWebMode ? 'dist' : 'lib'}`,
    prepublish: 'npm run build',
    build: isWebMode ? `webpack ./src/${filename}` : 'echo "add a command for build"',
    test: 'jest --verbose --coverage',
    'lint-js:test': `eslint . --ext js ${isWebMode ? '--ext jsx' : ''}`,
    'lint-js:fix': `eslint . --ext js ${isWebMode ? '--ext jsx' : ''} --fix`,
    ...(isWebMode
      ? {
          'lint-css:test': 'stylelint **/*.css **/*.scss --allow-empty-input',
          'lint-css:fix': 'stylelint **/*.css **/*.scss --fix --allow-empty-input',
        }
      : {}),
  }
}

function pkgDependencies (withReact) {
  return {
    dependencies: [],
    devDependencies: [],
    peerDependencies: (withReact
      ? [
          // react dependencies
          'react@17.0.2',
          'react-dom@17.0.2',
        ]
      : []
    ),
  }
}

module.exports = {
  writeTest,
  writeJestConf,
  writeBabelConf,
  writeFile,
  writeReadme,
  writeStory,
  writeBundler,
  scriptList,
  pkgDependencies,
}
