# language: es
Característica: Gestión de Usuarios
  Como usuario autenticado del sistema
  Quiero poder consultar, actualizar y eliminar mi perfil
  Para mantener mi información personal actualizada

  Antecedentes:
    Dado que el servidor está disponible en "http://localhost:3500"
    Y existe un usuario autenticado con username "testuser123" y contraseña "SecurePass123!"

  Escenario: Obtener perfil de usuario exitosamente
    Cuando obtengo el perfil del usuario "testuser123"
    Entonces la respuesta debe tener estado 200
    Y la respuesta debe contener la información del usuario
    Y la estructura de la respuesta debe ser válida según el esquema de perfil de usuario

  Escenario: Obtener perfil - No autenticado
    Cuando intento obtener el perfil sin token de autenticación
    Entonces la respuesta debe tener estado 401
    Y la respuesta debe contener el mensaje de error "No autenticado"

  Escenario: Obtener perfil de otro usuario - No autorizado
    Dado que existe otro usuario con username "otheruser"
    Cuando intento obtener el perfil del usuario "otheruser" con mi token
    Entonces la respuesta debe tener estado 403
    Y la respuesta debe contener el mensaje de error "No autorizado"

  Escenario: Actualizar perfil del usuario exitosamente
    Cuando actualizo mi perfil con los siguientes datos:
      | field      | value          |
      | firstName  | TestUpdated    |
      | lastName   | UserUpdated    |
      | phone      | +3234030048    |
    Entonces la respuesta debe tener estado 200
    Y la respuesta debe contener los datos actualizados
    Y la estructura de la respuesta debe ser válida según el esquema de perfil de usuario

  Escenario: Actualizar perfil - Solo algunos campos
    Cuando actualizo mi perfil con solo el campo firstName a "NuevoNombre"
    Entonces la respuesta debe tener estado 200
    Y la respuesta debe contener firstName como "NuevoNombre"

  Escenario: Actualizar perfil - Sin cambios
    Cuando intento actualizar mi perfil con los mismos datos que ya tiene
    Entonces la respuesta debe tener estado 400
    Y la respuesta debe contener el mensaje de error "No hay campos para actualizar"

  Escenario: Cambiar contraseña exitosamente
    Cuando cambio mi contraseña de "SecurePass123!" a "NewSecurePass456!"
    Entonces la respuesta debe tener estado 200
    Y la respuesta debe contener el mensaje "Contraseña cambiada exitosamente"
    Y puedo iniciar sesión con la nueva contraseña

  Escenario: Cambiar contraseña - Contraseña actual incorrecta
    Cuando intento cambiar mi contraseña con contraseña actual incorrecta "WrongPassword123!"
    Entonces la respuesta debe tener estado 400
    Y la respuesta debe contener el mensaje de error "Contraseña actual incorrecta"

  Escenario: Cambiar contraseña - Nueva contraseña muy corta
    Cuando intento cambiar mi contraseña a una muy corta "abc123"
    Entonces la respuesta debe tener estado 400

  Escenario: Listar usuarios con paginación
    Dado que existen múltiples usuarios en el sistema
    Y el usuario autenticado es administrador
    Cuando listo los usuarios con página 1 y límite 10
    Entonces la respuesta debe tener estado 200
    Y la respuesta debe contener una lista de usuarios
    Y la respuesta debe incluir información de paginación
    Y la estructura de la respuesta debe ser válida según el esquema de listado de usuarios

  Escenario: Listar usuarios - Sin autorización
    Cuando listo los usuarios sin ser administrador
    Entonces la respuesta debe tener estado 403
    Y la respuesta debe contener el mensaje de error "Acceso denegado"

  Escenario: Listar usuarios con búsqueda
    Dado que el usuario autenticado es administrador
    Cuando listo los usuarios filtrando por búsqueda "test"
    Entonces la respuesta debe tener estado 200
    Y la respuesta debe contener solo usuarios que coincidan con la búsqueda

  Escenario: Eliminar cuenta de usuario
    Dado que existe un usuario con username "deleteme"
    Cuando elimino la cuenta del usuario "deleteme"
    Entonces la respuesta debe tener estado 200
    Y la respuesta debe contener el mensaje "Cuenta eliminada exitosamente"
    Y el usuario no debe poder iniciar sesión

  Escenario: Eliminar cuenta - No autenticado
    Cuando intento eliminar una cuenta sin autenticación
    Entonces la respuesta debe tener estado 401

  Escenario: Eliminar cuenta de otro usuario - Solo admin
    Dado que existen dos usuarios diferentes
    Y el usuario autenticado NO es administrador
    Cuando intento eliminar la cuenta de otro usuario
    Entonces la respuesta debe tener estado 403
