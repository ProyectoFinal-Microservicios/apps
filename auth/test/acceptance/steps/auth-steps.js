import { Given, When, Then, Before } from '@cucumber/cucumber'
import ApiClient from '../support/api-client.js'
import schemaValidator from '../support/schema-validator.js'
import assert from 'assert'

let apiClient
let lastResponse
let lastError
let currentUser
let users = {}
let tokens = {}

Before(function() {
  apiClient = new ApiClient()
  lastResponse = null
  lastError = null
})

// ============================================================
// Gherkin Steps - Authentication Features
// ============================================================

When('registro un nuevo usuario con los siguientes datos:', async function(dataTable) {
  const data = dataTable.rowsHash()
  const payload = {
    username: data.username,
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone
  }

  // Guardar para futuras referencias
  users[data.username] = payload
  
  lastResponse = await apiClient.post('/accounts', payload)
})

Given('que existe un usuario con username {string}', async function(username) {
  const userData = {
    username,
    email: `anicu2314@gmail.com`,
    password: 'SecurePass123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '+573234030048'
  }
  
  users[username] = userData
  
  lastResponse = await apiClient.post('/accounts', userData)
  if (lastResponse.status === 201 || lastResponse.status === 409) {
    tokens[username] = lastResponse.data.access_token
  }
})

Given('que existe un usuario con credenciales:', async function(dataTable) {
  const data = dataTable.rowsHash()
  const userData = {
    username: data.username,
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone
  }
  
  users[data.username] = userData
  
  lastResponse = await apiClient.post('/accounts', userData)
  if (lastResponse.status === 201 || lastResponse.status === 409) {
    tokens[data.username] = lastResponse.data.access_token
    currentUser = data.username
  }
})

When('intento registrar un usuario con email inválido:', async function(dataTable) {
  const data = dataTable.rowsHash()
  const payload = {
    username: data.username,
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone
  }
  
  lastResponse = await apiClient.post('/accounts', payload)
})

When('intento registrar un usuario con contraseña corta:', async function(dataTable) {
  const data = dataTable.rowsHash()
  const payload = {
    username: data.username,
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone
  }
  
  lastResponse = await apiClient.post('/accounts', payload)
})

When('intento registrar un usuario con username corto:', async function(dataTable) {
  const data = dataTable.rowsHash()
  const payload = {
    username: data.username,
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone
  }
  
  lastResponse = await apiClient.post('/accounts', payload)
})

When('inicio sesión con username {string} y contraseña {string}', async function(username, password) {
  lastResponse = await apiClient.post('/sessions', {
    identifier: username,
    password
  })
  
  if (lastResponse.status === 200) {
    apiClient.setToken(lastResponse.data.access_token)
  }
})

When('inicio sesión con email {string} y contraseña {string}', async function(email, password) {
  lastResponse = await apiClient.post('/sessions', {
    identifier: email,
    password
  })
  
  if (lastResponse.status === 200) {
    apiClient.setToken(lastResponse.data.access_token)
  }
})

When('intento iniciar sesión con credenciales inválidas:', async function(dataTable) {
  const data = dataTable.rowsHash()
  lastResponse = await apiClient.post('/sessions', {
    identifier: data.identifier,
    password: data.password
  })
})

When('intento iniciar sesión con contraseña incorrecta {string}', async function(wrongPassword) {
  const userData = users[currentUser]
  lastResponse = await apiClient.post('/sessions', {
    identifier: userData.username,
    password: wrongPassword
  })
})

When('solicito un código de recuperación de contraseña para {string}', async function(email) {
  lastResponse = await apiClient.post('/codes', { email })
})

// ============================================================
// Gherkin Steps - User Management Features
// ============================================================

Given('que el servidor está disponible en {string}', async function(url) {
  apiClient = new ApiClient(url)
})

Given('existe un usuario autenticado con username {string} y contraseña {string}', async function(username, password) {
  const response = await apiClient.post('/sessions', {
    identifier: username,
    password
  })
  
  if (response.status === 200) {
    apiClient.setToken(response.data.access_token)
    currentUser = username
  } else {
    // Si no existe, registrarlo
    await apiClient.post('/accounts', {
      username,
      email: `${username}@example.com`,
      password,
      firstName: 'Auth',
      lastName: 'User',
      phone: '+573234030048'
    })
    
    const loginResponse = await apiClient.post('/sessions', {
      identifier: username,
      password
    })
    
    if (loginResponse.status === 200) {
      apiClient.setToken(loginResponse.data.access_token)
      currentUser = username
    }
  }
})

Given('que existe otro usuario con username {string}', async function(username) {
  const userData = {
    username,
    email: `${username}@example.com`,
    password: 'SecurePass123!',
    firstName: 'Other',
    lastName: 'User',
    phone: '+573234030048'
  }
  
  users[username] = userData
  
  lastResponse = await apiClient.post('/accounts', userData)
  tokens[username] = lastResponse.data.access_token
})

When('obtengo el perfil del usuario {string}', async function(username) {
  lastResponse = await apiClient.get(`/accounts/${username}`)
})

When('intento obtener el perfil sin token de autenticación', async function() {
  const savedToken = apiClient.getToken()
  apiClient.setToken(null)
  
  lastResponse = await apiClient.get('/accounts/authuser')
  
  apiClient.setToken(savedToken)
})

When('intento obtener el perfil del usuario {string} con mi token', async function(otherUsername) {
  lastResponse = await apiClient.get(`/accounts/${otherUsername}`)
})

When('actualizo mi perfil con los siguientes datos:', async function(dataTable) {
  const data = dataTable.rowsHash()
  const payload = {
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone
  }
  
  lastResponse = await apiClient.patch(`/accounts/${currentUser}`, payload)
})

When('actualizo mi perfil con solo el campo firstName a {string}', async function(firstName) {
  lastResponse = await apiClient.patch(`/accounts/${currentUser}`, { firstName })
})

When('intento actualizar mi perfil con los mismos datos que ya tiene', async function() {
  // Obtener perfil actual
  const profileResponse = await apiClient.get(`/accounts/${currentUser}`)
  const currentProfile = profileResponse.data.user
  
  // Intentar actualizar con los mismos datos
  const payload = {
    firstName: currentProfile.firstName,
    lastName: currentProfile.lastName,
    phone: currentProfile.phone
  }
  
  lastResponse = await apiClient.patch(`/accounts/${currentUser}`, payload)
})

When('cambio mi contraseña de {string} a {string}', async function(oldPassword, newPassword) {
  lastResponse = await apiClient.put(`/accounts/${currentUser}`, {
    oldPassword,
    newPassword
  })
})

When('puedo iniciar sesión con la nueva contraseña', async function() {
  const userData = users[currentUser]
  const response = await apiClient.post('/sessions', {
    identifier: userData.username,
    password: userData.password // newPassword de paso anterior
  })
  
  assert.strictEqual(response.status, 200, 'No se puede iniciar sesión con la nueva contraseña')
})

When('intento cambiar mi contraseña con contraseña actual incorrecta {string}', async function(wrongPassword) {
  lastResponse = await apiClient.put(`/accounts/${currentUser}`, {
    oldPassword: wrongPassword,
    newPassword: 'NewSecurePass456!'
  })
})

When('intento cambiar mi contraseña a una muy corta {string}', async function(shortPassword) {
  lastResponse = await apiClient.put(`/accounts/${currentUser}`, {
    oldPassword: 'SecurePass123!',
    newPassword: shortPassword
  })
})

Given('que existen múltiples usuarios en el sistema', async function() {
  // Crear varios usuarios de prueba
  for (let i = 0; i < 5; i++) {
    await apiClient.post('/accounts', {
      username: `user${i}`,
      email: `user${i}@example.com`,
      password: 'SecurePass123!',
      firstName: `User${i}`,
      lastName: 'Test',
      phone: '+34912345678'
    })
  }
})

Given('el usuario autenticado es administrador', async function() {
  // Se asume que el usuario actual es admin
  // En pruebas reales, esto puede ser verificado obteniendo el perfil
})

Given('el usuario autenticado NO es administrador', async function() {
  // Se asume que el usuario actual no es admin
})

When('listo los usuarios con página {int} y límite {int}', async function(page, limit) {
  lastResponse = await apiClient.get(`/accounts?page=${page}&limit=${limit}`)
})

When('listo los usuarios sin ser administrador', async function() {
  lastResponse = await apiClient.get('/accounts?page=1&limit=10')
})

When('listo los usuarios filtrando por búsqueda {string}', async function(searchTerm) {
  lastResponse = await apiClient.get(`/accounts?search=${searchTerm}`)
})

Given('que existe un usuario con username {string}', async function(username) {
  const userData = {
    username,
    email: `${username}@example.com`,
    password: 'SecurePass123!',
    firstName: 'Delete',
    lastName: 'Me',
    phone: '+573234030048'
  }
  
  users[username] = userData
  
  lastResponse = await apiClient.post('/accounts', userData)
})

When('elimino la cuenta del usuario {string}', async function(username) {
  lastResponse = await apiClient.delete(`/accounts/${username}`)
})

When('el usuario no debe poder iniciar sesión', async function() {
  const userData = users[Object.keys(users)[0]]
  const response = await apiClient.post('/sessions', {
    identifier: userData.username,
    password: userData.password
  })
  
  assert.strictEqual(response.status, 401, 'Usuario eliminado aún puede iniciar sesión')
})

When('intento eliminar una cuenta sin autenticación', async function() {
  const savedToken = apiClient.getToken()
  apiClient.setToken(null)
  
  lastResponse = await apiClient.delete('/accounts/someuser')
  
  apiClient.setToken(savedToken)
})

Given('que existen dos usuarios diferentes', async function() {
  // Primer usuario es currentUser
  // Crear un segundo usuario
  const secondUser = {
    username: 'seconduser',
    email: 'seconduser@example.com',
    password: 'SecurePass123!',
    firstName: 'Second',
    lastName: 'User',
    phone: '+573234030048'
  }
  
  users['seconduser'] = secondUser
  
  await apiClient.post('/accounts', secondUser)
})

When('intento eliminar la cuenta de otro usuario', async function() {
  lastResponse = await apiClient.delete('/accounts/seconduser')
})

// ============================================================
// Gherkin Steps - Assertions
// ============================================================

Then('la respuesta debe tener estado {int}', function(statusCode) {
  assert.strictEqual(
    lastResponse.status,
    statusCode,
    `Se esperaba estado ${statusCode}, pero se obtuvo ${lastResponse.status}. Respuesta: ${JSON.stringify(lastResponse.data)}`
  )
})

Then('la respuesta debe contener el mensaje {string}', function(message) {
  assert(
    lastResponse.data.message && lastResponse.data.message.includes(message),
    `Se esperaba mensaje contiene "${message}", pero se obtuvo: ${lastResponse.data.message}`
  )
})

Then('la respuesta debe contener el mensaje de error {string}', function(errorMessage) {
  assert(
    lastResponse.data.error && lastResponse.data.error.includes(errorMessage),
    `Se esperaba error contiene "${errorMessage}", pero se obtuvo: ${lastResponse.data.error}`
  )
})

Then('la respuesta debe contener el mensaje de validación {string}', function(validationMessage) {
  const hasValidationMessage = JSON.stringify(lastResponse.data).includes(validationMessage)
  assert(
    hasValidationMessage,
    `Se esperaba mensaje de validación "${validationMessage}" en la respuesta`
  )
})

Then('la respuesta debe incluir un token de acceso', function() {
  assert(
    lastResponse.data.access_token,
    'La respuesta no incluye un token de acceso'
  )
})

Then('el token debe ser de tipo Bearer', function() {
  assert.strictEqual(
    lastResponse.data.token_type,
    'Bearer',
    `Se esperaba token_type "Bearer", pero se obtuvo "${lastResponse.data.token_type}"`
  )
})

Then('la respuesta debe contener información del usuario', function() {
  assert(
    lastResponse.data.user,
    'La respuesta no contiene información del usuario'
  )
  assert(
    lastResponse.data.user.username,
    'Información del usuario no incluye username'
  )
  assert(
    lastResponse.data.user.email,
    'Información del usuario no incluye email'
  )
})

Then('la estructura de la respuesta debe ser válida según el esquema de registro', function() {
  const validation = schemaValidator.validate(lastResponse.data, 'registerResponseSchema')
  assert(
    validation.isValid,
    `Validación de esquema falló: ${JSON.stringify(validation.errors)}`
  )
})

Then('la estructura de la respuesta debe ser válida según el esquema de login', function() {
  const validation = schemaValidator.validate(lastResponse.data, 'loginResponseSchema')
  assert(
    validation.isValid,
    `Validación de esquema falló: ${JSON.stringify(validation.errors)}`
  )
})

Then('la estructura de la respuesta debe ser válida según el esquema de códigos', function() {
  const validation = schemaValidator.validate(lastResponse.data, 'passwordResetCodeSchema')
  assert(
    validation.isValid,
    `Validación de esquema falló: ${JSON.stringify(validation.errors)}`
  )
})

Then('la estructura de la respuesta debe ser válida según el esquema de perfil de usuario', function() {
  const validation = schemaValidator.validate(lastResponse.data, 'userProfileSchema')
  assert(
    validation.isValid,
    `Validación de esquema falló: ${JSON.stringify(validation.errors)}`
  )
})

Then('la respuesta debe contener los datos actualizados', function() {
  assert(lastResponse.data.user, 'La respuesta no contiene información del usuario')
})

Then('la respuesta debe contener firstName como {string}', function(firstName) {
  assert.strictEqual(
    lastResponse.data.user.firstName,
    firstName,
    `Se esperaba firstName "${firstName}", pero se obtuvo "${lastResponse.data.user.firstName}"`
  )
})

Then('la respuesta debe contener una lista de usuarios', function() {
  assert(
    Array.isArray(lastResponse.data.items),
    'La respuesta no contiene una lista de usuarios'
  )
})

Then('la respuesta debe incluir información de paginación', function() {
  assert(lastResponse.data.total !== undefined, 'Falta información de total')
  assert(lastResponse.data.page !== undefined, 'Falta información de página')
  assert(lastResponse.data.limit !== undefined, 'Falta información de límite')
})

Then('la estructura de la respuesta debe ser válida según el esquema de listado de usuarios', function() {
  const validation = schemaValidator.validate(lastResponse.data, 'usersListSchema')
  assert(
    validation.isValid,
    `Validación de esquema falló: ${JSON.stringify(validation.errors)}`
  )
})

Then('la respuesta debe contener solo usuarios que coincidan con la búsqueda', function() {
  const searchTerm = 'test'
  const hasMatchingUsers = lastResponse.data.items.every(user =>
    user.username.includes(searchTerm) || user.email.includes(searchTerm)
  )
  assert(
    hasMatchingUsers,
    'La respuesta contiene usuarios que no coinciden con la búsqueda'
  )
})

export {
  apiClient,
  lastResponse,
  currentUser,
  users,
  tokens
}
