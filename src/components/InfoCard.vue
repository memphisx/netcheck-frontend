<template>
  <div class="q-pa-md row items-start q-gutter-md">
    <q-card class="round-top-corners" flat bordered>
      <q-item :class="properties.titleColor">
        <q-item-section avatar>
          <q-avatar :icon="properties.iconName" :color="properties.titleColor" text-color="white" />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ properties.label }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row items-center">
            <q-icon :name="properties.rightIcon" :color="properties.titleColor" size="24px" />
          </div>
        </q-item-section>
      </q-item>

      <q-card-section>
        <div class="text-overline text-orange-9">{{ overline }}</div>
        <div class="text-h5 q-mt-sm q-mb-xs">{{ properties.title }}</div>
        <div class="text-caption text-grey">
          {{ properties.info }}
        </div>
      </q-card-section>

      <q-card-actions>
        <q-btn v-if="properties.buttonType==='schedule'" flat color="primary" class="round-corners" label="Schedule" v-on:click.native="scheduleDomain" v-bind:class="{disabled: scheduledSuccessfully}"
               v-bind:disabled="scheduledSuccessfully" />
        <q-btn v-if="properties.buttonType==='gotoMonitoring'" flat color="primary" class="round-corners" label="Go To Monitoring Page" v-on:click.native="gotoMonitoring" />
      </q-card-actions>
      <!-- Domain Configuration -->
      <div v-if="domainConfig">
        <q-separator />
        <q-expansion-item
        default-closed
        expand-separator
        icon="settings"
        label="Domain configuration"
      >
        <q-card>
          <q-card-section>
            <q-list separator>
              <q-item>
                <q-item-section>
                  <q-item-label overline>Domain</q-item-label>
                  <q-item-label>{{ domainConfig.domain}}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label overline>Date added</q-item-label>
                  <q-item-label>{{ toFriendlyDate(domainConfig.dateAdded) }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label overline>Check frequency</q-item-label>
                  <q-item-label>Every {{ domainConfig.checkFrequency }} minutes</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      </div>
    </q-card>
  </div>
</template>
<script type="text/javascript">
import axios from 'axios'
import moment from 'moment'
export default {
  props: ['overline', 'monitored'],
  methods: {
    toFriendlyDate (dateTime) {
      return moment(dateTime).format('LLL')
    },
    scheduleDomain () {
      return axios
        .put(`/api/v1/domains/${this.$route.params.domain}`)
        .then(() => {
          this.scheduledSuccessfully = true
        })
        .catch(err => {
          console.error(err)
        })
    },
    getDomainConfigAndLastChecks () {
      return axios
        .get(`/api/v1/domains/${this.$route.params.domain}`)
        .then(resp => {
          this.scheduledSuccessfully = true
          this.domainConfig = {
            domain: resp.data.domain,
            dateAdded: resp.data.dateAdded,
            checkFrequency: resp.data.checkFrequencyMinutes
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    gotoMonitoring () {
      this.$router.push(`/domains/${this.$route.params.domain}`)
    }
  },
  data () {
    return {
      expanded: false,
      scheduledSuccessfully: false,
      previousHttpChecks: [],
      lastCertificates: {},
      domainConfig: null,
      properties: {
        iconName: 'equalizer',
        label: 'Scheduled checks',
        titleColor: 'bg-negative text-white',
        status: false,
        rightIcon: 'close',
        info: 'This is not an actively monitored domain. Click on the link bellow if you want to schedule this domain for periodic checks and performance analytics.',
        title: 'Domain is not monitored',
        buttonType: 'schedule'
      }
    }
  },
  mounted () {
    if (this.monitored === true) {
      this.properties = {
        ...this.properties,
        titleColor: 'bg-green-7 text-white',
        status: true,
        rightIcon: 'check',
        info: 'This is an actively monitored domain. Click on the link bellow to get more info about previous checks, uptime, performance and other metrics.',
        title: 'Domain is actively monitored',
        buttonType: 'gotoMonitoring'
      }
      this.getDomainConfigAndLastChecks()
    }
  }
}
</script>
<style lang="sass" scoped>
  .round-corners
    width: 100%
    max-width: 350px
    border-radius: 30px
  .round-top-corners
    width: 100%
    max-width: 350px
    border-top-left-radius: 30px
    border-top-right-radius: 30px
</style>
