export default {
  default: {
    require: [
      'test/acceptance/steps/**/*.js',
      'test/acceptance/support/**/*.js'
    ],
    format: [
      'progress-bar',
      'html:test/acceptance/reports/cucumber-report.html',
      'json:test/acceptance/reports/cucumber-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    parallel: 1,
    dryRun: false,
    failFast: false,
    strict: true,
    worldParameters: {
      apiUrl: process.env.API_BASE_URL || 'http://localhost:3500'
    }
  },
  ci: {
    require: [
      'test/acceptance/steps/**/*.js',
      'test/acceptance/support/**/*.js'
    ],
    format: [
      'progress',
      'json:test/acceptance/reports/cucumber-report.json'
    ],
    parallel: 1,
    strict: true
  }
}
