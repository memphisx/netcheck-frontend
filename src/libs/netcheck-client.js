import axios from 'axios'
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
      data: err.response.data,
      success: false,
      status: err.response.status
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
      data: err.response.data,
      success: false,
      status: err.response.status
    }
  })
}
export default ({ baseUrl = '', withEventSource = false } = {}) => {
  if (withEventSource) {
    es = new EventSource(`${baseUrl}/events`)
  }
  return {
    domains: async ({ page, size, showLastChecks = false }) => handleGetRequest(`${baseUrl}/api/v1/domains?page=${page}&size=${size}&showLastChecks=${showLastChecks}`),
    domainStatus: async ({ domain }) => handleGetRequest(`${baseUrl}/api/v1/domains/${domain}`),
    domainHistory: async ({ domain, page, size }) => handleGetRequest(`${baseUrl}/api/v1/domains/${domain}/history?size=${size}&page=${page}`),
    domainStates: async ({ domain, protocol, page, size }) => handleGetRequest(`${baseUrl}/api/v1/domains/${domain}/states?protocol=${protocol}&size=${size}&page=${page}`),
    domainMetrics: async ({ domain, protocol, period, page, size }) => handleGetRequest(`${baseUrl}/api/v1/domains/${domain}/metrics?protocol=${protocol}&period=${period}&size=${size}&page=${page}`),
    todaysDomainMetrics: async ({ domain, protocol }) => handleGetRequest(`${baseUrl}/api/v1/domains/${domain}/metrics?protocol=${protocol}&period=THIS_DAY`),
    check: async ({ domain }) => handleGetRequest(`${baseUrl}/api/v1/check/${domain}`),
    scheduleDomain: async ({ domain }) => handlePutRequest(`${baseUrl}/api/v1/domains/${domain}`),
    health: async () => handleGetRequest(`${baseUrl}/api/v1/actuator/health`),
    info: async () => handleGetRequest(`${baseUrl}/api/v1/actuator/info`),
    metric: async ({ metricType }) => handleGetRequest(`${baseUrl}/api/v1/actuator/metrics/${metricType}`),
    events: () => es ? eventSourceHandler(es) : null
  }
}
