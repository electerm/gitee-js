// based on tyler's work: https://github.com/tylerlong/ringcentral-js-concise
import axios from 'axios'

const version = process.env.version
const apiServer = 'https://gitee.com/api'

class HTTPError extends Error {
  constructor (status, statusText, data, config) {
    super(`status: ${status}
statusText: ${statusText}
data: ${JSON.stringify(data, null, 2)}
config: ${JSON.stringify(config, null, 2)}`)
    this.status = status
    this.statusText = statusText
    this.data = data
    this.config = config
  }
}

class GistClient {
  constructor (
    token,
    userAgentHeader = `gitee-js/v${version}`
  ) {
    this.token = token
    this.server = apiServer
    this.userAgentHeader = userAgentHeader
    this._axios = axios.create()
    const request = this._axios.request.bind(this._axios)
    this._axios.request = (config) => {
      try {
        return request(config)
      } catch (e) {
        if (e.response) {
          throw new HTTPError(e.response.status, e.response.statusText, e.response.data, e.response.config)
        } else {
          throw e
        }
      }
    }
  }

  request (config) {
    let uri = config.url.startsWith('http')
      ? config.url
      : this.server + config.url
    const methods = ['get', 'delete']
    if (methods.includes(config.method)) {
      const sep = uri.includes('?') ? '&' : '?'
      const tokenQuery = `access_token=${this.token}`
      uri = uri + sep + tokenQuery
    } else {
      config.data.access_token = this.token
    }
    return this._axios.request({
      ...config,
      url: uri.toString(),
      headers: this._patchHeaders(config.headers)
    })
  }

  get (url, config = {}) {
    return this.request({ ...config, method: 'get', url })
  }

  delete (url, config = {}) {
    return this.request({ ...config, method: 'delete', url })
  }

  post (url, data = undefined, config = {}) {
    return this.request({ ...config, method: 'post', url, data })
  }

  put (url, data = undefined, config = {}) {
    return this.request({ ...config, method: 'put', url, data })
  }

  patch (url, data = undefined, config = {}) {
    return this.request({ ...config, method: 'patch', url, data })
  }

  _patchHeaders (headers) {
    return {
      'Content-Type': 'application/json',
      ...this._authHeader(),
      'X-User-Agent': this.userAgentHeader,
      ...headers
    }
  }

  _authHeader () {
    return {}
  }
}

export default GistClient
