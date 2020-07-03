<template>
  <div>
    <!-- Domain -->
    <div class="text-center text-h4 q-pa-lg">
      {{ $route.params.domain }}
    </div>

    <!-- Domain Check information -->
    <div class="flex flex-center">
      <div class="q-pa-md" v-for="check in domainDetails.data.httpChecks" :key="check.protocol">
        <q-list>
          <ProtocolCheck
            :check="check"
            :issuerCertificate="domainDetails.data.issuerCertificate"
            background-color="bg-teal-9"
            icon-name="http"
            :total="1000"
          >
          </ProtocolCheck>
        </q-list>
      </div>
    </div>

    <!-- History -->
    <div v-if="domainDetails.data.monitored" class="flex flex-center">
      <!-- Uptime Checks -->
      <div class="q-pa-md" v-for="protocol in protocolsToCheck" :key="protocol + '-performance'">
        <q-list bordered class="rounded-borders shadow-12">
          <UptimeChecks
            :protocol="protocol"
            :domain="$route.params.domain"
          ></UptimeChecks>
        </q-list>
      </div>

      <!-- Performance Metrics -->
      <div class="q-pa-md" v-for="protocol in protocolsToCheck" :key="protocol + '-performance'">
        <q-list bordered class="rounded-borders shadow-12">
          <Performance
            :protocol="protocol"
            :domain="$route.params.domain"
          ></Performance>
        </q-list>
      </div>

      <!-- Status Periods -->
      <div class="q-pa-md" v-for="protocol in protocolsToCheck" :key="protocol + '-state'">
        <q-list bordered class="rounded-borders shadow-12">
          <StateHistory
            :protocol="protocol"
            :domain="$route.params.domain"
          ></StateHistory>
        </q-list>
      </div>

      <!-- Latest Tests -->
      <div class="q-pa-md" v-for="protocol in protocolsToCheck" :key="protocol + '-check'">
        <q-list bordered class="rounded-borders shadow-12">
          <LatestTests
            :protocol="protocol"
            :domain="$route.params.domain"
          ></LatestTests>
        </q-list>
      </div>
    </div>

    <!-- Add to Monitored -->
    <div v-if="domainDetails.data.monitored === false" class="flex flex-center q-pa-md">
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
</template>

<script>
import ProtocolCheck from 'components/ProtocolCheck'
import LatestTests from 'components/LatestTests'
import axios from 'axios'
import StateHistory from 'components/StateHistory'
import Performance from 'components/Performance'
import UptimeChecks from 'components/UptimeChecks'
export default {
  name: 'WebCheck',
  data () {
    return {
      protocolsToCheck: [
        'HTTP',
        'HTTPS'
      ],
      scheduledSuccessfully: false,
      domainDetails: {
        monitored: null,
        data: {
          httpChecks: [],
          issuerCertificate: {}
        }
      }
    }
  },
  components: {
    UptimeChecks,
    StateHistory,
    LatestTests,
    ProtocolCheck,
    Performance
  },
  methods: {
    scheduleDomain () {
      return axios
        .put(`${process.env.BACKEND_URL}/domains/${this.$route.params.domain}`)
        .then(resp => {
          this.scheduledSuccessfully = true
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchDomainStatus () {
      return axios
        .get(`${process.env.BACKEND_URL}/domains/${this.$route.params.domain}`)
        .then(resp => {
          this.domainDetails = resp
        })
        .catch(err => {
          console.error(err)
        })
    }
  },
  mounted () {
    this.$q.loadingBar.start()
    this.fetchDomainStatus()
    this.$q.loadingBar.stop()
  }
}
</script>
