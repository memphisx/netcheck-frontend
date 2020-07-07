<template>
  <div>
    <q-expansion-item
    default-opened
    expand-separator
    icon="bar_chart"
    :label="`${protocol} Performance`"
    header-class="text-black"
  >
    <q-card>
      <q-card-section class="q-pa-none">
        <apexchart width="700" type="line" :options="chart.options" :series="chart.series" :key="JSON.stringify(pagination)"></apexchart>
        <q-table
          :data="data"
          :columns="columns"
          row-key="id"
          :pagination.sync="pagination"
          :loading="loading"
          @request="fetchDomainHistory"
        >
        </q-table>
      </q-card-section>
    </q-card>
  </q-expansion-item>
  </div>
</template>
<script type="text/javascript">
import VueApexCharts from 'vue-apexcharts'
import moment from 'moment'
import axios from 'axios'
export default {
  props: ['domain', 'protocol'],
  components: {
    apexchart: VueApexCharts
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
        rowsPerPage: 100,
        rowsNumber: 0
      },
      columns: [
      ],
      data: [],
      chart: {
        options: {
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
    fetchDomainHistory (props) {
      const { page, rowsPerPage } = props.pagination
      const size = rowsPerPage
      const dbPage = page - 1

      this.loading = true
      return axios
        .get(`/api/domains/${this.domain}/metrics?protocol=${this.protocol}&period=${this.period}&size=${size}&page=${dbPage}`)
        .then(resp => {
          if (resp.data._embedded && resp.data._embedded.metrics) {
            this.pagination = {
              page: resp.data.page.number + 1,
              rowsPerPage: resp.data.page.size,
              rowsNumber: resp.data.page.totalElements
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
  mounted () {
    this.fetchDomainHistory({
      pagination: this.pagination,
      rowsPerPage: 3
    })
  }
}
</script>
