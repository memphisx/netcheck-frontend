import { Notify } from 'quasar'
import Vue from 'vue'

const notificationsHandler = (router) => {
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

  const notificationHandler = (event) => {
    const settings = Vue.prototype.$settings
    const data = JSON.parse(event.data)
    const message = generateMessage(data)
    if (Vue.prototype.$settings.areUINotificationsEnabled()) {
      Notify.create({
        type: generateType(data),
        message: message,
        actions: [
          { label: 'Go to monitoring page', handler: () => router.push(`/domains/${data.hostname}`) }
        ],
        caption: data.message,
        position: settings.getNotificationPosition(),
        html: false,
        timeout: settings.getNotificationDuration(),
        closeBtn: true
      })
    }

    if (Vue.prototype.$settings.areNativeNotificationsEnabled()) {
      const notification = new Notification(message, { body: data.message, icon: 'favicon-128x128.png' })
      notification.onclick = (event) => {
        router.push(`/domains/${data.hostname}`)
      }
    }
  }
  return {
    notificationConsumer: () => (event) => notificationHandler(event)
  }
}

export default (router) => notificationsHandler(router)
