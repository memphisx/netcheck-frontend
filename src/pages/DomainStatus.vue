<template>
  <div>
    <!-- Domain -->
    <div class="text-center text-h4 q-pa-lg">
      {{ $route.params.domain }}
    </div>

    <!-- Domain Check information -->
    <div class="flex">
      <div class="q-pa-md" style="max-width: 400px" v-for="check in domainDetails.data.httpChecks" :key="check.protocol">
        <q-list bordered class="rounded-borders shadow-12">
          <div>
            <q-expansion-item
              expand-separator
              default-closed
              icon="http"
              :label="check.protocol"
              caption="Protocol Accessibility info"
            >
              <q-card>
                <q-card-section>
                  <q-list bordered separator>
                    <q-item clickable v-ripple>
                      <q-item-section>
                        <q-item-label overline>Status code</q-item-label>
                        <q-item-label>{{ check.statusCode }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-ripple>
                      <q-item-section>
                        <q-item-label overline>Response Time</q-item-label>
                        <q-item-label>{{ check.responseTimeNs / 1000000 }}ms</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-ripple>
                      <q-item-section>
                        <q-item-label overline>Checked On</q-item-label>
                        <q-item-label>{{ check.checkedOn }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </q-expansion-item>
            <div v-if="check.protocol === 'HTTPS'">
              <q-expansion-item
                default-closed
                expand-separator
                icon="security"
                label="Certificate"
                header-class="text-black"
              >
                <q-card>
                  <q-card-section>
                    <q-list bordered separator>
                      <q-item clickable v-ripple>
                        <q-item-section>
                          <q-item-label overline>Valid</q-item-label>
                          <q-item-label class="text-bold">{{ domainDetails.data.issuerCertificate.valid }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-ripple>
                        <q-item-section>
                          <q-item-label overline>Expired</q-item-label>
                          <q-item-label class="text-bold">{{ domainDetails.data.issuerCertificate.expired }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-ripple>
                        <q-item-section>
                          <q-item-label overline>Valid From</q-item-label>
                          <q-item-label class="text-bold">{{ domainDetails.data.issuerCertificate.notBefore  }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-ripple>
                        <q-item-section>
                          <q-item-label overline>Expires On</q-item-label>
                          <q-item-label class="text-bold">{{ domainDetails.data.issuerCertificate.notAfter }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-ripple>
                        <q-item-section>
                          <q-item-label overline>Certificate Issued By</q-item-label>
                          <q-item-label class="text-bold">{{ domainDetails.data.issuerCertificate.issuedBy }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-ripple>
                        <q-item-section>
                          <q-item-label overline>Issued For</q-item-label>
                          <q-item-label class="text-bold">{{ domainDetails.data.issuerCertificate.issuedFor  }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </div>
            <q-expansion-item
              default-closed
              expand-separator
              icon="dns"
              label="DNS Status"
              caption="Domain Name Resolution"
            >
              <q-card>
                <q-card-section>
                  <q-list bordered separator>
                    <q-item clickable v-ripple>
                      <q-item-section>
                        <q-item-label overline>DNS entry found</q-item-label>
                        <q-item-label>{{ check.dnsResolves }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-ripple>
                      <q-item-section>
                        <q-item-label overline>IP Address</q-item-label>
                        <q-item-label>{{ check.ipAddress }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-ripple>
                      <q-item-section>
                        <q-item-label overline>Host name</q-item-label>
                        <q-item-label>{{ check.hostname }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>
        </q-list>
      </div>
    </div>

    <!-- History -->
    <div v-if="domainIsScheduled">
      <div class="flex q-pa-md">
        <q-list bordered class="rounded-borders shadow-12">
          <q-expansion-item
            default-opened
            expand-separator
            icon="bar_chart"
            label="Http Check History"
            header-class="text-black"
          >
            <q-card>
              <q-card-section class="q-pa-none">
                <apexchart width="700" type="bar" :options="httpChart.options" :series="httpChart.series" :key="domainHistoryHttp.length"></apexchart>
              </q-card-section>
            </q-card>
            <q-card>
              <q-card-section class="q-pa-none">
                <q-markup-table>
                  <thead>
                    <tr>
                      <th class="text-left">Check date and time</th>
                      <th class="text-right">Status Code</th>
                      <th class="text-right">DNS resolved</th>
                      <th class="text-right">IP Address</th>
                      <th class="text-right">Response time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="check in domainHistoryHttp" :key="check.checkedOn">
                        <td class="text-left">{{check.checkedOn}}</td>
                        <td class="text-right">{{check.statusCode}}</td>
                        <td class="text-right">{{check.dnsResolves}}</td>
                        <td class="text-right">{{check.ipAddress}}</td>
                        <td class="text-right">{{check.responseTimeNs/1000000 }}ms</td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
        <q-list bordered class="rounded-borders shadow-12">
          <q-expansion-item
            default-opened
            expand-separator
            icon="bar_chart"
            label="Https Check History"
            header-class="text-black"
          >
            <q-card>
              <q-card-section class="q-pa-none">
                <apexchart width="700" type="bar" :options="httpsChart.options" :series="httpsChart.series" :key="domainHistoryHttps.length"></apexchart>
              </q-card-section>
            </q-card>
            <q-card>
              <q-card-section class="q-pa-none">
                <q-markup-table>
                  <thead>
                  <tr>
                    <th class="text-left">Check date and time</th>
                    <th class="text-right">Status Code</th>
                    <th class="text-right">DNS resolved</th>
                    <th class="text-right">IP Address</th>
                    <th class="text-right">Response time</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="check in domainHistoryHttps" :key="check.checkedOn">
                    <td class="text-left">{{check.checkedOn}}</td>
                    <td class="text-right">{{check.statusCode}}</td>
                    <td class="text-right">{{check.dnsResolves}}</td>
                    <td class="text-right">{{check.ipAddress}}</td>
                    <td class="text-right">{{check.responseTimeNs/1000000 }}ms</td>
                  </tr>
                  </tbody>
                </q-markup-table>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </div>
    </div>
    <div v-else>
      <div class="flex q-pa-md">
        <q-list bordered class="rounded-borders shadow-12">
          <q-card>
            <q-card-section class="q-pa-none">
              <div class="text-center text-body1 q-pa-lg">
                This is not an actively monitored domain. Click the button bellow if you want to save the domain for scheduled checks.
                <div class="q-pa-lg">
                  <q-btn color="black" class="full-width " label="Schedule Domain" v-on:click.native="scheduleDomain" v-bind:class="{disabled: scheduledSuccessfully}"
                         v-bind:disabled="scheduledSuccessfully"/>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'

export default {
  name: 'WebCheck',
  data () {
    return {
      httpsChart: {
        options: {
          chart: {
            id: 'vuechart-https'
          },
          xaxis: {
            categories: []
          }
        },
        series: [{
          name: 'Response time (ms)',
          data: []
        }]
      },
      httpChart: {
        options: {
          chart: {
            id: 'vuechart-http'
          },
          xaxis: {
            categories: []
          }
        },
        series: [{
          name: 'Response time (ms)',
          data: []
        }]
      },
      domainIsScheduled: false,
      scheduledSuccessfully: false,
      domainHistory: [],
      domainHistoryHttp: [],
      domainHistoryHttps: [],
      domainDetails: {
        data: {
          httpChecks: [],
          issuerCertificate: {}
        }
      }
    }
  },
  components: {
    apexchart: VueApexCharts
  },
  methods: {
    generateChartDataForHttps (httpsChecks) {
      const moment = require('moment')
      const categories = []
      const seriesData = []
      httpsChecks.forEach(httpsCheck => {
        categories.push(moment(httpsCheck.checkedOn).format('hh:mm'))
        seriesData.push(Math.round(httpsCheck.responseTimeNs / 1000000))
      })
      this.httpsChart.options.xaxis.categories = categories
      this.httpsChart.series[0].data = seriesData
    },
    generateChartDataForHttp (httpChecks) {
      const moment = require('moment')
      const categories = []
      const seriesData = []
      httpChecks.forEach(httpCheck => {
        categories.push(moment(httpCheck.checkedOn).format('hh:mm'))
        seriesData.push(Math.round(httpCheck.responseTimeNs / 1000000))
      })
      this.httpChart.options.xaxis.categories = categories
      this.httpChart.series[0].data = seriesData
    },
    scheduleDomain () {
      const http = require('axios')

      return http
        .put(`${process.env.BACKEND_URL}/domains/${this.$route.params.domain}`)
        .then(resp => {
          this.scheduledSuccessfully = true
        })
        .catch(err => {
          console.error(err)
        })
    },
    checkIfDomainIsScheduled () {
      const http = require('axios')

      return http
        .get(`${process.env.BACKEND_URL}/domains/`)
        .then(resp => {
          if (resp.data._embedded && resp.data._embedded.domains && resp.data._embedded.domains.length) {
            resp.data._embedded.domains.forEach(domain => {
              if (domain.domain === this.$route.params.domain) {
                this.scheduledSuccessfully = false
                this.domainIsScheduled = true
                this.fetchDomainHistory()
              }
            })
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchDomainStatus () {
      const http = require('axios')

      return http
        .get(`${process.env.BACKEND_URL}/domains/${this.$route.params.domain}`)
        .then(resp => {
          this.domainDetails = resp
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchDomainHistory () {
      const http = require('axios')

      return http
        .get(`${process.env.BACKEND_URL}/domains/${this.$route.params.domain}/history`)
        .then(resp => {
          if (resp.data._embedded && resp.data._embedded.domainChecks) {
            const httpChecks = []
            const httpsChecks = []
            resp.data._embedded.domainChecks.forEach(domainCheck => {
              domainCheck.httpChecks.forEach(httpCheck => {
                if (httpCheck.protocol === 'HTTP') {
                  httpChecks.push(httpCheck)
                }
                if (httpCheck.protocol === 'HTTPS') {
                  httpsChecks.push(httpCheck)
                }
              })
            })
            this.generateChartDataForHttps(httpsChecks)
            this.generateChartDataForHttp(httpChecks)
            this.domainHistoryHttps = httpsChecks
            this.domainHistoryHttp = httpChecks
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  },
  created () {
    this.$q.loadingBar.start()
    this.checkIfDomainIsScheduled()
    this.fetchDomainStatus()
    this.$q.loadingBar.stop()
  }
}
</script>
