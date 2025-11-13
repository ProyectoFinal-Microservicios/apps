# Pruebas de Aceptación - Microservicio de Autenticación

Este directorio contiene las pruebas de aceptación BDD (Behavior-Driven Development) para el microservicio de autenticación, utilizando **Cucumber**, **Gherkin** y validación de esquemas JSON con **JSON-Schema** (AJV).

## Estructura del Proyecto

```
test/acceptance/
├── features/                 # Archivos de features en Gherkin
│   ├── authentication.feature    # Casos de prueba de autenticación
│   └── user_management.feature   # Casos de prueba de gestión de usuarios
├── steps/                    # Implementación de steps de Cucumber
│   └── auth-steps.js         # Steps definitions para autenticación y usuarios
├── schemas/                  # Esquemas JSON para validación
│   └── api-schemas.json      # Esquemas de validación de respuestas API
├── support/                  # Archivos de soporte
│   ├── api-client.js         # Cliente HTTP para hacer requests a la API
│   └── schema-validator.js   # Validador de esquemas JSON
└── reports/                  # Reportes de ejecución (generados)
```

## Configuración

### 1. Instalar Dependencias

```bash
npm install
```

Las dependencias de prueba incluyen:
- `@cucumber/cucumber`: Framework BDD
- `ajv`: Validador de JSON-Schema
- `ajv-formats`: Extensión de AJV para formatos especiales
- `nodemon`: Para desarrollo con auto-reload

### 2. Variables de Entorno

Crear un archivo `.env` en la raíz del microservicio (si no existe):

```env
# Base URL del API (por defecto es http://localhost:3500)
API_BASE_URL=http://localhost:3500

# Base de datos
DATABASE_URL=postgresql://user:password@localhost/auth_db
DB_SCHEMA=auth

# JWT
JWT_SECRET=mi_secreto_super_seguro
TOKEN_EXP=1h

# RabbitMQ
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

# Consul
CONSUL_HOST=consul
CONSUL_PORT=8500
```

## Ejecución de Pruebas

### Ejecutar todas las pruebas

```bash
npm run test:acceptance
```

### Ejecutar en modo observador (desarrollo)

```bash
npm run test:acceptance:watch
```

### Ejecutar sin UI interactiva (CI/CD)

```bash
npm run test:acceptance:headless
```

### Generar reporte HTML

```bash
npm run test:acceptance:report
```

El reporte será generado en `test/acceptance/reports/cucumber-report.html`

## Funcionalidades de las Pruebas

### 1. Autenticación (authentication.feature)

#### Registro de Usuarios
- ✓ Registrar un nuevo usuario exitosamente
- ✓ Validar estructura de respuesta con JSON-Schema
- ✓ Validar token JWT
- ✓ Validación de datos duplicados (username/email)
- ✓ Validación de formato de email
- ✓ Validación de contraseña mínima

#### Inicio de Sesión
- ✓ Login exitoso con username
- ✓ Login exitoso con email
- ✓ Validación de token en login
- ✓ Fallo con usuario no existe
- ✓ Fallo con contraseña incorrecta

#### Recuperación de Contraseña
- ✓ Solicitar código de recuperación
- ✓ Seguridad: no revelar si email existe

### 2. Gestión de Usuarios (user_management.feature)

#### Perfil de Usuario
- ✓ Obtener perfil propio
- ✓ Obtener perfil de otro usuario (con autorización)
- ✓ Validar autorización
- ✓ Validar autenticación requerida

#### Actualizar Perfil
- ✓ Actualizar todos los campos
- ✓ Actualizar solo algunos campos
- ✓ Validar que no hay cambios duplicados
- ✓ Validar estructura de respuesta

#### Cambiar Contraseña
- ✓ Cambiar contraseña exitosamente
- ✓ Validar contraseña actual
- ✓ Validar requisitos de nueva contraseña
- ✓ Verificar que pueda iniciar sesión con nueva contraseña

#### Listar Usuarios (Admin)
- ✓ Listar con paginación
- ✓ Listar con búsqueda
- ✓ Validar permisos de administrador
- ✓ Validar estructura de respuesta

#### Eliminar Cuenta
- ✓ Eliminar cuenta propia
- ✓ Eliminar cuenta de otro usuario (solo admin)
- ✓ Validar que usuario eliminado no pueda iniciar sesión

## Validación de Esquemas JSON

Cada respuesta de la API es validada contra esquemas JSON-Schema definidos en `schemas/api-schemas.json`:

### Esquemas Disponibles

1. **registerResponseSchema**: Valida respuesta de registro
   - Campos requeridos: `message`, `user`, `access_token`, `token_type`
   - Validación de estructura del usuario
   - Validación de formato de token

2. **loginResponseSchema**: Valida respuesta de login
   - Campos requeridos: `access_token`, `token_type`, `user`
   - Validación de información del usuario
   - Validación de expiración del token

3. **userProfileSchema**: Valida perfil de usuario
   - Campos requeridos del usuario
   - Validación de formato de email
   - Validación de enumeraciones (role, status)

4. **updateProfileResponseSchema**: Valida actualización de perfil
   - Estructura de usuario actualizado
   - Validación de campos opcionales

5. **changePasswordResponseSchema**: Valida cambio de contraseña
   - Estructura de confirmación

6. **passwordResetCodeSchema**: Valida solicitud de código
   - Mensaje de confirmación

7. **usersListSchema**: Valida listado de usuarios
   - Array de usuarios
   - Información de paginación (total, page, limit)

8. **errorResponseSchema**: Valida respuestas de error
   - Estructura de error

## Ejemplos de Uso

### Ejecutar un archivo de features específico

```bash
npx cucumber-js test/acceptance/features/authentication.feature
```

### Ejecutar un escenario específico

```bash
npx cucumber-js test/acceptance/features/authentication.feature -n "Registrar un nuevo usuario exitosamente"
```

### Ejecutar con formato verbose

```bash
npx cucumber-js --format progress
```

## Estructura de un Escenario (Feature)

Todos los features están escritos en español usando el formato Gherkin:

```gherkin
# language: es
Característica: Descripción de la funcionalidad
  Como [rol]
  Quiero [acción]
  Para [beneficio]

  Escenario: Descripción específica
    Dado [precondición]
    Cuando [acción]
    Entonces [resultado esperado]
```

### Tipos de Steps

- **Given (Dado)**: Configura el estado inicial
- **When (Cuando)**: Realiza una acción
- **Then (Entonces)**: Valida el resultado
- **And**: Continúa el step anterior

## Validaciones Incluidas

### 1. Validación HTTP Status
```javascript
Entonces la respuesta debe tener estado 200
```

### 2. Validación de Mensaje
```javascript
Entonces la respuesta debe contener el mensaje "Usuario registrado exitosamente"
```

### 3. Validación de Token
```javascript
Entonces la respuesta debe incluir un token de acceso
Y el token debe ser de tipo Bearer
```

### 4. Validación de Esquema
```javascript
Entonces la estructura de la respuesta debe ser válida según el esquema de registro
```

### 5. Validación de Datos
```javascript
Entonces la respuesta debe contener información del usuario
Y la respuesta debe contener firstName como "TestUpdated"
```

## Reportes de Pruebas

Después de ejecutar las pruebas, se generan los siguientes reportes en `test/acceptance/reports/`:

- `cucumber-report.html`: Reporte visual interactivo
- `cucumber-report.json`: Reporte en formato JSON (para integración CI/CD)
- `cucumber-report.xml`: Reporte en formato JUnit XML

## Integración CI/CD

Para integrar con pipelines CI/CD (Jenkins, GitHub Actions, GitLab CI):

```bash
npm run test:acceptance:headless
```

Luego incluir el archivo `test/acceptance/reports/cucumber-report.xml` en la configuración del reporte.

## Requisitos Previos

### Para ejecutar las pruebas:

1. **Node.js 18+**
2. **El microservicio de autenticación debe estar ejecutándose**
3. **Base de datos PostgreSQL debe estar disponible**
4. **RabbitMQ debe estar ejecutándose** (para eventos)

### Iniciar el microservicio localmente

```bash
# En la raíz del microservicio
npm install
npm start
```

## Solución de Problemas

### Error: Cannot find module '@cucumber/cucumber'

Solución: Ejecutar `npm install` para instalar dependencias de desarrollo.

### Error: Connection refused to http://localhost:3500

Solución: Verificar que el microservicio está ejecutándose en puerto 3500.

### Error: Database connection error

Solución: Verificar que PostgreSQL está ejecutándose y las credenciales en `.env` son correctas.

### Validación de esquema falla

Solución: Verificar que la respuesta de la API coincide con el esquema esperado en `schemas/api-schemas.json`.

## Mejores Prácticas

1. **Ejecutar antes de hacer commit**: `npm run test:acceptance`
2. **Actualizar features cuando se cree nueva funcionalidad**
3. **Mantener los esquemas JSON sincronizados con el API**
4. **Usar nombres descriptivos en los steps**
5. **Separar lógica de validación en la capa de validación de esquemas**

## Referencias

- [Cucumber.js Documentation](https://cucumber.io/docs/cucumber/)
- [Gherkin Reference](https://cucumber.io/docs/gherkin/)
- [JSON Schema Documentation](https://json-schema.org/)
- [AJV Documentation](https://ajv.js.org/)
