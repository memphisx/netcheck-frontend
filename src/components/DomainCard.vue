<template>
  <div class="q-pa-sm">
    <q-expansion-item
      class="shadow-1 overflow-hidden round-corners"
      v-model="expanded"
      :default-opened="true"
      :icon="icon"
      :header-class="headerClass"
      expand-icon-class="text-white"
      :label="row.domain"
      dense
    >
      <q-card>
        <!-- Domain Configuration -->
        <div>
          <PerformanceMiniCard
            :domain="row.domain"
          />
          <q-separator />
          <q-expansion-item
            class="overflow-hidden"
            default-closed
            :icon="check.data.protocol === 'HTTPS' ? 'https' : 'http'"
            :label="`Last ${check.data.protocol} check`"
            v-for="check in lastChecks" :key="check.hostname"
            dense
          >
            <template v-slot:header>
              <q-item-section avatar>
                <q-avatar :icon="check.data.protocol === 'HTTPS' ? 'https' : 'http'"/>
              </q-item-section>
              <q-item-section>
                Last {{ check.data.protocol }} check
              </q-item-section>
              <q-item-section side>
                <div class="row items-center">
                  <q-icon :name="check.data.up === 'UP' ? 'check_circle' : 'cancel' " :color="check.data.up === 'UP' ? 'green' : 'red'" style="font-size: 1.5em;"/>
                </div>
              </q-item-section>
            </template>
            <q-card>
              <q-card-section>
                <q-list separator>
                  <q-item v-for="(value, key) in check.data" :key="`${key}-${value}`">
                    <q-item-section>
                      <q-item-label overline>{{ httpLabels[key] }}</q-item-label>
                      <q-item-label>{{ value }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-expansion-item>
          <q-expansion-item
            class="overflow-hidden"
            default-closed
            icon="security"
            label="Certificate check"
            v-if="certificate !== null"
            dense
          >
            <template v-slot:header>
              <q-item-section avatar>
                <q-avatar icon="security" />
              </q-item-section>
              <q-item-section>
                Certificate check
              </q-item-section>
              <q-item-section side>
                <div class="row items-center">
                  <q-icon :name="certificate.valid === true ? 'check_circle' : 'cancel' " :color="certificate.valid === true ? 'green' : 'red'" style="font-size: 1.5em;"/>
                </div>
              </q-item-section>
            </template>
            <q-card>
              <q-card-section>
                <q-list separator>
                  <q-item v-for="entry in certificate.data" :key="entry.value">
                    <q-item-section v-if="entry.value">
                      <q-item-label overline>{{ entry.title}}</q-item-label>
                      <q-item-label>{{ entry.value }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-expansion-item>
          <q-expansion-item
            class="overflow-hidden"
            default-closed
            icon="settings"
            label="Domain configuration"
            dense
          >
            <template v-slot:header>
              <q-item-section avatar>
                <q-avatar icon="settings" />
              </q-item-section>
              <q-item-section>
                Domain configuration
              </q-item-section>
            </template>
            <q-card>
              <q-card-section>
                <q-list separator>
                  <q-item v-for="col in cols.filter(col => col.name !== 'desc')" :key="col.name">
                    <q-item-section>
                      <q-item-label overline>{{ col.label }}</q-item-label>
                      <q-item-label>{{ col.value }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>
        <q-card-actions>
          <q-btn flat color="primary" class="round-corners" label="Go To Monitoring Page" v-on:click.native="gotoMonitoring" dense/>
        </q-card-actions>
      </q-card>
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-expansion-item>
  </div>
</template>
<script type="text/javascript">
import moment from 'moment'
import PerformanceMiniCard from 'components/PerformanceMiniCard'
export default {
  components: {
    PerformanceMiniCard
  },
  props: ['data', 'expanded'],
  data () {
    return {
      row: {},
      loading: false,
      selected: false,
      cols: [],
      lastChecks: [],
      certificate: null,
      icon: '',
      headerClass: '',
      httpLabels: {
        checkedOn: 'Last Check',
        dnsResolves: 'DNS Status',
        hostname: 'Hostname',
        ipAddress: 'IP Address',
        protocol: 'Protocol',
        redirectUri: 'Redirects to',
        responseTimeNs: 'Response Time',
        statusCode: 'Status Code',
        up: 'Status'
      }
    }
  },
  methods: {
    toFriendlyDate (dateTime) {
      return moment(dateTime).format('LLL')
    },
    async getDomainConfigAndLastChecks () {
      const resp = await this.$backend.domainStatus({ domain: this.row.domain })
      const checks = []
      const statuses = []
      resp.data.lastChecks.httpChecks.forEach(httpCheck => {
        statuses.push(httpCheck.up)
        delete httpCheck._links
        checks.push({
          data: {
            ...httpCheck,
            checkedOn: moment(httpCheck.checkedOn).format('LLLL'),
            up: httpCheck.up ? 'UP' : 'DOWN',
            responseTimeNs: httpCheck.responseTimeNs ? `${(httpCheck.responseTimeNs / 1000000000).toFixed(3)} seconds` : undefined,
            dnsResolves: httpCheck.dnsResolves ? 'UP' : 'DOWN'
          },
          iconName: httpCheck.up ? 'check_circle' : 'cancel',
          iconClass: httpCheck.up ? 'text-green' : 'text-red'
        })
      })
      const healthyDomain = statuses.every((currentValue) => currentValue === true)
      this.icon = healthyDomain ? 'check' : 'clear'
      this.headerClass = healthyDomain ? 'bg-green-7 text-white' : 'bg-red-7 text-white'
      this.lastChecks = checks
      if (resp.data.lastChecks.issuerCertificate) {
        this.certificate = {
          valid: resp.data.lastChecks.issuerCertificate.valid,
          data: [{
            title: 'Valid from',
            value: moment(resp.data.lastChecks.issuerCertificate.notBefore).format('LLLL')
          }, {
            title: 'Expires on',
            value: moment(resp.data.lastChecks.issuerCertificate.notAfter).format('LLLL')
          }, {
            title: 'Issued for',
            value: Object.keys(resp.data.lastChecks.issuerCertificate.issuedFor).map((k) => `${k}: ${resp.data.lastChecks.issuerCertificate.issuedFor[k]}`).join(', ')
          }, {
            title: 'Issuer',
            value: Object.keys(resp.data.lastChecks.issuerCertificate.issuedBy).map((k) => `${k}: ${resp.data.lastChecks.issuerCertificate.issuedBy[k]}`).join(', ')
          }]
        }
      }
    },
    gotoMonitoring () {
      this.$router.push(`/domains/${this.row.domain}`)
    }
  },
  async created () {
    this.loading = true
    this.row = this.data.row
    this.selected = this.data.selected
    this.cols = this.data.cols
    await this.getDomainConfigAndLastChecks()
    this.loading = false
  }
}
</script>
<style lang="sass" scoped>
.round-corners
  width: 100%
  max-width: 350px
  border-radius: 30px
</style>
