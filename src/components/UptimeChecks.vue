<template>
  <div class="flex flex-center">
    <div class="q-pa-md">
      <apexChart type="radialBar" :options="chart.options" :series="chart.series" :key="JSON.stringify(pagination)"></apexChart>
    </div>
    <div class="q-pa-md">
      <q-table
        :data="data"
        :columns="columns"
        row-key="id"
        :pagination.sync="pagination"
        :loading="loading"
        @request="fetchDomainHistory"
      />
    </div>
  </div>
</template>
<script type="text/javascript">
import axios from 'axios'
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
            const result = []
            let totalChecks = 0
            let totalSuccessfulChecks = 0
            resp.data._embedded.metrics.forEach(metric => {
              result.push({
                date: metric.metricPeriodStart,
                checks: metric.totalChecks,
                uptime: (metric.successfulChecks * 100) / metric.totalChecks
              })
              totalChecks += metric.totalChecks
              totalSuccessfulChecks += metric.successfulChecks
            })
            this.data = result
            this.chart.series = [(totalSuccessfulChecks * 100) / totalChecks]
            this.loading = false
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    formatDate (date) {
      if (this.period === 'HOUR') {
        return moment(date).format('DD MMM hh:mm')
      } else if (this.period === 'DAY') {
        return moment(date).format('MMM DD')
      } else if (this.period === 'WEEK') {
        return moment(date).format('YYYY WW')
      } else if (this.period === 'MONTH') {
        return moment(date).format('YYYY MMM')
      } else {
        return moment(date).format('LLL')
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