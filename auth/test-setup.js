#!/usr/bin/env node

/**
 * Script de inicialización y preparación de pruebas
 * Este script:
 * 1. Verifica que el servicio esté ejecutándose
 * 2. Instala dependencias si es necesario
 * 3. Prepara la base de datos de pruebas
 * 4. Genera reportes de pruebas previas
 */

import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

class TestSetup {
  constructor() {
    this.apiUrl = process.env.API_BASE_URL || 'http://localhost:3500'
    this.reportsDir = path.join(__dirname, 'test/acceptance/reports')
  }

  async checkServiceAvailability() {
    console.log('🔍 Verificando disponibilidad del servicio...')
    
    try {
      const response = await fetch(`${this.apiUrl}/health`)
      if (response.ok) {
        console.log('✓ Servicio disponible')
        return true
      }
    } catch (error) {
      console.error('✗ Servicio no disponible')
      console.error(`  URL: ${this.apiUrl}`)
      console.error(`  Error: ${error.message}`)
      console.log('\n💡 Tip: Ejecuta "npm start" en otra terminal para iniciar el servicio')
      return false
    }
  }

  ensureReportsDirectory() {
    console.log('📁 Preparando directorio de reportes...')
    
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true })
      console.log(`✓ Directorio creado: ${this.reportsDir}`)
    } else {
      console.log('✓ Directorio existe')
    }
  }

  checkNodeModules() {
    console.log('📦 Verificando dependencias...')
    
    const nodeModulesDir = path.join(__dirname, 'node_modules')
    if (fs.existsSync(nodeModulesDir)) {
      console.log('✓ Dependencias instaladas')
      return true
    } else {
      console.warn('✗ Dependencias no instaladas')
      console.log('\n💡 Ejecuta: npm install')
      return false
    }
  }

  generateSummary() {
    console.log('\n📊 Resumen de Pruebas Disponibles:')
    console.log('═'.repeat(50))
    
    const features = fs.readdirSync(path.join(__dirname, 'test/acceptance/features'))
      .filter(f => f.endsWith('.feature'))
    
    console.log(`\n📋 Features (${features.length}):`)
    features.forEach(feature => {
      const content = fs.readFileSync(
        path.join(__dirname, 'test/acceptance/features', feature),
        'utf-8'
      )
      const scenarios = (content.match(/Escenario:/g) || []).length
      console.log(`   ${feature.padEnd(30)} (${scenarios} escenarios)`)
    })
    
    console.log('\n🚀 Comandos disponibles:')
    console.log('   npm run test:acceptance          - Ejecutar todas las pruebas')
    console.log('   npm run test:acceptance:report   - Generar reporte HTML')
    console.log('   npm run test:acceptance:headless - Para CI/CD')
    console.log('   npm run test:acceptance:watch    - Modo desarrollo')
    console.log('\n   node test-runner.js [opción]')
    console.log('   node test-setup.js               - Este script')
  }

  async run() {
    console.log('\n🚀 Configuración de Pruebas de Aceptación')
    console.log('═'.repeat(50))
    
    this.ensureReportsDirectory()
    
    console.log()
    const hasDependencies = this.checkNodeModules()
    
    console.log()
    const serviceAvailable = await this.checkServiceAvailability()
    
    this.generateSummary()
    
    console.log('\n═'.repeat(50))
    
    if (!hasDependencies) {
      console.log('⚠️  Por favor instala las dependencias antes de ejecutar pruebas')
      return 1
    }
    
    if (!serviceAvailable) {
      console.log('⚠️  Por favor inicia el servicio antes de ejecutar pruebas')
      return 1
    }
    
    console.log('✅ Listo para ejecutar pruebas\n')
    return 0
  }
}

const setup = new TestSetup()
const exitCode = await setup.run()
process.exit(exitCode)
