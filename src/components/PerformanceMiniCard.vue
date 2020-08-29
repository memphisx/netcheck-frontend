<template>
  <div>
    <apexChart height="75" type="area" :options="chart.options" :series="chart.series" :key="JSON.stringify(chart.series)"></apexChart>
  </div>
</template>
<script type="text/javascript">
import VueApexCharts from 'vue-apexcharts'
import moment from 'moment'
export default {
  props: ['domain'],
  components: {
    apexChart: VueApexCharts
  },
  data () {
    return {
      filter: '',
      period: 'HOUR',
      loading: false,
      protocol: 'HTTPS',
      columns: [],
      chart: {
        options: {
          legend: {
            show: false
          },
          dataLabels: {
            enabled: false
          },
          tooltip: {
            theme: 'dark'
          },
          chart: {
            id: 'vuechart-metrics-http',
            zoom: {
              enabled: false
            },
            toolbar: {
              show: false
            },
            sparkline: {
              enabled: true
            }
          },
          xaxis: {
            categories: [],
            labels: {
              show: false
            }
          },
          yaxis: {
            labels: {
              show: false
            }
          },
          stroke: {
            curve: 'smooth',
            width: 2
          }
        },
        series: [
          {
            name: 'Worst Response time (ms)',
            data: []
          },
          {
            name: 'Average Response time (ms)',
            data: []
          },
          {
            name: 'Best Response time (ms)',
            data: []
          }
        ]
      }
    }
  },
  methods: {
    async fetchDomainHistory () {
      const size = 10
      const dbPage = 0

      this.loading = true
      const resp = await this.$backend.domainMetrics({
        domain: this.domain,
        protocol: this.protocol,
        period: this.period,
        size,
        page: dbPage
      })
      if (resp.success) {
        if (resp.data._embedded && resp.data._embedded.metrics) {
          const httpChartData = this.generateChartData(resp.data._embedded.metrics)
          this.chart.options.xaxis.categories = httpChartData.categories
          this.chart.series[0].data = httpChartData.worstSeriesData
          this.chart.series[1].data = httpChartData.averageSeriesData
          this.chart.series[2].data = httpChartData.bestSeriesData
        }
        this.loading = false
      }
    },
    generateChartData (metrics) {
      metrics.reverse()
      const categories = []
      const averageSeriesData = []
      const worstSeriesData = []
      const bestSeriesData = []
      metrics.forEach(metric => {
        categories.push(moment(metric.metricPeriodStart).format('HH:mm'))
        averageSeriesData.push(Math.round(metric.averageResponseTime / 1000000))
        worstSeriesData.push(Math.round(metric.maxResponseTime / 1000000))
        bestSeriesData.push(Math.round(metric.minResponseTime / 1000000))
      })
      return {
        categories,
        averageSeriesData,
        worstSeriesData,
        bestSeriesData
      }
    }
  },
  async mounted () {
    await this.fetchDomainHistory()
  }
}
</script>
