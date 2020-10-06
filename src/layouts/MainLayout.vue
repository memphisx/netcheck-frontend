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
          {{ pageTitle }}
        </q-toolbar-title>

        <div v-if="domainView">
          <q-btn flat round dense icon="settings" @click="$router.push(`/domains/${$route.params.domain}/config`)">
            <q-tooltip anchor="center left" self="center right">
              Domain settings page
            </q-tooltip>
          </q-btn>
        </div>
        <div v-if="domainConfigView">
          <q-btn flat round dense icon="poll" @click="$router.push(`/domains/${$route.params.domain}`)">
            <q-tooltip anchor="center left" self="center right">
              Monitoring page
            </q-tooltip>
          </q-btn>
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
          <q-img alt="NetCheck logo" src="~assets/netcheck-logo.png" style="width: 100%" />
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
  props: ['pageTitle', 'domainView', 'domainConfigView'],
  components: {
    NavigationLink: NavigationLink
  },

  data () {
    return {
      leftDrawerOpen: false,
      navigationLinks: [
        {
          title: 'Domain Check Page',
          caption: 'Check a domain',
          icon: 'visibility',
          link: '/'
        },
        {
          title: 'Monitored Domains',
          caption: 'List of all monitored domains',
          icon: 'dashboard',
          link: '/domains'
        },
        {
          title: 'Monitored Servers',
          caption: 'List of all monitored servers',
          icon: 'view_list',
          link: '/servers'
        },
        {
          title: 'Settings',
          caption: 'UI configuration',
          icon: 'settings',
          link: '/settings'
        },
        {
          title: 'Info',
          caption: 'About NetCheck',
          icon: 'info',
          link: '/info'
        }
      ]
    }
  }
}
</script>
