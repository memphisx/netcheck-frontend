<template>
  <div>
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
    <div v-if="domainDetails.data.monitored">
      <q-tabs
        v-model="tab"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab name="http" label="HTTP" />
        <q-tab name="https" label="HTTPS" />
      </q-tabs>

      <q-tab-panels v-model="tab">
        <q-tab-panel name="http">
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
                    protocol="HTTP"
                    :domain="$route.params.domain"
                  ></Performance>
                </q-tab-panel>

                <q-tab-panel name="uptimeChecks">
                  <UptimeChecks
                    protocol="HTTP"
                    :domain="$route.params.domain"
                  ></UptimeChecks>
                </q-tab-panel>

                <q-tab-panel name="states">
                  <StateHistory
                    protocol="HTTP"
                    :domain="$route.params.domain"
                  ></StateHistory>
                </q-tab-panel>

                <q-tab-panel name="latestChecks">
                  <LatestTests
                    protocol="HTTP"
                    :domain="$route.params.domain"
                  ></LatestTests>
                </q-tab-panel>
              </q-tab-panels>
            </template>

          </q-splitter>
        </q-tab-panel>

        <q-tab-panel name="https">
          <q-splitter v-model="splitterModel">
            <template v-slot:before>
              <q-tabs v-model="httpsInnerTab" vertical>
                <q-tab name="performance" icon="speed" label="Performance" />
                <q-tab name="uptimeChecks" icon="update" label="Uptime" />
                <q-tab name="states" icon="dns" label="States" />
                <q-tab name="latestChecks" icon="bar_chart" label="Checks" />
              </q-tabs>
            </template>

            <template v-slot:after>
              <q-tab-panels v-model="httpsInnerTab">
                <q-tab-panel name="performance">
                  <Performance
                    protocol="HTTPS"
                    :domain="$route.params.domain"
                  ></Performance>
                </q-tab-panel>

                <q-tab-panel name="uptimeChecks">
                  <UptimeChecks
                    protocol="HTTPS"
                    :domain="$route.params.domain"
                  ></UptimeChecks>
                </q-tab-panel>

                <q-tab-panel name="states">
                  <StateHistory
                    protocol="HTTPS"
                    :domain="$route.params.domain"
                  ></StateHistory>
                </q-tab-panel>

                <q-tab-panel name="latestChecks">
                  <LatestTests
                    protocol="HTTPS"
                    :domain="$route.params.domain"
                  ></LatestTests>
                </q-tab-panel>
              </q-tab-panels>
            </template>

          </q-splitter>
        </q-tab-panel>
      </q-tab-panels>
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
  name: 'DomainStatus',
  data () {
    return {
      tab: 'http',
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
        .put(`/api/domains/${this.$route.params.domain}`)
        .then(resp => {
          this.scheduledSuccessfully = true
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchDomainStatus () {
      return axios
        .get(`/api/domains/${this.$route.params.domain}`)
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
