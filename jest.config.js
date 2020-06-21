
module.exports = {
  expand: true,

  forceExit: true,

  collectCoverageFrom: [
    'lib/**/*.js'
  ],

  moduleNameMapper: {
    'package([0-9])(.*)$': '<rootDir>/lib/__mocks__/package$1$2',
    'package-([0-9])(.*)$': '<rootDir>/lib/__mocks__/node_modules/package-$1$2',
    'nuxt': '<rootDir>/lib/__mocks__/node_modules/nuxt',
  },
}
