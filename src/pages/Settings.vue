<template>
  <div class="q-pa-md">
    <q-list>
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Dark theme</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle @input="this.toggleDarkMode" v-model="darkMode" icon="bedtime"/>
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Performance Graphs on Monitored Domains List</q-item-label>
          <q-item-label caption></q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle @input="this.toggleMonitoredDomainGraphs" v-model="monitoredDomainGraphsEnabled" icon="timeline"/>
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Monitored Domains are expanded by default</q-item-label>
          <q-item-label caption></q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle @input="this.toggleExpandedMonitoredDomains" v-model="monitoredDomainsExpanded" icon="unfold_more"/>
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>UI Notifications</q-item-label>
          <q-item-label caption></q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle @input="this.toggleUINotifications" v-model="uiNotifications" icon="notifications"/>
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Native Notifications</q-item-label>
          <q-item-label caption></q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle @input="this.toggleNativeNotifications" v-model="nativeNotifications" icon="phonelink"/>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
<script>
export default {
  name: 'Settings',
  data () {
    return {
      darkMode: this.$settings.isDarkMode(),
      monitoredDomainGraphsEnabled: this.$settings.isMonitoredDomainsGraphsEnabled(),
      monitoredDomainsExpanded: this.$settings.isMonitoredDomainsExpanded(),
      uiNotifications: this.$settings.areUINotificationsEnabled(),
      nativeNotifications: this.$settings.areNativeNotificationsEnabled()
    }
  },
  methods: {
    toggleDarkMode () {
      this.$settings.toggleDarkMode()
      this.darkMode = this.$settings.isDarkMode()
    },
    toggleMonitoredDomainGraphs () {
      this.$settings.toggleGraphsOnMonitoredDomains()
      this.monitoredDomainGraphsEnabled = this.$settings.isMonitoredDomainsGraphsEnabled()
    },
    toggleExpandedMonitoredDomains () {
      this.$settings.toggleMonitoredDomainsExpanded()
      this.monitoredDomainsExpanded = this.$settings.isMonitoredDomainsExpanded()
    },
    toggleUINotifications () {
      this.$settings.toggleUINotifications()
      this.uiNotifications = this.$settings.areUINotificationsEnabled()
    },
    toggleNativeNotifications () {
      this.$settings.toggleNativeNotifications()
      this.nativeNotifications = this.$settings.areNativeNotificationsEnabled()
    }
  }
}
</script>
