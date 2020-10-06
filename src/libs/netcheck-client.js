import axios from 'axios'
import { path } from 'ramda'
let es

const eventSourceHandler = eventSource => ({
  close: () => eventSource.close(),
  onError: (errorHandler) => {
    eventSource.onerror = errorHandler
  },
  subscribe: ({ eventType, consumer }) => {
    eventSource.addEventListener(eventType, consumer, false)
    return {
      unsubscribe: () => {
        eventSource.removeEventListener(eventType, consumer, false)
      }
    }
  }
})

const handleGetRequest = async url => {
  return axios.get(url).then(resp => {
    return {
      data: resp.data,
      success: true,
      status: resp.status
    }
  }).catch(err => {
    return {
      error: err,
      data: path(['response', 'data'], err),
      success: false,
      status: path(['response', 'status'], err)
    }
  })
}

const handleDeleteRequest = async url => {
  return axios.delete(url).then(resp => {
    return {
      data: resp.data,
      success: true,
      status: resp.status
    }
  }).catch(err => {
    return {
      error: err,
      data: path(['response', 'data'], err),
      success: false,
      status: path(['response', 'status'], err)
    }
  })
}

const handlePutRequest = async url => {
  return axios.put(url).then(resp => {
    return {
      data: resp.data,
      success: true,
      status: resp.status
    }
  }).catch(err => {
    return {
      error: err,
      data: path(['response', 'data'], err),
      success: false,
      status: path(['response', 'status'], err)
    }
  })
}

const handlePatchRequest = async ({ url, payload }) => {
  return axios.patch(url, payload).then(resp => {
    return {
      data: resp.data,
      success: true,
      status: resp.status
    }
  }).catch(err => {
    return {
      error: err,
      data: path(['response', 'data'], err),
      success: false,
      status: path(['response', 'status'], err)
    }
  })
}

export default ({ baseUrl = '', withEventSource = false } = {}) => {
  if (withEventSource) {
    es = new EventSource(`${baseUrl}/events`)
  }
  return {
    domains: async ({ page, size, showLastChecks = false, filter, sortBy = 'createdAt', descending = true }) => {
      let additionalProps = ''
      if (filter !== '') {
        additionalProps = additionalProps + `&filter=${filter}`
      }
      return handleGetRequest(`${baseUrl}/api/v1/domains?page=${page}&size=${size}&sortBy=${sortBy}&desc=${descending}&showLastChecks=${showLastChecks}${additionalProps}`)
    },
    domainStatus: async ({ domain }) => handleGetRequest(`${baseUrl}/api/v1/domains/${domain}`),
    upsertDomainConfigProperty: async ({ domain, field, value }) => handlePatchRequest({
      url: `${baseUrl}/api/v1/domains/${domain}`,
      payload: [{
        op: 'add',
        field,
        value
      }]
    }),
    removeDomainConfigProperty: async ({ domain, field }) => handlePatchRequest({
      url: `${baseUrl}/api/v1/domains/${domain}`,
      payload: [{
        op: 'delete',
        field
      }]
    }),
    upsertDomainHeader: async ({ domain, header, value }) => handlePatchRequest({
      url: `${baseUrl}/api/v1/domains/${domain}`,
      payload: [{
        op: 'add',
        field: 'header',
        path: header,
        value
      }]
    }),
    removeDomainHeader: async ({ domain, header }) => handlePatchRequest({
      url: `${baseUrl}/api/v1/domains/${domain}`,
      payload: [{
        op: 'delete',
        field: 'header',
        path: header
      }]
    }),
    domainHistory: async ({ domain, page, size }) => handleGetRequest(`${baseUrl}/api/v1/domains/${domain}/history?size=${size}&page=${page}`),
    domainStates: async ({ domain, protocol, page, size }) => handleGetRequest(`${baseUrl}/api/v1/domains/${domain}/states?protocol=${protocol}&size=${size}&page=${page}`),
    domainMetrics: async ({ domain, protocol, period, page, size }) => handleGetRequest(`${baseUrl}/api/v1/domains/${domain}/metrics?protocol=${protocol}&period=${period}&size=${size}&page=${page}`),
    todaysDomainMetrics: async ({ domain, protocol }) => handleGetRequest(`${baseUrl}/api/v1/domains/${domain}/metrics?protocol=${protocol}&period=THIS_DAY`),
    check: async ({ domain }) => handleGetRequest(`${baseUrl}/api/v1/check/${domain}`),
    scheduleDomain: async ({ domain }) => handlePutRequest(`${baseUrl}/api/v1/domains/${domain}`),
    servers: async ({ page, size, filter = '', sortBy = 'createdAt', descending = true }) => {
      let additionalProps = ''
      if (filter !== '') {
        additionalProps = additionalProps + `&filter=${filter}`
      }
      return handleGetRequest(`${baseUrl}/api/v1/server?page=${page}&size=${size}&sortBy=${sortBy}&desc=${descending}${additionalProps}`)
    },
    removeDomain: async ({ domain }) => handleDeleteRequest(`${baseUrl}/api/v1/domains/${domain}`),
    serverConfig: async ({ serverId }) => handleGetRequest(`${baseUrl}/api/v1/server/${serverId}`),
    serverMetrics: async ({ serverId }) => handleGetRequest(`${baseUrl}/api/v1/server/${serverId}/metric`),
    health: async () => handleGetRequest(`${baseUrl}/api/v1/actuator/health`),
    info: async () => handleGetRequest(`${baseUrl}/api/v1/actuator/info`),
    metric: async ({ metricType }) => handleGetRequest(`${baseUrl}/api/v1/actuator/metrics/${metricType}`),
    events: () => es ? eventSourceHandler(es) : null
  }
}
