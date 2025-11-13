import { BeforeAll, AfterAll, Before, After, Status } from '@cucumber/cucumber'
import fs from 'fs'
import path from 'path'

// Crear directorio de reportes si no existe
BeforeAll(async function() {
  const reportsDir = path.resolve('test/acceptance/reports')
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }
  console.log('[Test Setup] Directorio de reportes creado/verificado')
})

// Hook ejecutado antes de cada escenario
Before(async function() {
  this.startTime = new Date()
  console.log(`[Test Started] Iniciando escenario: ${this.pickle.name}`)
})

// Hook ejecutado después de cada escenario
After(async function(scenario) {
  const endTime = new Date()
  const duration = endTime - this.startTime
  
  if (scenario.result.status === Status.PASSED) {
    console.log(`[Test Passed] ${scenario.pickle.name} (${duration}ms)`)
  } else if (scenario.result.status === Status.FAILED) {
    console.error(`[Test Failed] ${scenario.pickle.name}`)
    console.error(`Error: ${scenario.result.message}`)
  } else if (scenario.result.status === Status.SKIPPED) {
    console.warn(`[Test Skipped] ${scenario.pickle.name}`)
  }
})

// Hook para capturar screenshots o logs en caso de error
After(async function(scenario) {
  if (scenario.result.status === Status.FAILED) {
    // Aquí podrías capturar información adicional para debugging
    console.error('--- Debug Information ---')
    console.error('Último Response Status:', this.lastResponse?.status)
    console.error('Último Response Data:', JSON.stringify(this.lastResponse?.data, null, 2))
  }
})

AfterAll(async function() {
  console.log('[Test Complete] Todas las pruebas han finalizado')
})

export default {}
