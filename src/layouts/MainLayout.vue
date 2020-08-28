<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-black text-white">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          NetCheck
        </q-toolbar-title>

        <div>
          <q-toggle @input="this.toggleDarkMode" v-model="darkMode" icon="bedtime"/>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
    >
      <q-list>
        <q-item-label
          header
          class="text-grey-8"
        >
          Navigation Links
        </q-item-label>
        <NavigationLink
          v-for="link in navigationLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view :key="$route.path" />
    </q-page-container>
  </q-layout>
</template>

<script>
import NavigationLink from 'components/Navigation'
export default {
  name: 'MainLayout',

  components: {
    NavigationLink: NavigationLink
  },

  data () {
    return {
      leftDrawerOpen: false,
      darkMode: false,
      sse: {
        eventSource: null,
        eventListener: null
      },
      navigationLinks: [
        {
          title: 'Domain Check Page',
          caption: 'Check a domain',
          icon: 'visibility',
          link: '/'
        },
        {
          title: 'Monitored Domains',
          caption: 'Check all domains currently monitored',
          icon: 'view_list',
          link: '/domains'
        },
        {
          title: 'Info',
          caption: 'About WebCheck',
          icon: 'info',
          link: '/info'
        }
      ]
    }
  },
  methods: {
    toggleDarkMode () {
      this.$q.dark.toggle()
      this.darkMode = this.$q.dark.isActive
    }
  },
  async created () {
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

    const eventListener = (event) => {
      const data = JSON.parse(event.data)
      this.$q.notify({
        type: generateType(data),
        message: generateMessage(data),
        actions: [
          { label: 'Go to monitoring page', handler: () => this.$router.push(`/domains/${data.hostname}`) },
          { label: 'Dismiss', color: 'white' }
        ],
        caption: data.message,
        position: 'top-right',
        timeout: 10000
      })
    }

    const eventSource = new EventSource('http://127.0.0.1:8080/api/v1/event')
    eventSource.addEventListener('Notification', eventListener, false)
    eventSource.onerror = (e) => {
      this.$q.notify({
        type: 'negative',
        message: 'Backend connection issue',
        caption: e,
        position: 'top-right',
        timeout: 10000
      })
    }
    this.sse = {
      eventSource,
      eventListener
    }
  },
  async beforeDestroy () {
    if (this.sse.eventSource) {
      console.log('Closing sse connection')
      this.sse.eventSource.removeEventListener('Notification', this.sse.eventListener, false)
      this.sse.eventSource.close()
    } else {
      console.log('No sse eventSource found.')
    }
  }
}
</script>
