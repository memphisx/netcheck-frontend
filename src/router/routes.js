
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      name: 'main-view',
      path: '',
      component: () => import('pages/Index.vue')
    }]
  },
  {
    path: '/info/',
    component: () => import('layouts/MainLayout.vue'),
    props: {
      pageTitle: 'Info'
    },
    children: [{
      name: 'info-view',
      path: '',
      component: () => import('pages/Info.vue')
    }]
  },
  {
    path: '/domains/',
    component: () => import('layouts/MainLayout.vue'),
    props: {
      pageTitle: 'Monitored Domains'
    },
    children: [{
      name: 'domain-list',
      path: '',
      component: () => import('pages/MonitoredDomains.vue')
    }]
  },
  {
    path: '/domains/:domain',
    component: () => import('layouts/MainLayout.vue'),
    props: route => ({
      pageTitle: route.params.domain,
      domainView: true
    }),
    children: [{
      name: 'domain-view',
      path: '',
      component: () => import('pages/DomainStatus.vue')
    }]
  },
  {
    path: '/domains/:domain/config',
    component: () => import('layouts/MainLayout.vue'),
    props: route => ({
      pageTitle: route.params.domain,
      domainConfigView: true
    }),
    children: [{
      name: 'domain-config-view',
      path: '',
      component: () => import('pages/DomainConfig.vue')
    }]
  },
  {
    path: '/servers/',
    component: () => import('layouts/MainLayout.vue'),
    props: {
      pageTitle: 'Monitored Servers'
    },
    children: [{
      name: 'server-list',
      path: '',
      component: () => import('pages/MonitoredServers.vue')
    }]
  },
  {
    path: '/servers/:serverId',
    component: () => import('layouts/MainLayout.vue'),
    props: {
      pageTitle: 'Server Metrics'
    },
    children: [{
      name: 'server-view',
      path: '',
      component: () => import('pages/ServerStatus.vue')
    }]
  },
  {
    path: '/settings/',
    component: () => import('layouts/MainLayout.vue'),
    props: {
      pageTitle: 'Settings'
    },
    children: [{
      name: 'settings-view',
      path: '',
      component: () => import('pages/Settings.vue')
    }]
  },
  {
    path: '/check/',
    component: () => import('layouts/MainLayout.vue'),
    props: {
      pageTitle: 'Domain Check'
    },
    children: [{
      name: 'check-view',
      path: '',
      component: () => import('pages/CheckTrigger.vue')
    }]
  },
  {
    path: '/check/:domain',
    component: () => import('layouts/MainLayout.vue'),
    props: route => ({ pageTitle: route.params.domain }),
    children: [{
      name: 'domain-check',
      path: '',
      component: () => import('pages/DomainCheck.vue')
    }]
  }
]

// Always leave this as last one
routes.push({
  path: '*',
  component: () => import('pages/Error404.vue')
})
export default routes
