import { LocalStorage, Notify, Dark } from 'quasar'
const SETTINGS_KEY_NAME = 'settings'
const defaultConfig = {
  darkMode: false,
  monitoredDomainGraphsEnabled: true,
  expandedMonitoredDomains: true,
  nativeNotifications: false,
  notificationPosition: 'top-right',
  notificationDuration: 10000,
  uiNotifications: true
}
let storedConfig

try {
  if (LocalStorage.has(SETTINGS_KEY_NAME)) {
    storedConfig = {
      ...defaultConfig,
      ...LocalStorage.getItem(SETTINGS_KEY_NAME)
    }
  } else {
    storedConfig = defaultConfig
  }
  LocalStorage.set(SETTINGS_KEY_NAME, storedConfig)
} catch (e) {
  Notify.create({
    type: 'negative',
    message: 'Failed to get settings from Local Storage',
    position: defaultConfig.notificationPosition,
    timeout: 10000
  })
}
Dark.set(storedConfig.darkMode)

const settingsHandler = () => {
  const configuration = LocalStorage.getItem(SETTINGS_KEY_NAME)
  if (configuration.nativeNotifications) {
    Notification.requestPermission().then((result) => {
      if (result !== 'granted') {
        configuration.nativeNotifications = false
      }
    })
  }
  return {
    isMonitoredDomainsGraphsEnabled: () => {
      return configuration.monitoredDomainGraphsEnabled
    },
    isDarkMode: () => {
      return configuration.darkMode
    },
    toggleGraphsOnMonitoredDomains: () => {
      configuration.monitoredDomainGraphsEnabled = !configuration.monitoredDomainGraphsEnabled
      LocalStorage.set(SETTINGS_KEY_NAME, configuration)
    },
    toggleDarkMode: () => {
      Dark.toggle()
      configuration.darkMode = Dark.isActive
      LocalStorage.set(SETTINGS_KEY_NAME, configuration)
    },
    toggleMonitoredDomainsExpanded: () => {
      configuration.expandedMonitoredDomains = !configuration.expandedMonitoredDomains
      LocalStorage.set(SETTINGS_KEY_NAME, configuration)
    },
    isMonitoredDomainsExpanded: () => {
      return configuration.expandedMonitoredDomains
    },
    areUINotificationsEnabled: () => {
      return configuration.uiNotifications
    },
    toggleUINotifications: () => {
      configuration.uiNotifications = !configuration.uiNotifications
      LocalStorage.set(SETTINGS_KEY_NAME, configuration)
    },
    areNativeNotificationsEnabled: () => {
      return configuration.nativeNotifications
    },
    toggleNativeNotifications: () => {
      if (!configuration.nativeNotifications) {
        Notification.requestPermission().then((result) => {
          if (result !== 'granted') {
            configuration.nativeNotifications = true
          } else {
            configuration.nativeNotifications = false
          }
        })
      }
      configuration.nativeNotifications = !configuration.nativeNotifications
      LocalStorage.set(SETTINGS_KEY_NAME, configuration)
    },
    getNotificationDuration: () => {
      return configuration.notificationDuration
    },
    setNotificationDuration: (duration) => {
      configuration.notificationDuration = duration
      LocalStorage.set(SETTINGS_KEY_NAME, configuration)
    },
    getNotificationPosition: () => {
      return configuration.notificationPosition
    },
    setNotificationPosition: (position) => {
      configuration.notificationPosition = position
      LocalStorage.set(SETTINGS_KEY_NAME, configuration)
    }
  }
}

export default () => settingsHandler()
