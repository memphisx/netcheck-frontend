import Vue from 'vue'
import client from '../libs/netcheck-client'

const backend = client({ baseUrl: 'http://127.0.0.1:8080', withEventSource: true })
Vue.prototype.$backend = backend

export default () => {
  return backend
}
