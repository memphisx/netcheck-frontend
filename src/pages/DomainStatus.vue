<template>
  <div>
    <!-- Domain Check information -->
    <div v-if="domainDetails.monitored && !loading">
      <q-tabs
        v-model="tab"
        align="justify"
        active-color="primary"
        indicator-color="primary"
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
          <div class="flex flex-center q-py-xl">
            <GenericInfoCard
              :cardClass="item.cardClass"
              :description="item.description"
              :icon="item.icon"
              :value="item.value"
              :suffix="item.suffix"
              :type="item.type"
              :decimalPlaces="item.decimalPlaces"
              v-for="(item) in cards[tab]"
              v-bind:key="item.description"
            />
          </div>
          <q-splitter v-model="splitterModel">
            <template v-slot:before>
              <q-tabs v-model="httpInnerTab" swipeable vertical>
                <q-tab name="performance" icon="speed" label="Performance" />
                <q-tab name="uptimeChecks" icon="update" label="Uptime" />
                <q-tab name="states" icon="dns" label="States" />
                <q-tab name="latestChecks" icon="bar_chart" label="Checks" />
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
import axios from 'axios'
import StateHistory from 'components/StateHistory'
import Performance from 'components/Performance'
import UptimeChecks from 'components/UptimeChecks'
import GenericInfoCard from 'components/GenericInfoCard'
import moment from 'moment'
export default {
  name: 'DomainStatus',
  data () {
    return {
      loading: true,
      nextCheck: moment(Date.now()).add(1, 'years'),
      cards: {
        HTTP: [],
        HTTPS: []
      },
      tab: 'HTTP',
      httpInnerTab: 'performance',
      httpsInnerTab: 'performance',
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
    async fetchDomainStatus () {
      return axios
        .get(`/api/v1/domains/${this.$route.params.domain}`)
        .then(resp => {
          resp.data.lastChecks.httpChecks.forEach(check => {
            const nextCheck = moment(check.checkedOn).add(resp.data.checkFrequencyMinutes, 'minutes').add(1, 'seconds')
            this.nextCheck = this.nextCheck.isBefore(nextCheck) ? this.nextCheck : nextCheck
            this.cards[check.protocol.toUpperCase()].push({
              cardClass: 'round-corners bg-primary',
              description: 'Domain',
              icon: 'language',
              value: resp.data.domain
            })
            this.cards[check.protocol.toUpperCase()].push({
              cardClass: check.up ? 'round-corners bg-green' : 'round-corners bg-red',
              description: 'Current state',
              icon: check.up ? 'cloud_done' : 'cloud_off',
              value: check.up ? 'Up' : 'Down'
            })
            this.cards[check.protocol.toUpperCase()].push({
              cardClass: 'round-corners bg-secondary',
              description: 'Last check',
              icon: 'update',
              value: check.checkedOn,
              type: 'duration',
              suffix: 's'
            })
            if (check.protocol === 'HTTPS' && resp.data.lastChecks.issuerCertificate) {
              const end = moment(Date.now())
              const currentTime = moment(resp.data.lastChecks.issuerCertificate.notAfter)
              const duration = moment.duration(currentTime.diff(end)).asDays().toFixed(0)
              if (resp.data.lastChecks.issuerCertificate.valid) {
                this.cards[check.protocol.toUpperCase()].push({
                  cardClass: Number(duration) > 10 ? 'round-corners bg-green' : 'round-corners bg-orange',
                  description: 'Certificate Expires in',
                  icon: 'verified_user',
                  value: duration,
                  suffix: 'days'
                })
              } else if (resp.data.lastChecks.issuerCertificate.expired) {
                this.cards[check.protocol.toUpperCase()].push({
                  cardClass: 'round-corners bg-red',
                  description: 'Certificate expired',
                  icon: 'security',
                  value: Math.abs(Number(duration)),
                  suffix: 'days ago'
                })
              }
            }
          })
          this.domainDetails = resp.data
          this.domainDetails.monitored = true
        })
        .catch(err => {
          console.error(err)
        })
    },
    async fetchLastHourMetrics (protocol) {
      return axios
        .get(`/api/v1/domains/${this.$route.params.domain}/metrics?protocol=${protocol}&period=THIS_DAY`)
        .then(resp => {
          const metric = resp.data._embedded.metrics[0]
          const uptimePercentage = (metric.successfulChecks === metric.totalChecks) ? 100 : ((metric.successfulChecks * 100) / metric.totalChecks)
          const avgResponseTime = (metric.averageResponseTime / 1000000000).toFixed(3)
          this.cards[protocol].push({
            cardClass: (uptimePercentage > 90) ? 'round-corners bg-green' : 'round-corners bg-red',
            description: 'Today\'s Uptime',
            icon: 'backup',
            value: uptimePercentage,
            decimalPlaces: (metric.successfulChecks === metric.totalChecks) ? 0 : 2,
            suffix: '%',
            type: 'countUp'
          })
          this.cards[protocol].push({
            cardClass: 'round-corners bg-primary',
            description: 'Today\'s average response time',
            icon: 'timer',
            value: avgResponseTime,
            decimalPlaces: 3,
            suffix: 's',
            type: 'countUp'
          })
        })
        .catch(err => {
          console.error(err)
        })
    }
  },
  async mounted () {
    this.loading = true
    await this.fetchDomainStatus()
    await this.protocolsToCheck.forEach(protocol => {
      this.fetchLastHourMetrics(protocol)
    })
    const currentTime = moment(Date.now())
    const end = moment(this.nextCheck)
    const nextRefreshInSeconds = Math.abs(moment.duration(currentTime.diff(end)).asSeconds())
    const self = this
    console.log(`Page will refresh in ${nextRefreshInSeconds} seconds`)
    setInterval(() => {
      console.log('Refreshing page')
      self.$router.go()
    }, nextRefreshInSeconds * 1000)
    this.loading = false
  }
}
</script>
