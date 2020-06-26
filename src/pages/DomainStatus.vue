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
      <div class="q-pa-md" v-for="protocol in protocolsToCheck" :key="protocol">
        <q-list bordered class="rounded-borders shadow-12">
          <CheckHistory
            :protocol="protocol"
            :domain="$route.params.domain"
          ></CheckHistory>
        </q-list>
      </div>
    </div>
    <div v-if="domainDetails.data.monitored === 'false'" class="flex flex-center q-pa-md">
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
import CheckHistory from 'components/CheckHistory'
import axios from 'axios'
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
    CheckHistory,
    ProtocolCheck
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
