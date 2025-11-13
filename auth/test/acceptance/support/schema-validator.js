import Ajv from 'ajv'
import ajvFormats from 'ajv-formats'
import schemas from '../schemas/api-schemas.json' assert { type: 'json' }

const ajv = new Ajv()
ajvFormats(ajv)

class SchemaValidator {
  constructor() {
    this.validators = {}
    this.initializeValidators()
  }

  initializeValidators() {
    for (const [schemaName, schema] of Object.entries(schemas)) {
      this.validators[schemaName] = ajv.compile(schema)
    }
  }

  validate(data, schemaName) {
    const validator = this.validators[schemaName]
    if (!validator) {
      throw new Error(`Schema "${schemaName}" not found`)
    }

    const valid = validator(data)
    if (!valid) {
      return {
        isValid: false,
        errors: validator.errors
      }
    }
    return {
      isValid: true,
      errors: []
    }
  }
}

export default new SchemaValidator()
