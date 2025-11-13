# Arquitectura de Pruebas de Aceptación BDD

## Descripción General

Este documento describe la arquitectura y diseño de las pruebas de aceptación BDD para el microservicio de autenticación, utilizando Cucumber, Gherkin y JSON-Schema.

## Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                     Archivo Feature (.feature)               │
│  (Escrito en Gherkin - Lenguaje natural especificado)       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cucumber Parser                           │
│  (Parsea Gherkin y mapea steps con implementaciones)        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Step Definitions (.js)                      │
│  (Implementación de cada paso en JavaScript)                │
└──┬──────────────────────────┬──────────────────────────────┘
   │                          │
   ▼                          ▼
┌──────────────────┐    ┌──────────────────────┐
│   API Client     │    │ Schema Validator     │
│  (REST calls)    │    │  (JSON-Schema/AJV)   │
└────────┬─────────┘    └─────────┬────────────┘
         │                        │
         ▼                        ▼
┌──────────────────────────────────────────────┐
│        Microservicio de Autenticación        │
│  (HTTP Server escuchando en puerto 3500)     │
└──────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│              Base de Datos                   │
│  (PostgreSQL con esquema 'auth')             │
└──────────────────────────────────────────────┘
```

## Componentes

### 1. Features (.feature)
**Ubicación**: `test/acceptance/features/`

Archivos en formato Gherkin que describen el comportamiento esperado en lenguaje natural.

#### Características:
- Legibles por stakeholders no técnicos
- Doble propósito: documentación + pruebas
- Idioma: Español (configurado con `# language: es`)

#### Archivos:
- `authentication.feature`: Casos de registro, login, recuperación de contraseña
- `user_management.feature`: Obtener perfil, actualizar, cambiar contraseña, listar usuarios

### 2. Step Definitions
**Ubicación**: `test/acceptance/steps/auth-steps.js`

Implementación en JavaScript de cada uno de los steps definidos en los features.

#### Estructura:
```javascript
Given/When/Then('expresión regex o texto literal', async function(params) {
  // Implementación
})
```

#### Tipos de Steps:
- **Given**: Preparación del estado
- **When**: Acciones
- **Then**: Assertions

### 3. API Client
**Ubicación**: `test/acceptance/support/api-client.js`

Cliente HTTP personalizado que:
- Realiza requests (GET, POST, PUT, PATCH, DELETE)
- Gestiona tokens JWT
- Maneja respuestas JSON automáticamente
- Proporciona interfaz consistente

```javascript
const response = await apiClient.post('/accounts', userData)
// { status: 201, data: {...}, headers: {...} }
```

### 4. Schema Validator
**Ubicación**: `test/acceptance/support/schema-validator.js`

Validador de esquemas JSON usando AJV (Another JSON Schema Validator).

#### Características:
- Compilación de esquemas para optimizar rendimiento
- Validación contra esquemas predefinidos
- Reporte detallado de errores de validación

```javascript
const validation = schemaValidator.validate(response, 'registerResponseSchema')
// { isValid: boolean, errors: [...] }
```

### 5. Esquemas JSON
**Ubicación**: `test/acceptance/schemas/api-schemas.json`

Especificaciones de estructura esperada para cada tipo de respuesta de API.

#### Esquemas Definidos:
```javascript
{
  registerResponseSchema: { /* estructura de registro */ },
  loginResponseSchema: { /* estructura de login */ },
  userProfileSchema: { /* estructura de perfil */ },
  // ... más esquemas
}
```

#### Validaciones Incluidas:
- Campos requeridos
- Tipos de datos
- Formatos (email, date-time, etc.)
- Enumeraciones (role, status)
- Restricciones (minLength, maxLength, etc.)

### 6. Hooks
**Ubicación**: `test/acceptance/support/hooks.js`

Funciones ejecutadas automáticamente en diferentes fases de prueba.

#### Hooks Implementados:
- `BeforeAll`: Inicialización global
- `Before`: Antes de cada escenario
- `After`: Después de cada escenario
- `AfterAll`: Limpieza global

## Flujo de Ejecución

### 1. Inicialización
```
BeforeAll() 
  ↓ Crear directorio de reportes
  ↓ Inicializar Cucumber
```

### 2. Ejecución de Escenario
```
Before()
  ↓ Registrar tiempo de inicio
  ↓ Inicializar contexto de prueba

Antecedentes (si existen)
  ↓ Given steps

Cuerpo del Escenario
  ↓ When steps
  ↓ Then steps

After()
  ↓ Registrar resultado
  ↓ Capturar información de error
  ↓ Generar logs
```

### 3. Generación de Reportes
```
Cucumber Reporter
  ↓ HTML interactivo
  ↓ JSON (para CI/CD)
  ↓ JUnit XML
```

## Contexto Compartido

El objeto `this` en los steps permite compartir estado entre steps del mismo escenario:

```javascript
Given('...' async function() {
  this.userData = { username: 'test' }
})

When('...' async function() {
  const response = await apiClient.post('/accounts', this.userData)
  this.response = response
})

Then('...' function() {
  assert.strictEqual(this.response.status, 201)
})
```

## Manejo de Estado Global

Se mantienen variables globales para datos compartidos entre escenarios:

```javascript
let currentUser          // Usuario actualmente autenticado
let users = {}           // Registro de usuarios creados
let tokens = {}          // Tokens JWT por usuario
let lastResponse         // Última respuesta de API
```

## Validación Multi-Capa

### Capa 1: Status HTTP
```javascript
Then('la respuesta debe tener estado 200', function() {
  assert.strictEqual(lastResponse.status, 200)
})
```

### Capa 2: Estructura
```javascript
Then('la estructura debe ser válida según esquema', function() {
  const validation = schemaValidator.validate(
    lastResponse.data,
    'registerResponseSchema'
  )
  assert(validation.isValid)
})
```

### Capa 3: Datos Específicos
```javascript
Then('contiene username "test"', function() {
  assert.strictEqual(lastResponse.data.user.username, 'test')
})
```

## Integración con CI/CD

### Jenkins
```groovy
stage('BDD Tests') {
  steps {
    sh 'npm install'
    sh 'npm run test:acceptance:headless'
  }
  post {
    always {
      publishHTML([
        reportDir: 'test/acceptance/reports',
        reportFiles: 'cucumber-report.html'
      ])
    }
  }
}
```

### GitHub Actions
```yaml
- name: Run BDD Tests
  run: npm run test:acceptance:headless

- name: Publish Report
  uses: actions/upload-artifact@v2
  with:
    name: cucumber-reports
    path: test/acceptance/reports/
```

## Mejores Prácticas

### 1. Nombres Descriptivos
```gherkin
# ✓ Bueno
Escenario: Registrar un nuevo usuario exitosamente

# ✗ Malo
Escenario: Registro
```

### 2. Un Assertion por Step
```gherkin
# ✓ Bueno
Entonces la respuesta debe tener estado 201
Y la respuesta debe contener un token

# ✗ Malo
Entonces la respuesta debe tener estado 201 y contener un token
```

### 3. Usar Data Tables para Datos Múltiples
```gherkin
# ✓ Bueno
Cuando registro un usuario con:
  | username | email           |
  | user1    | user1@test.com  |
  | user2    | user2@test.com  |

# ✗ Malo
Cuando registro usuarios "user1", "user2"
```

### 4. Reutilizar Steps
```gherkin
# ✓ Bueno (reutilizable)
Dado que existe un usuario con credenciales:

# ✗ Malo (específico)
Dado que existe un usuario con username "test" y email "test@example.com"
```

## Extensibilidad

### Agregar Nuevo Feature

1. Crear archivo `test/acceptance/features/new-feature.feature`
2. Escribir escenarios en Gherkin
3. Implementar steps en `test/acceptance/steps/`
4. Agregar esquemas en `test/acceptance/schemas/api-schemas.json`
5. Ejecutar: `npm run test:acceptance`

### Agregar Nuevo Esquema

```json
{
  "newResponseSchema": {
    "type": "object",
    "required": ["field1", "field2"],
    "properties": {
      "field1": { "type": "string" },
      "field2": { "type": "number" }
    }
  }
}
```

### Agregar Nuevo Step

```javascript
When('acción específica', async function() {
  // Implementación
  lastResponse = await apiClient.post(...)
})

Then('validación específica', function() {
  assert(...)
})
```

## Debugging

### Ver Respuesta Completa
```javascript
When('debug', function() {
  console.log('Response:', JSON.stringify(lastResponse, null, 2))
})
```

### Ejecutar Escenario Específico
```bash
npx cucumber-js -n "Registrar un nuevo usuario exitosamente"
```

### Activar Logs Detallados
```bash
DEBUG=* npm run test:acceptance
```

## Métricas

### Por Ejecución:
- Número de escenarios
- Tasa de éxito
- Tiempo de ejecución
- Cobertura de funcionalidades

### Reportes:
- HTML interactivo
- JSON para automatización
- XML para herramientas CI/CD

## Limitaciones y Consideraciones

1. **Base de datos compartida**: Las pruebas crean datos en la BD real
   - Solución: Usar datos de prueba con prefijo único

2. **Orden de ejecución**: Cucumber puede ejecutar escenarios en cualquier orden
   - Solución: Cada escenario es independiente

3. **Tiempo de ejecución**: Las pruebas completas pueden ser lentas
   - Solución: Usar `npm run test:acceptance:watch` en desarrollo

4. **Seguridad**: No probar contraseñas reales en CI/CD
   - Solución: Usar credenciales de prueba diferenciadas

## Referencias

- [Cucumber.js](https://cucumber.io/docs/cucumber/)
- [Gherkin](https://cucumber.io/docs/gherkin/)
- [JSON Schema](https://json-schema.org/)
- [AJV](https://ajv.js.org/)
- [BDD Principles](https://cucumber.io/docs/bdd/)
