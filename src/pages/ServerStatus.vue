<template>
  <div>
    <div class="flex flex-center">
      <MetricCard
        v-for="metric in lastReceivedMetrics"
        :metric="metric"
        v-bind:key="`${metric.id}-${metric.fieldName}`"
        />
    </div>
<!--    <div v-for="(value, key) in metrics" class="flex flex-center" v-bind:key="key">-->
<!--      <p>{{ key }} : {{ value }}</p>-->

<!--&lt;!&ndash;      <apexChart height="400" type="area" :options="chart.options" :series="chart.series" :key="JSON.stringify(pagination)"></apexChart>&ndash;&gt;-->
<!--    </div>-->
  </div>
</template>
<script>
import MetricCard from 'components/MetricCard'
export default {
  name: 'ServerStatus',
  components: {
    MetricCard
  },
  data () {
    return {
      lastReceivedMetrics: {
        id: '',
        metrics: {}
      },
      eventListeners: [],
      serverName: '',
      serverDescription: '',
      config: {},
      metrics: {},
      definitions: null,
      loading: false
    }
  },
  methods: {
    async getServerConfig () {
      const resp = await this.$backend.serverConfig({ serverId: this.$route.params.serverId })
      if (resp.success) {
        this.serverDescription = resp.data.description
        this.serverName = resp.data.serverName
        const definitions = {}
        resp.data.metricDefinitions.forEach(definition => {
          definitions[definition.fieldName] = definition
        })
        this.definitions = definitions
      }
    },
    getDefinition (fieldName) {
      return (this.definitions && this.definitions[fieldName]) ? {
        ...this.definitions[fieldName]
      } : {}
    },
    async getServerMetrics () {
      const resp = await this.$backend.serverMetrics({ serverId: this.$route.params.serverId })
      if (resp.success && resp.data._embedded.metrics) {
        const enrichedMetrics = {}
        const lastMetrics = {}
        Object.entries(resp.data._embedded.metrics[0].metrics).forEach(item => {
          enrichedMetrics[item[0]] = []
          lastMetrics[item[0]] = {
            value: item[1],
            ...this.getDefinition(item[0]),
            id: resp.data._embedded.metrics[0].id,
            collectedAt: resp.data._embedded.metrics[0].collectedAt
          }
        })
        resp.data._embedded.metrics.forEach(metric => {
          const enrichedMetric = {
            y: metric.collectedAt
          }
          Object.entries(metric.metrics).forEach(metricItem => {
            enrichedMetrics[metricItem[0]].push({
              ...enrichedMetric,
              x: metricItem[1]
            })
          })
        })
        this.metrics = enrichedMetrics
        this.lastReceivedMetrics = lastMetrics
      }
    }
  },
  async created () {
    this.loading = true
    await this.getServerConfig()
    await this.getServerMetrics()
    this.loading = false
    const consumer = async (messageEvent) => {
      const { collectedAt, id, metrics } = JSON.parse(messageEvent.data)
      const lastMetrics = {}
      Object.entries(metrics).forEach(item => {
        lastMetrics[item[0]] = {
          value: item[1],
          ...this.getDefinition(item[0]),
          id,
          collectedAt
        }
      })
      this.lastReceivedMetrics = lastMetrics
    }
    this.eventListener = this.$backend.events().subscribe({ eventType: `ServerMetrics_${this.$route.params.serverId}`, consumer })
  },
  async beforeDestroy () {
    this.eventListeners.forEach(eventListener => {
      eventListener.unsubscribe()
    })
  }
}
</script>
