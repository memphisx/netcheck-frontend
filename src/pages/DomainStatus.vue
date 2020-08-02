<template>
  <div>
    <!-- Domain Check information -->
    <div v-if="domainDetails.monitored && !loading">
      <q-tabs
        v-model="tab"
        align="justify"
        indicator-color="primary"
        active-color="white"
        active-bg-color="primary"
      >
        <q-tab
          :name="protocol"
          :label="protocol"
          v-for="protocol in protocolsToCheck"
          v-bind:key="protocol"
        />
      </q-tabs>

      <q-tab-panels v-model="tab">
        <q-tab-panel
          :name="protocol"
          v-for="protocol in protocolsToCheck"
          v-bind:key="protocol"
        >
          <div class="flex flex-center">
            <div v-for="(item,name) in cards[tab]" v-bind:key="name">
                <GenericInfoCard
                  :cardClass="item.cardClass"
                  :description="item.description"
                  :icon="item.icon"
                  :value="item.value"
                  :suffix="item.suffix"
                  :type="item.type"
                  :decimalPlaces="item.decimalPlaces"
                  :linkTo="item.linkTo"
                  :dialogInfo="item.dialogInfo"
                />
            </div>
          </div>
          <q-splitter v-model="splitterModel" horizontal>
            <template v-slot:before>
              <q-tabs
                v-model="httpInnerTab"
                swipeable
                horizontal
                indicator-color="primary"
                active-color="white"
                active-bg-color="primary"
              >
                <q-tab name="performance" icon="speed" label="Performance" class="responsive-label"/>
                <q-tab name="uptimeChecks" icon="update" label="Uptime" class="responsive-label"/>
                <q-tab name="states" icon="dns" label="States" class="responsive-label"/>
                <q-tab name="latestChecks" icon="bar_chart" label="Checks" class="responsive-label"/>
              </q-tabs>
            </template>

            <template v-slot:after>
              <q-tab-panels v-model="httpInnerTab">
                <q-tab-panel name="performance">
                  <Performance
                    :protocol="protocol"
                    :domain="$route.params.domain"
                  ></Performance>
                </q-tab-panel>

                <q-tab-panel name="uptimeChecks">
                  <UptimeChecks
                    :protocol="protocol"
                    :domain="$route.params.domain"
                  ></UptimeChecks>
                </q-tab-panel>

                <q-tab-panel name="states">
                  <StateHistory
                    :protocol="protocol"
                    :domain="$route.params.domain"
                  ></StateHistory>
                </q-tab-panel>

                <q-tab-panel name="latestChecks">
                  <LatestTests
                    :protocol="protocol"
                    :domain="$route.params.domain"
                    :key="cards[protocol].lastCheck.value"
                  ></LatestTests>
                </q-tab-panel>
              </q-tab-panels>
            </template>

          </q-splitter>
        </q-tab-panel>
      </q-tab-panels>
    </div>
    <div v-if="!domainDetails.monitored && !loading">
      <div class="flex flex-center">
        <div class="q-pa-md">
          <GenericInfoCard
            card-class="bg-secondary"
            icon="warning"
            :value="`No scheduled checks have been triggered yet for ${$route.params.domain}`"
          />
        </div>
      </div>
    </div>
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="100px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import LatestTests from 'components/LatestTests'
import netcheck from '../libs/netcheck-client'
import StateHistory from 'components/StateHistory'
import Performance from 'components/Performance'
import UptimeChecks from 'components/UptimeChecks'
import GenericInfoCard from 'components/GenericInfoCard'
import moment from 'moment'
export default {
  name: 'DomainStatus',
  data () {
    return {
      scheduledTasks: [],
      loading: true,
      checkFrequency: 10,
      cards: {
        HTTP: {},
        HTTPS: {}
      },
      tab: 'HTTP',
      httpInnerTab: 'performance',
      splitterModel: 5,
      protocolsToCheck: [
        'HTTP',
        'HTTPS'
      ],
      scheduledSuccessfully: false,
      domainDetails: {
        monitored: null,
        httpChecks: [],
        issuerCertificate: {}
      }
    }
  },
  components: {
    GenericInfoCard,
    UptimeChecks,
    StateHistory,
    LatestTests,
    Performance
  },
  methods: {
    calculateNextCheck () {
      return moment(this.checkedOn).add(this.checkFrequency, 'minutes').add(1, 'seconds')
    },
    calculateNextCheckInSeconds () {
      const now = moment(Date.now())
      const nextCheck = moment(this.calculateNextCheck())
      const diff = nextCheck.diff(now)
      return moment.duration(diff).asSeconds()
    },
    async fetchDomainStatus () {
      console.log('Fetching Domain Status')
      const resp = await netcheck().domainStatus({ domain: this.$route.params.domain })
      if (resp.success) {
        resp.data.lastChecks.httpChecks.forEach(check => {
          this.checkedOn = check.checkedOn
          this.checkFrequency = resp.data.checkFrequencyMinutes
          this.cards[check.protocol.toUpperCase()].domain = {
            cardClass: 'round-corners bg-primary',
            description: 'Domain',
            icon: 'language',
            value: resp.data.domain,
            linkTo: `${check.protocol}://${resp.data.domain}`
          }
          this.cards[check.protocol.toUpperCase()].state = {
            cardClass: check.up ? 'round-corners bg-green' : 'round-corners bg-red',
            description: 'Current state',
            icon: check.up ? 'cloud_done' : 'cloud_off',
            value: check.up ? 'Up' : 'Down',
            dialogInfo: {
              title: 'Last Check status',
              data: [
                {
                  title: 'Status',
                  value: check.up ? 'Up' : 'Down'
                },
                {
                  title: 'Hostname',
                  value: check.hostname
                },
                {
                  title: 'IP address',
                  value: check.ipAddress
                },
                {
                  title: 'Status code',
                  value: check.statusCode
                },
                {
                  title: 'Response time',
                  value: `${check.responseTimeNs} ns`
                },
                {
                  title: 'DNS resolved',
                  value: check.dnsResolves
                }
              ]
            }
          }
          if (check.redirectUri) {
            this.cards[check.protocol.toUpperCase()].state.dialogInfo.data.push({
              title: 'Redirects to',
              value: check.redirectUri
            })
          }
          this.cards[check.protocol.toUpperCase()].lastCheck = {
            cardClass: 'round-corners bg-secondary',
            description: 'Last check',
            icon: 'update',
            value: check.checkedOn,
            type: 'duration',
            suffix: 's',
            dialogInfo: {
              title: 'Last Check info',
              data: [
                {
                  title: 'Last check triggered on',
                  value: moment(check.checkedOn).format('LLL')
                },
                {
                  title: 'Next check will be triggered on',
                  value: moment(check.checkedOn).add(this.checkFrequency, 'minutes').format('LLL')
                }
              ]
            }
          }
          if (check.protocol === 'HTTPS' && resp.data.lastChecks.issuerCertificate) {
            const end = moment(Date.now())
            const currentTime = moment(resp.data.lastChecks.issuerCertificate.notAfter)
            const duration = moment.duration(currentTime.diff(end)).asDays().toFixed(0)
            const dialogInfo = {
              title: 'Certificate info',
              data: [{
                title: 'Issuer',
                value: Object.keys(resp.data.lastChecks.issuerCertificate.issuedBy).map((k) => `${k}: ${resp.data.lastChecks.issuerCertificate.issuedBy[k]}`).join(', ')
              },
              {
                title: 'Issued for',
                value: Object.keys(resp.data.lastChecks.issuerCertificate.issuedFor).map((k) => `${k}: ${resp.data.lastChecks.issuerCertificate.issuedFor[k]}`).join(', ')
              },
              {
                title: 'Valid from',
                value: moment(resp.data.lastChecks.issuerCertificate.notBefore).format('LLL')
              },
              {
                title: 'Expires on',
                value: moment(resp.data.lastChecks.issuerCertificate.notAfter).format('LLL')
              }]
            }
            if (resp.data.lastChecks.issuerCertificate.valid) {
              this.cards[check.protocol.toUpperCase()].certificateInfo = {
                cardClass: Number(duration) > 10 ? 'round-corners bg-green' : 'round-corners bg-orange',
                description: 'Certificate Expires in',
                icon: 'verified_user',
                value: duration,
                type: 'countUp',
                suffix: 'days',
                dialogInfo
              }
            } else if (resp.data.lastChecks.issuerCertificate.expired) {
              this.cards[check.protocol.toUpperCase()].certificateInfo = {
                cardClass: 'round-corners bg-red',
                description: 'Certificate expired',
                icon: 'security',
                type: 'countUp',
                value: Math.abs(Number(duration)),
                suffix: 'days ago',
                dialogInfo
              }
            }
          }
        })
        this.domainDetails = resp.data
        this.domainDetails.monitored = true
      }
    },
    async fetchLastHourMetrics (protocol) {
      console.log('Fetching Last Hour Metrics')
      const resp = await netcheck().todaysDomainMetrics({ domain: this.$route.params.domain, protocol })
      if (resp.success) {
        const metric = resp.data._embedded.metrics[0]
        const uptimePercentage = (metric.successfulChecks === metric.totalChecks) ? 100 : ((metric.successfulChecks * 100) / metric.totalChecks)
        const avgResponseTime = (metric.averageResponseTime / 1000000000).toFixed(3)
        this.cards[protocol].todaysUptime = {
          cardClass: (uptimePercentage > 90) ? 'round-corners bg-green' : 'round-corners bg-red',
          description: 'Today\'s Uptime',
          icon: 'backup',
          value: uptimePercentage,
          decimalPlaces: (metric.successfulChecks === metric.totalChecks) ? 0 : 2,
          suffix: '%',
          type: 'countUp',
          dialogInfo: {
            title: 'Last 24 Hours Uptime',
            data: [
              {
                title: 'Total Checks',
                value: metric.totalChecks
              },
              {
                title: 'Successful Checks',
                value: metric.successfulChecks
              },
              {
                title: 'From',
                value: moment(metric.metricPeriodStart).format('LLL')
              },
              {
                title: 'To',
                value: moment(metric.metricPeriodEnd).format('LLL')
              }
            ]
          }
        }
        this.cards[protocol].todaysAvgResponseTime = {
          cardClass: 'round-corners bg-primary',
          description: 'Today\'s average response time',
          icon: 'timer',
          value: avgResponseTime,
          decimalPlaces: 3,
          suffix: 's',
          type: 'countUp',
          dialogInfo: {
            title: 'Last 24 Hours Performance',
            data: [
              {
                title: 'Average response time',
                value: `${(metric.averageResponseTime / 1000000000).toFixed(3)} seconds`
              },
              {
                title: 'Best response time',
                value: `${(metric.minResponseTime / 1000000000).toFixed(3)} seconds`
              },
              {
                title: 'Worst response time',
                value: `${(metric.maxResponseTime / 1000000000).toFixed(3)} seconds`
              },
              {
                title: 'From',
                value: moment(metric.metricPeriodStart).format('LLL')
              },
              {
                title: 'To',
                value: moment(metric.metricPeriodEnd).format('LLL')
              }
            ]
          }
        }
      }
    },
    async pollNewData (scope) {
      let updatedOnTime = false
      while (!updatedOnTime) {
        console.log('Refreshing Data')
        await scope.fetchDomainStatus()
        for (const protocol of scope.protocolsToCheck) {
          await scope.fetchLastHourMetrics(protocol)
        }
        const duration = scope.calculateNextCheckInSeconds()
        updatedOnTime = duration > 0
        console.log('Duration until next check')
        console.log(duration)
        if (!updatedOnTime) {
          await new Promise(resolve => setTimeout(resolve, 2000))
          console.log('Waited for 2 seconds')
        } else {
          console.log('Updated as expected on time')
        }
      }
    }
  },
  computed: {
    allTabs () {
      return {
        protocol: this.tab,
        details: this.httpInnerTab
      }
    }
  },
  watch: {
    async allTabs (value) {
      await this.$router.replace({ name: 'domain-view', query: { protocol: value.protocol.toUpperCase(), details: value.details } })
    }
  },
  async mounted () {
    if (this.$router.currentRoute.query.protocol && (this.$router.currentRoute.query.protocol === 'HTTP' || this.$router.currentRoute.query.protocol === 'HTTPS')) {
      this.tab = this.$router.currentRoute.query.protocol
    }
    if (this.$router.currentRoute.query.details && (
      this.$router.currentRoute.query.details === 'performance' ||
      this.$router.currentRoute.query.details === 'uptimeChecks' ||
      this.$router.currentRoute.query.details === 'states' ||
      this.$router.currentRoute.query.details === 'latestChecks')
    ) {
      this.httpInnerTab = this.$router.currentRoute.query.details
    }
    this.loading = true
    await this.pollNewData(this)
    this.loading = false
    const nextRefreshInSeconds = this.calculateNextCheckInSeconds()
    console.log(`Data will refresh in ${nextRefreshInSeconds} seconds`)
    await new Promise(resolve => setTimeout(resolve, nextRefreshInSeconds * 1000))
    const self = this
    await this.pollNewData(self)
    console.log('Data refreshed')
    console.log('Setting up scheduled refreshes')
    this.scheduledTasks.push(setInterval(async () => this.pollNewData(self), this.checkFrequency * 60 * 1000))
  },
  async beforeDestroy () {
    await this.scheduledTasks.forEach((task) => {
      clearInterval(task)
    })
  }
}
</script>
<style lang="sass">
  .responsive-label .q-tab__label
    @media(max-width: 430px)
      display: none
</style>
