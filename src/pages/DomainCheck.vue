<template>
  <div>
    <!-- Domain Check information -->
    <div class="flex flex-center">
      <div class="q-pa-md" v-for="check in domainDetails.httpChecks" :key="check.protocol">
          <ProtocolCheck
            :check="check"
            :issuerCertificate="domainDetails.issuerCertificate"
            icon-name="http"
            :total="1000"
          />
      </div>
      <div v-if="domainDetails.monitored">
        <InfoCard
          titleColor="bg-green-7 text-white"
          status="true"
          iconName="equalizer"
          rightIcon="check"
          :monitored="domainDetails.monitored"
          info="This is an actively monitored domain. Click on the link bellow to get more info about previous checks, uptime, performance and other metrics."
          label="Scheduled checks"
          title="Domain is actively monitored"
          buttonType="gotoMonitoring"
          :overline="$route.params.domain"
        />
      </div>
      <div v-if="domainDetails.monitored === false">
        <InfoCard
          titleColor="bg-negative text-white"
          status="false"
          iconName="equalizer"
          rightIcon="close"
          :monitored="domainDetails.monitored"
          info="This is not an actively monitored domain. Click on the link bellow if you want to schedule this domain for periodic checks and performance analytics."
          label="Scheduled checks"
          title="Domain is not monitored"
          buttonType="schedule"
          :overline="$route.params.domain"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ProtocolCheck from 'components/ProtocolCheck'
import InfoCard from 'components/InfoCard'
export default {
  name: 'DomainStatus',
  data () {
    return {
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
    InfoCard,
    ProtocolCheck
  },
  methods: {
    async fetchDomainStatus () {
      const resp = await this.$backend.check({ domain: this.$route.params.domain })
      if (resp.success) {
        this.domainDetails = resp.data
      }
    }
  },
  async mounted () {
    this.$q.loadingBar.start()
    await this.fetchDomainStatus()
    this.$q.loadingBar.stop()
  }
}
</script>
