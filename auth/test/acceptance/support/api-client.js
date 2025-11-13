const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3500'

class ApiClient {
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl
    this.token = null
  }

  setToken(token) {
    this.token = token
  }

  getToken() {
    return this.token
  }

  async request(method, endpoint, body = null, headers = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers
    }

    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`
    }

    const options = {
      method,
      headers: defaultHeaders
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    const contentType = response.headers.get('content-type')
    let data

    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    return {
      status: response.status,
      data,
      headers: response.headers
    }
  }

  async get(endpoint, headers = {}) {
    return this.request('GET', endpoint, null, headers)
  }

  async post(endpoint, body, headers = {}) {
    return this.request('POST', endpoint, body, headers)
  }

  async put(endpoint, body, headers = {}) {
    return this.request('PUT', endpoint, body, headers)
  }

  async patch(endpoint, body, headers = {}) {
    return this.request('PATCH', endpoint, body, headers)
  }

  async delete(endpoint, headers = {}) {
    return this.request('DELETE', endpoint, null, headers)
  }
}

export default ApiClient
