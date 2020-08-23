import axios from 'axios'

export default () => {
  const handleGetRequest = async (url) => {
    return axios.get(url).then(resp => {
      return {
        data: resp.data,
        success: true,
        status: resp.status
      }
    }).catch(err => {
      console.error(err)
      return {
        error: err,
        data: err.response.data,
        success: false,
        status: err.response.status
      }
    })
  }
  const handlePutRequest = async (url) => {
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
  return {
    domains: async ({ page, size, showLastChecks = false }) => handleGetRequest(`/api/v1/domains?page=${page}&size=${size}&showLastChecks=${showLastChecks}`),
    domainStatus: async ({ domain }) => handleGetRequest(`/api/v1/domains/${domain}`),
    domainHistory: async ({ domain, page, size }) => handleGetRequest(`/api/v1/domains/${domain}/history?size=${size}&page=${page}`),
    domainStates: async ({ domain, protocol, page, size }) => handleGetRequest(`/api/v1/domains/${domain}/states?protocol=${protocol}&size=${size}&page=${page}`),
    domainMetrics: async ({ domain, protocol, period, page, size }) => handleGetRequest(`/api/v1/domains/${domain}/metrics?protocol=${protocol}&period=${period}&size=${size}&page=${page}`),
    todaysDomainMetrics: async ({ domain, protocol }) => handleGetRequest(`/api/v1/domains/${domain}/metrics?protocol=${protocol}&period=THIS_DAY`),
    check: async ({ domain }) => handleGetRequest(`/api/v1/check/${domain}`),
    scheduleDomain: async ({ domain }) => handlePutRequest(`/api/v1/domains/${domain}`),
    health: async () => handleGetRequest('/api/v1/actuator/health'),
    info: async () => handleGetRequest('/api/v1/actuator/info'),
    metric: async ({ metricType }) => handleGetRequest(`/api/v1/actuator/metrics/${metricType}`)
  }
}
