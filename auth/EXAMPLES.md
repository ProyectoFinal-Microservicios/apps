# Ejemplos de Uso y Salida de Pruebas

## Ejemplo 1: Ejecutar todas las pruebas

```bash
$ npm run test:acceptance

> reto-3-auth@1.0.0 test:acceptance
> cucumber.js

Feature: Autenticación de Usuarios

  Scenario: Registrar un nuevo usuario exitosamente
    ✓ Cuando registro un nuevo usuario con los siguientes datos:
    ✓ Entonces la respuesta debe tener estado 201
    ✓ Y la respuesta debe contener el mensaje "Usuario registrado exitosamente"
    ✓ Y la respuesta debe incluir un token de acceso
    ✓ Y el token debe ser de tipo Bearer
    ✓ Y la estructura de la respuesta debe ser válida según el esquema de registro

  Scenario: Registro fallido - Usuario ya existe
    ✓ Dado que existe un usuario con username "existinguser"
    ✓ Cuando registro un nuevo usuario con los siguientes datos:
    ✓ Entonces la respuesta debe tener estado 409
    ✓ Y la respuesta debe contener el mensaje de error "El usuario o correo ya están registrados"

  Scenario: Login exitoso con username
    ✓ Dado que existe un usuario con credenciales:
    ✓ Cuando inicio sesión con username "loginuser" y contraseña "SecurePass123!"
    ✓ Entonces la respuesta debe tener estado 200
    ✓ Y la respuesta debe incluir un token de acceso
    ✓ Y el token debe ser de tipo Bearer
    ✓ Y la respuesta debe contener información del usuario
    ✓ Y la estructura de la respuesta debe ser válida según el esquema de login

  ... (más escenarios)

Feature: Gestión de Usuarios

  Scenario: Obtener perfil de usuario exitosamente
    ✓ Dado que el servidor está disponible en "http://localhost:3500"
    ✓ Y existe un usuario autenticado con username "authuser" y contraseña "SecurePass123!"
    ✓ Cuando obtengo el perfil del usuario "authuser"
    ✓ Entonces la respuesta debe tener estado 200
    ✓ Y la respuesta debe contener la información del usuario
    ✓ Y la estructura de la respuesta debe ser válida según el esquema de perfil de usuario

  ... (más escenarios)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
25 scenarios (25 passed)
127 steps (127 passed)
1m23s (execution time)
```

## Ejemplo 2: Ejecutar con reporte HTML

```bash
$ npm run test:acceptance:report

> reto-3-auth@1.0.0 test:acceptance:report
> cucumber.js --format html:test/acceptance/reports/cucumber.report.html --format progress-bar

[████████████████████████████████████████] 100%

✓ Reportes generados exitosamente en: test/acceptance/reports/
```

Luego abrir `test/acceptance/reports/cucumber-report.html` en el navegador.

## Ejemplo 3: Ejecutar un feature específico

```bash
$ npx cucumber.js test/acceptance/features/authentication.feature

Feature: Autenticación de Usuarios
  Como usuario del sistema
  Quiero poder registrarme, iniciar sesión y gestionar mi cuenta
  Para acceder a los servicios de la plataforma

  Scenario: Registrar un nuevo usuario exitosamente
    ✓ Given registro un nuevo usuario con los siguientes datos:
    ✓ Entonces la respuesta debe tener estado 201
    ✓ Y la respuesta debe contener el mensaje "Usuario registrado exitosamente"
    ✓ Y la respuesta debe incluir un token de acceso
    ✓ Y el token debe ser de tipo Bearer
    ✓ Y la estructura de la respuesta debe ser válida según el esquema de registro

  ... (5 pasos, 0.123s)

─────────────────────────────────────────
11 scenarios (11 passed)
59 steps (59 passed)
42s (execution time)
```

## Ejemplo 4: Salida de Validación de Esquema Exitosa

```
Scenario: Registrar un nuevo usuario exitosamente
  ✓ Registro completado
  ✓ [Schema Validation] ✓ registerResponseSchema
    - Campo 'message': válido (string)
    - Campo 'user': válido (object)
      - user.id: válido (string/uuid)
      - user.username: válido (string)
      - user.email: válido (email format)
      - user.firstName: válido (string)
      - user.role: válido (enum: user, admin)
      - user.status: válido (enum: active, inactive, suspended)
    - Campo 'access_token': válido (string, minLength: 20)
    - Campo 'token_type': válido (enum: Bearer)
```

## Ejemplo 5: Salida de Validación Fallida

```
Scenario: Registrar un nuevo usuario exitosamente
  ✗ Validación de esquema falló
    
  Error Details:
  - Response did not match schema 'registerResponseSchema'
  - Missing required property: 'access_token'
  - Field 'token_type' should be string but got number
  - Field 'user.role' should be one of [user, admin] but got admin2

  Expected Response Structure:
  {
    "message": "string",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string (email format)",
      "firstName": "string",
      "lastName": "string",
      "phone": "string",
      "role": "user|admin",
      "status": "active|inactive|suspended",
      "createdAt": "ISO 8601 date-time",
      "updatedAt": "ISO 8601 date-time",
      "lastLoginAt": "ISO 8601 date-time|null"
    },
    "access_token": "string (min 20 chars)",
    "token_type": "Bearer",
    "expires_in": "number|null"
  }

  Actual Response:
  {
    "message": "Usuario registrado exitosamente",
    "user": { ... },
    "token_type": 123
  }
```

## Ejemplo 6: Estadísticas de Cobertura

```
Test Execution Summary
═════════════════════════════════════════════

Features Executed:    2
  - Authentication:   1 ✓
  - User Management:  1 ✓

Total Scenarios:      25
  - Passed:           25 ✓
  - Failed:           0
  - Skipped:          0
  - Pending:          0

Total Steps:          127
  - Passed:           127 ✓
  - Failed:           0
  - Skipped:          0
  - Pending:          0

Execution Time:       1m 23s
Average Per Scenario: 3.3s

API Endpoints Covered:
  ✓ POST   /accounts           (Register)
  ✓ POST   /sessions           (Login)
  ✓ POST   /codes              (Password Reset)
  ✓ GET    /accounts/{username}  (Get Profile)
  ✓ PATCH  /accounts/{username}  (Update Profile)
  ✓ PUT    /accounts/{username}  (Change Password)
  ✓ GET    /accounts           (List Users - Admin)
  ✓ DELETE /accounts/{username}  (Delete Account)

HTTP Status Codes Tested:
  ✓ 200 - Success
  ✓ 201 - Created
  ✓ 400 - Bad Request
  ✓ 401 - Unauthorized
  ✓ 403 - Forbidden
  ✓ 404 - Not Found
  ✓ 409 - Conflict

Validations Performed:
  ✓ HTTP Status Validation
  ✓ JSON-Schema Validation (8 schemas)
  ✓ Token Format Validation
  ✓ Email Format Validation
  ✓ Date-Time Format Validation
  ✓ Required Fields Validation
  ✓ Data Type Validation
  ✓ Enum Value Validation
```

## Ejemplo 7: Modo Watch (Desarrollo)

```bash
$ npm run test:acceptance:watch

[nodemon] 3.0.1
[nodemon] to restart at any time, type `rs`
[nodemon] watching path(s): test/acceptance/**
[nodemon] watching extensions: js,json
[nodemon] starting `cucumber.js`

Feature: Autenticación de Usuarios
...
25 scenarios (25 passed)
127 steps (127 passed)

[nodemon] clean exit - waiting for changes before restart

# Cambiar un archivo y automáticamente se re-ejecutan las pruebas
[nodemon] restarting due to changes...
[nodemon] restarting due to changes in test/acceptance/features/authentication.feature
[nodemon] starting `cucumber.js`

Feature: Autenticación de Usuarios
...
```

## Ejemplo 8: Entrada en CI/CD (Headless)

```bash
$ npm run test:acceptance:headless

{"name": "reto-3-auth", "version": "1.0.0", "description": "Servicio de autenticación JWT con Hono"}
[████████████████████████████████████████] 100%

Generating report...

Report generated: test/acceptance/reports/cucumber-report.json

Test Results:
{
  "stats": {
    "scenarios": {"total": 25, "passed": 25, "failed": 0, "skipped": 0},
    "steps": {"total": 127, "passed": 127, "failed": 0, "skipped": 0},
    "duration": {"total": 83456, "unit": "milliseconds"}
  },
  "status": "PASSED",
  "timestamp": "2024-01-15T10:30:45Z"
}
```

## Ejemplo 9: Salida con Error de Conexión

```bash
$ npm run test:acceptance

> reto-3-auth@1.0.0 test:acceptance
> cucumber.js

Feature: Autenticación de Usuarios

  Scenario: Registrar un nuevo usuario exitosamente
    ✗ Connection refused to http://localhost:3500

  Error Details:
  - Unable to connect to API server
  - Host: localhost
  - Port: 3500
  - Error: ECONNREFUSED

  Possible Solutions:
  1. Start the service: npm start
  2. Check if port 3500 is correct: echo $API_BASE_URL
  3. Verify service is running: curl http://localhost:3500/health

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
25 scenarios (0 passed, 25 failed)
127 steps (0 passed, 127 failed)
```

## Ejemplo 10: Datos de Test Reales

### Usuario de Prueba 1
```json
{
  "username": "testuser123",
  "email": "testuser@example.com",
  "password": "SecurePass123!",
  "firstName": "Test",
  "lastName": "User",
  "phone": "+34912345678",
  "role": "user",
  "status": "active"
}
```

### Respuesta de Registro
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "testuser123",
    "email": "testuser@example.com",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+34912345678",
    "role": "user",
    "status": "active",
    "createdAt": "2024-01-15T10:30:45.123Z",
    "updatedAt": "2024-01-15T10:30:45.123Z",
    "lastLoginAt": null
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

---

Estos ejemplos muestran cómo se ve la ejecución real de las pruebas BDD con diferentes escenarios y configuraciones.
