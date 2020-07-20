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
    />
  </div>
</template>
<script type="text/javascript">
import VueApexCharts from 'vue-apexcharts'
import moment from 'moment'
import axios from 'axios'
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
          tooltip: {
            theme: 'dark'
          },
          chart: {
            id: 'vuechart-metrics-http'
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
      return axios
        .get(`/api/v1/domains/${this.domain}/metrics?protocol=${this.protocol}&period=${this.period}&size=${size}&page=${dbPage}`)
        .then(resp => {
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
            this.loading = false
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    generateChartData (metrics) {
      const categories = []
      const averageSeriesData = []
      const worstSeriesData = []
      const bestSeriesData = []
      metrics.forEach(metric => {
        categories.push(moment(metric.metricPeriodStart).format('hh:mm'))
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
