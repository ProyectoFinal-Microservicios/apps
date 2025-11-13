# language: es
Característica: Autenticación de Usuarios
  Como usuario del sistema
  Quiero poder registrarme, iniciar sesión y gestionar mi cuenta
  Para acceder a los servicios de la plataforma

  Escenario: Registrar un nuevo usuario exitosamente
    Cuando registro un nuevo usuario con los siguientes datos:
      | field      | value                  |
      | username   | testuser123            |
      | email      | anicu2314@gmail.com    |
      | password   | SecurePass123!         |
      | firstName  | Test                   |
      | lastName   | User                   |
      | phone      | +573234030048          |
    Entonces la respuesta debe tener estado 201
    Y la respuesta debe contener el mensaje "Usuario registrado exitosamente"
    Y la respuesta debe incluir un token de acceso
    Y el token debe ser de tipo Bearer
    Y la estructura de la respuesta debe ser válida según el esquema de registro

  Escenario: Registro fallido - Usuario ya existe
    Dado que existe un usuario con username "existinguser"
    Cuando registro un nuevo usuario con los siguientes datos:
      | field      | value                      |
      | username   | existinguser               |
      | email      | anicu2314@gmail.com        |
      | password   | SecurePass123!             |
      | firstName  | New                        |
      | lastName   | User                       |
      | phone      | +573234030048              |
    Entonces la respuesta debe tener estado 409
    Y la respuesta debe contener el mensaje de error "El usuario o correo ya están registrados"

  Escenario: Registro fallido - Email inválido
    Cuando intento registrar un usuario con email inválido:
      | field      | value                  |
      | username   | testuser123            |
      | email      | email_invalido         |
      | password   | SecurePass123!         |
      | firstName  | Test                   |
      | lastName   | User                   |
      | phone      | +573225179118          |
    Entonces la respuesta debe tener estado 400

  Escenario: Registro fallido - Contraseña muy corta
    Cuando intento registrar un usuario con contraseña corta:
      | field      | value                  |
      | username   | testuser123            |
      | email      | testuser@example.com   |
      | password   | Abc123                 |
      | firstName  | Test                   |
      | lastName   | User                   |
      | phone      | +34912345678           |
    Entonces la respuesta debe tener estado 400
    Y la respuesta debe contener el mensaje de validación "La contraseña debe tener al menos 8 caracteres"

  Escenario: Registro fallido - Username muy corto
    Cuando intento registrar un usuario con username corto:
      | field      | value                  |
      | username   | ab                     |
      | email      | testuser@example.com   |
      | password   | SecurePass123!         |
      | firstName  | Test                   |
      | lastName   | User                   |
      | phone      | +573123456178          |
    Entonces la respuesta debe tener estado 400

  Escenario: Login exitoso con username
    Dado que existe un usuario con credenciales:
      | field      | value                  |
      | username   | loginuser              |
      | email      | loginuser@example.com  |
      | password   | SecurePass123!         |
      | firstName  | Login                  |
      | lastName   | User                   |
      | phone      | +573234030048          |
    Cuando inicio sesión con username "loginuser" y contraseña "SecurePass123!"
    Entonces la respuesta debe tener estado 200
    Y la respuesta debe incluir un token de acceso
    Y el token debe ser de tipo Bearer
    Y la respuesta debe contener información del usuario
    Y la estructura de la respuesta debe ser válida según el esquema de login

  Escenario: Login exitoso con email
    Dado que existe un usuario con credenciales:
      | field      | value                  |
      | username   | emaillogin             |
      | email      | emaillogin@example.com |
      | password   | SecurePass123!         |
      | firstName  | Email                  |
      | lastName   | User                   |
      | phone      | +573234030048          |
    Cuando inicio sesión con email "emaillogin@example.com" y contraseña "SecurePass123!"
    Entonces la respuesta debe tener estado 200
    Y la respuesta debe incluir un token de acceso

  Escenario: Login fallido - Usuario no existe
    Cuando intento iniciar sesión con credenciales inválidas:
      | identifier | nonexistente@example.com |
      | password   | SomePassword123!        |
    Entonces la respuesta debe tener estado 401
    Y la respuesta debe contener el mensaje de error "Usuario no encontrado o credenciales inválidas"

  Escenario: Login fallido - Contraseña incorrecta
    Dado que existe un usuario con credenciales:
      | field      | value                      |
      | username   | wrongpassuser              |
      | email      | wrongpass@example.com      |
      | password   | CorrectPassword123!        |
      | firstName  | Wrong                      |
      | lastName   | Pass                       |
      | phone      | +34912345678               |
    Cuando intento iniciar sesión con contraseña incorrecta "WrongPassword123!"
    Entonces la respuesta debe tener estado 401
    Y la respuesta debe contener el mensaje de error "Contraseña incorrecta"

  Escenario: Solicitar código de recuperación de contraseña
    Dado que existe un usuario con email "anicu2314@gmail.com"
    Cuando solicito un código de recuperación de contraseña para "anicu2314@gmail.com"
    Entonces la respuesta debe tener estado 200
    Y la respuesta debe contener el mensaje "Si el email existe, recibirás instrucciones de recuperación"
    Y la estructura de la respuesta debe ser válida según el esquema de códigos

  Escenario: Solicitar código para email inexistente (sin revelar información)
    Cuando solicito un código de recuperación de contraseña para "noexiste@example.com"
    Entonces la respuesta debe tener estado 200
    Y la respuesta debe contener el mensaje "Si el email existe, recibirás instrucciones de recuperación"
