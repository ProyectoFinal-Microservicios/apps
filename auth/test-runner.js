#!/usr/bin/env node

/**
 * Script de utilidad para ejecutar las pruebas de aceptación
 * Uso: node test-runner.js [opción]
 * 
 * Opciones:
 *   all          - Ejecutar todas las pruebas
 *   auth         - Ejecutar solo pruebas de autenticación
 *   users        - Ejecutar solo pruebas de gestión de usuarios
 *   report       - Generar reporte HTML
 *   headless     - Ejecutar en modo CI/CD (sin UI)
 *   dev          - Ejecutar en modo desarrollo (con watch)
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const args = process.argv.slice(2)
const option = args[0] || 'all'

const commands = {
  all: 'npx cucumber-js',
  auth: 'npx cucumber-js test/acceptance/features/authentication.feature',
  users: 'npx cucumber-js test/acceptance/features/user_management.feature',
  report: 'npx cucumber-js --format html:test/acceptance/reports/cucumber-report.html --format progress-bar',
  headless: 'npx cucumber-js --format json:test/acceptance/reports/cucumber-report.json --format progress-bar',
  dev: 'npx nodemon --exec "npx cucumber-js"'
}

const descriptions = {
  all: 'Ejecutar todas las pruebas de aceptación',
  auth: 'Ejecutar solo pruebas de autenticación',
  users: 'Ejecutar solo pruebas de gestión de usuarios',
  report: 'Generar reporte HTML interactivo',
  headless: 'Ejecutar en modo CI/CD (JSON + Progress)',
  dev: 'Ejecutar en modo desarrollo con auto-reload'
}

if (!commands[option]) {
  console.error('❌ Opción inválida:', option)
  console.log('\nOpciones disponibles:')
  Object.entries(commands).forEach(([key, cmd]) => {
    console.log(`  ${key.padEnd(12)} - ${descriptions[key]}`)
  })
  console.log('\nEjemplo: node test-runner.js auth')
  process.exit(1)
}

const reportsDir = path.resolve('test/acceptance/reports')
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true })
  console.log('✓ Directorio de reportes creado')
}

console.log(`\n🚀 ${descriptions[option]}...\n`)

try {
  execSync(commands[option], { stdio: 'inherit' })
  console.log(`\n✓ Pruebas completadas exitosamente`)
  
  if (option === 'report' || option === 'headless') {
    console.log(`\n📊 Reportes generados en: ${reportsDir}`)
    if (option === 'report') {
      console.log(`   Abrir: file://${path.join(reportsDir, 'cucumber-report.html')}`)
    }
  }
} catch (error) {
  console.error(`\n❌ Error al ejecutar pruebas`)
  process.exit(1)
}
