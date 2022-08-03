'use strict'

const path = require('path')
// Load the base bundler config
const config = require('../../../webpack.base.config')(path.resolve(__dirname, 'src/SampleButton.jsx'), 'SampleButton.js', 'SampleButton')
// TODO: if you would like to alter the base configuration
// - To alter the destination path, change `config.output.path`
// - To alter the destination file, change `config.output.filename`
// - To alter the entry file, change `config.entry.main`
// - By default, the config is set for production, if you want to change it, alter
// `config.devtool = 'inline-source-map'`

// Before returning, alter the config, if needed for change in base config
module.exports = config
