// based on tyler's work: https://github.com/tylerlong/ringcentral-js-concise
import axios, { AxiosInstance } from 'axios'
import { Config, Data } from './types'

const version = process.env.version

export class HTTPError extends Error {
  status: number
  statusText: string
  data: Data
  config: Config
  constructor (status: number, statusText: string, data: Data, config: Config) {
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
  token: string
  server: string
  _axios: AxiosInstance
  userAgentHeader: string

  static apiServer = 'https://gitee.com/api'

  constructor (
    token: string,
    userAgentHeader = `gitee-js/v${version}`
  ) {
    this.token = token
    this.server = GistClient.apiServer
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

  request (config: Config) {
    let uri = config.url.startsWith('http')
      ? config.url
      : this.server + config.url
    const methods = ['get', 'delete']
    if (methods.includes(config.method)) {
      const sep = uri.includes('?') ? '&' : '?'
      const tokenQuery = `access_token=${this.token}`
      uri = uri + sep + tokenQuery
    } else {
      if (!config.data) {
        config.data = {}
      }
      config.data.access_token = this.token
    }
    return this._axios.request({
      ...config,
      url: uri.toString(),
      headers: this._patchHeaders(config.headers)
    })
  }

  get (url: string, config = {}) {
    return this.request({ ...config, method: 'get', url })
  }

  delete (url: string, config = {}) {
    return this.request({ ...config, method: 'delete', url })
  }

  post (url: string, data = undefined, config = {}) {
    return this.request({ ...config, method: 'post', url, data })
  }

  put (url: string, data = undefined, config = {}) {
    return this.request({ ...config, method: 'put', url, data })
  }

  patch (url: string, data = undefined, config = {}) {
    return this.request({ ...config, method: 'patch', url, data })
  }

  _patchHeaders (headers: Data = {}) {
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
