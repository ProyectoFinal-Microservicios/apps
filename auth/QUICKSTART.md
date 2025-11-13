# Guía Rápida de Pruebas BDD

## 5 Minutos para Empezar

### 1. Verificar Prerequisitos

```bash
# Verifica que Node.js esté instalado (v18+)
node --version

# Verifica que npm esté disponible
npm --version

# Verifica que PostgreSQL esté ejecutándose
# (Necesario para el microservicio)
```

### 2. Instalar Dependencias

```bash
cd apps/auth
npm install
```

### 3. Configurar Variables de Entorno (opcional)

Si el servicio no está en `http://localhost:3500`, crear `.env`:

```env
API_BASE_URL=http://tu-servidor:puerto
```

### 4. Iniciar el Microservicio

En una terminal separada:

```bash
npm start
```

### 5. Ejecutar las Pruebas

```bash
# En la terminal original, en el directorio del microservicio
npm run test:acceptance
```

## Comandos Más Útiles

### Ejecutar Pruebas Específicas

```bash
# Solo autenticación
npm run test:acceptance -- test/acceptance/features/authentication.feature

# Solo gestión de usuarios
npm run test:acceptance -- test/acceptance/features/user_management.feature

# Un escenario específico
npx cucumber-js -n "Registrar un nuevo usuario exitosamente"
```

### Generar Reportes

```bash
# HTML interactivo
npm run test:acceptance:report

# Para CI/CD
npm run test:acceptance:headless
```

### Desarrollo Iterativo

```bash
# Auto-reload al cambiar archivos
npm run test:acceptance:watch
```

### Verificar Setup

```bash
node test-setup.js
```

## Estructura de Archivos

```
apps/auth/
├── test/acceptance/
│   ├── features/              
│   │   ├── authentication.feature
│   │   └── user_management.feature
│   ├── steps/
│   │   └── auth-steps.js      
│   ├── schemas/
│   │   └── api-schemas.json  
│   ├── support/
│   │   ├── api-client.js
│   │   ├── schema-validator.js
│   │   └── hooks.js
│   └── reports/               
├── cucumber.js
├── test-runner.js
├── test-setup.js
└── README.md (este archivo)
```

## Escritura de Pruebas

### Agregar Nuevo Escenario

1. Editar `test/acceptance/features/authentication.feature` (o crear uno nuevo)

```gherkin
Escenario: Mi nuevo caso de prueba
  Cuando realizo una acción
  Entonces ocurre algo esperado
```

2. Ejecutar pruebas - Cucumber sugerirá steps faltantes

3. Implementar steps en `test/acceptance/steps/auth-steps.js`

```javascript
When('realizo una acción', async function() {
  lastResponse = await apiClient.post('/endpoint', data)
})

Then('ocurre algo esperado', function() {
  assert.strictEqual(lastResponse.status, 200)
})
```

4. Agregar validación de esquema si es necesario

## Troubleshooting

### ❌ Error: Cannot find module '@cucumber/cucumber'

```bash
npm install
```

### ❌ Error: Connection refused

```bash
# Verificar que el servicio esté ejecutándose
npm start
```

### ❌ Error: Database connection

```bash
# Verificar credenciales en .env
# Verificar que PostgreSQL esté ejecutándose
```

### ❌ Validación de esquema falla

1. Revisar respuesta real de la API
2. Actualizar esquema en `test/acceptance/schemas/api-schemas.json`
3. Volver a ejecutar pruebas

### ❌ Escenario falla de forma intermitente

- Puede haber concurrencia con bases de datos
- Usar usernames únicos con timestamp:
```javascript
const uniqueUsername = `user_${Date.now()}`
```

## Próximos Pasos

### Ver Reportes HTML

Después de ejecutar `npm run test:acceptance:report`:

```bash
# Windows
start test/acceptance/reports/cucumber-report.html

# Mac
open test/acceptance/reports/cucumber-report.html

# Linux
xdg-open test/acceptance/reports/cucumber-report.html
```

### Integrar con CI/CD

Ver `ARCHITECTURE.md` para ejemplos de Jenkins/GitHub Actions.

### Ampliar Pruebas

- Agregar más escenarios en los features existentes
- Crear nuevos features para otras operaciones
- Agregar validaciones más específicas

## Referencia Rápida de Gherkin

```gherkin
# language: es
Característica: Descripción
  Escenario: Caso de prueba
    Dado [estado inicial]
    Cuando [acción]
    Entonces [resultado]
    Y [más resultados]
```

## Datos de Prueba Útiles

```javascript
// Usuario válido
{
  username: 'testuser',
  email: 'test@example.com',
  password: 'SecurePass123!',
  firstName: 'Test',
  lastName: 'User',
  phone: '+34912345678'
}

// Email inválido
email: 'invalid-email'

// Contraseña muy corta
password: 'Abc123'

// Username inválido (caracteres especiales)
username: 'user@name'
```

## Tips de Productividad

1. **Usar Data Tables para múltiples datos**
```gherkin
Cuando registro usuarios:
  | username | email            |
  | user1    | user1@test.com   |
  | user2    | user2@test.com   |
```

2. **Reutilizar steps comunes**
```gherkin
Dado que existe un usuario con username "testuser"
# En lugar de repetir todos los detalles
```

3. **Agrupar assertions relacionadas**
```gherkin
Entonces la respuesta debe tener estado 200
Y la respuesta debe incluir un token
Y el token debe ser de tipo Bearer
```

4. **Usar comentarios para documentar**
```gherkin
# Caso de prueba para SQL injection
Cuando intento registrar un usuario con username "' OR '1'='1"
```

## Estadísticas

- **Features**: 2 (authentication, user_management)
- **Escenarios**: ~25+
- **Steps**: ~100+
- **Esquemas JSON**: 8
- **Cobertura**: Todas las operaciones CRUD del API

## Soporte

Para ayuda, revisar:
- `test/acceptance/README.md` - Documentación completa
- `ARCHITECTURE.md` - Arquitectura técnica
- `test/acceptance/features/*.feature` - Ejemplos de uso

---

**¡Listo!** Ahora puedes ejecutar tus pruebas. 🚀
