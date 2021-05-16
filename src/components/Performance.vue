<template>
  <div>
    <apexChart height="400" type="area" :options="chart.options" :series="chart.series" :key="JSON.stringify(pagination)"></apexChart>
    <q-table
      :data="data"
      :columns="columns"
      row-key="id"
      :pagination.sync="pagination"
      :loading="loading"
      hide-header
      @request="fetchDomainHistory"
      :rows-per-page-options="rowsPerPageOptions"
      rows-per-page-label="Metrics per page"
    />
  </div>
</template>
<script type="text/javascript">
import VueApexCharts from 'vue-apexcharts'
import moment from 'moment'
export default {
  props: ['domain', 'protocol'],
  components: {
    apexChart: VueApexCharts
  },
  data () {
    return {
      filter: '',
      period: 'HOUR',
      loading: false,
      rowsPerPageOptions: [24, 48, 72, 96, 120, 144, 168],
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 24,
        rowsNumber: 0,
        totalPages: 0
      },
      columns: [],
      data: [],
      chart: {
        options: {
          theme: {
            mode: this.$q.dark.isActive ? 'dark' : 'light'
          },
          chart: {
            id: 'vuechart-metrics-http',
            background: this.$q.dark.isActive ? '#1D1D1D' : undefined
          },
          xaxis: {
            categories: []
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
    async fetchDomainHistory (props) {
      const { page, rowsPerPage } = props.pagination
      const size = rowsPerPage
      const dbPage = page - 1

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
          this.pagination = {
            page: resp.data.page.number + 1,
            rowsPerPage: resp.data.page.size,
            rowsNumber: resp.data.page.totalElements,
            totalPages: resp.data.page.totalPages
          }
          const httpChartData = this.generateChartData(resp.data._embedded.metrics)
          this.chart.options.xaxis.categories = httpChartData.categories
          this.chart.series[0].data = httpChartData.worstSeriesData
          this.chart.series[1].data = httpChartData.averageSeriesData
          this.chart.series[2].data = httpChartData.bestSeriesData

          this.data = resp.data._embedded.metrics
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
    await this.fetchDomainHistory({
      pagination: this.pagination,
      rowsPerPage: 3
    })
  }
}
</script>
