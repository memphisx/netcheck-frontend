
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') }
    ]
  },
  {
    path: '/info/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Info.vue') }
    ]
  },
  {
    path: '/domains/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/MonitoredDomains.vue') }
    ]
  },
  {
    path: '/domains/:domain',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'domain-view', path: '', component: () => import('pages/DomainStatus.vue') }
    ]
  },
  {
    path: '/check/:domain',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/DomainCheck.vue') }
    ]
  }
]

// Always leave this as last one
routes.push({
  path: '*',
  component: () => import('pages/Error404.vue')
})
export default routes
