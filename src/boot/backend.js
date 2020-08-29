import Vue from 'vue'
import client from '../libs/netcheck-client'
import { Notify } from 'quasar'

const generateType = ({ type, status }) => {
  if (type === 'CERTIFICATE') {
    return 'info'
  } else if (status && status === 'UP') {
    return 'positive'
  }
  return 'negative'
}

const generateMessage = ({ type, status, hostname }) => {
  if (type === 'CERTIFICATE') {
    return `${hostname} certificates changed`
  }
  return `${type.toLowerCase()}://${hostname} is ${status}`
}

const errorHandler = () => {
  Notify.create({
    type: 'negative',
    message: 'Backend connection down. Reconnecting...',
    position: 'top-right',
    timeout: 10000
  })
}

const backend = client({
  baseUrl: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}` : '',
  withEventSource: true
})
Vue.prototype.$backend = backend
const eventClient = backend.events()
eventClient.onError(errorHandler)

export default ({ router }) => {
  const consumer = (event) => {
    const data = JSON.parse(event.data)
    Notify.create({
      type: generateType(data),
      message: generateMessage(data),
      actions: [
        { label: 'Go to monitoring page', handler: () => router.push(`/domains/${data.hostname}`) },
        { label: 'Dismiss', color: 'white' }
      ],
      caption: data.message,
      position: 'top-right',
      timeout: 10000
    })
  }
  eventClient.subscribe({ eventType: 'Notification', consumer })
  return backend
}
