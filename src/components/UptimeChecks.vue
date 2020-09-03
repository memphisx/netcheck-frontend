<template>
  <div class="flex flex-center">
    <div class="self-start">
      <apexChart type="radialBar" :options="chart.options" :series="chart.series" :key="JSON.stringify(pagination)"></apexChart>
    </div>
    <div>
      <q-table
        :data="data"
        :columns="columns"
        row-key="id"
        :pagination.sync="pagination"
        :loading="loading"
        @request="fetchUptimeChecks"
        :rows-per-page-options="rowsPerPageOptions"
        rows-per-page-label="Metrics per page"
      />
    </div>
  </div>
</template>
<script type="text/javascript">
import moment from 'moment'
import VueApexCharts from 'vue-apexcharts'
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
        rowsPerPage: 10,
        rowsNumber: 0
      },
      columns: [
        { name: 'date', label: 'Date', field: 'date', sortable: false, format: val => this.formatDate(val) },
        { name: 'checks', label: 'Checks', field: 'checks', sortable: false },
        { name: 'uptime', label: 'Uptime', field: 'uptime', sortable: false, format: val => `${val}%` }
      ],
      data: [],
      chart: {
        options: {
          series: [],
          colors: ['#20E647'],
          plotOptions: {
            radialBar: {
              hollow: {
                margin: 0,
                size: '70%',
                background: '#293450'
              },
              track: {
                dropShadow: {
                  enabled: true,
                  top: 2,
                  left: 0,
                  blur: 4,
                  opacity: 0.15
                }
              },
              dataLabels: {
                name: {
                  offsetY: -10,
                  color: '#fff',
                  fontSize: '13px'
                },
                value: {
                  color: '#fff',
                  fontSize: '30px',
                  show: true
                }
              }
            }
          },
          fill: {
            type: 'gradient',
            gradient: {
              shade: 'dark',
              type: 'vertical',
              gradientToColors: ['#87D4F9'],
              stops: [0, 100]
            }
          },
          stroke: {
            lineCap: 'round'
          },
          labels: ['Uptime']
        },
        series: []
      }
    }
  },
  methods: {
    async fetchUptimeChecks (props) {
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
      if (resp.success && resp.data._embedded && resp.data._embedded.metrics) {
        this.pagination = {
          page: resp.data.page.number + 1,
          rowsPerPage: resp.data.page.size,
          rowsNumber: resp.data.page.totalElements
        }
        const result = []
        let totalChecks = 0
        let totalSuccessfulChecks = 0
        resp.data._embedded.metrics.forEach(metric => {
          result.push({
            date: metric.metricPeriodStart,
            checks: metric.totalChecks,
            uptime: ((metric.successfulChecks * 100) / metric.totalChecks).toFixed(2)
          })
          totalChecks += metric.totalChecks
          totalSuccessfulChecks += metric.successfulChecks
        })
        this.data = result
        this.chart.series = [((totalSuccessfulChecks * 100) / totalChecks).toFixed(2)]
      }
      this.loading = false
    },
    formatDate (date) {
      switch (this.period) {
        case 'HOUR':
          return moment(date).format('DD MMM hh:mm')
        case 'DAY':
          return moment(date).format('MMM DD')
        case 'WEEK':
          return moment(date).format('YYYY WW')
        case 'MONTH':
          return moment(date).format('YYYY MMM')
        default:
          return moment(date).format('LLL')
      }
    }
  },
  async mounted () {
    await this.fetchUptimeChecks({
      pagination: this.pagination,
      rowsPerPage: 3
    })
  }
}
</script>
