<template>
  <div>
    <apexchart height="300" type="bar" :options="chart.options" :series="chart.series" :key="JSON.stringify(pagination)"></apexchart>
    <q-table
      :data="data"
      :columns="columns"
      row-key="id"
      :pagination.sync="pagination"
      :loading="loading"
      @request="fetchDomainHistory"
      :rows-per-page-options="[5,10,15,20,25,50,100]"
      rows-per-page-label="Checks per page"
    >
      <template v-slot:body-cell-up="cellProperties">
        <q-td :props="cellProperties" >
          <q-icon v-if="cellProperties.value" class="text-green" name="check_circle" />
          <q-icon v-else class="text-red" name="cancel"/>
        </q-td>
      </template>
      <template v-slot:body-cell-dnsResolves="cellProperties">
        <q-td :props="cellProperties" >
          <q-icon v-if="cellProperties.value" class="text-green" name="check_circle" />
          <q-icon v-else class="text-red" name="cancel"/>
        </q-td>
      </template>
    </q-table>
  </div>
</template>
<script type="text/javascript">
import VueApexCharts from 'vue-apexcharts'
import moment from 'moment'
export default {
  props: ['domain', 'protocol'],
  components: {
    apexchart: VueApexCharts
  },
  data () {
    return {
      filter: '',
      loading: false,
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      columns: [
        { name: 'up', label: 'Status', field: 'up', sortable: false, align: 'left', style: 'font-size: 1.5em' },
        { name: 'checkedOn', label: 'Check date and Time', field: 'checkedOn', sortable: false, format: val => moment(val).format('LLL') },
        { name: 'statusCode', label: 'Status Code', field: 'statusCode', sortable: false, align: 'center' },
        { name: 'dnsResolves', label: 'Dns resolved', field: 'dnsResolves', sortable: false, align: 'center', style: 'font-size: 1.5em' },
        { name: 'ipAddress', label: 'IP Address', field: 'ipAddress', sortable: false },
        { name: 'responseTimeNs', label: 'Response time', field: 'responseTimeNs', sortable: false, format: val => `${val / 1000000}ms` }
      ],
      data: [],
      chart: {
        options: {
          tooltip: {
            theme: this.$q.dark.isActive ? 'dark' : 'light'
          },
          chart: {
            id: 'vuechart-http'
          },
          xaxis: {
            categories: []
          }
        },
        series: [{
          name: 'Response time (ms)',
          data: []
        }]
      }
    }
  },
  methods: {
    async fetchDomainHistory (props) {
      const { page, rowsPerPage } = props.pagination
      const size = rowsPerPage
      const dbPage = page - 1

      this.loading = true
      const resp = await this.$backend.domainHistory({ domain: this.domain, page: dbPage, size })
      if (resp.success) {
        if (resp.data._embedded && resp.data._embedded.domainChecks) {
          this.pagination = {
            page: resp.data.page.number + 1,
            rowsPerPage: resp.data.page.size,
            rowsNumber: resp.data.page.totalElements
          }
          const httpChecks = []
          resp.data._embedded.domainChecks.forEach(domainCheck => {
            domainCheck.httpChecks.forEach(httpCheck => {
              if (httpCheck.protocol === this.protocol) {
                httpChecks.push(httpCheck)
              }
            })
          })
          const httpChartData = this.generateChartData(httpChecks)
          this.chart.options.xaxis.categories = httpChartData.categories
          this.chart.series[0].data = httpChartData.seriesData

          this.data = httpChecks
        }
      }
      this.loading = false
    },
    generateChartData (checks) {
      const moment = require('moment')
      const categories = []
      const seriesData = []
      checks.forEach(check => {
        categories.push(moment(check.checkedOn).format('HH:mm'))
        seriesData.push(Math.round(check.responseTimeNs / 1000000))
      })
      categories.reverse()
      seriesData.reverse()
      return {
        categories,
        seriesData
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
