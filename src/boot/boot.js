import Vue from 'vue'
import client from '../libs/netcheck-client'
import { Notify } from 'quasar'
import settingsHandler from '../libs/settings-handler'
import notificationsHandler from '../libs/notifications-handler'

Vue.prototype.$settings = settingsHandler()
Vue.prototype.$notificationSettings = notificationsHandler

const backend = client({
  baseUrl: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}` : '',
  withEventSource: true
})
Vue.prototype.$backend = backend

const eventClient = backend.events()
const errorHandler = () => {
  if (Vue.prototype.$settings.areUINotificationsEnabled()) {
    Notify.create({
      type: 'negative',
      message: 'Backend connection down. Reconnecting...',
      position: Vue.prototype.$settings.getNotificationPosition(),
      timeout: Vue.prototype.$settings.getNotificationDuration()
    })
  }
}
eventClient.onError(errorHandler)

export default ({ router }) => {
  const consumer = Vue.prototype.$notificationSettings(router).notificationConsumer()
  eventClient.subscribe({ eventType: 'Notification', consumer })
  return backend
}
