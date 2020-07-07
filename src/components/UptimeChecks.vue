<template>
  <div>
    <q-expansion-item
    default-opened
    expand-separator
    icon="bar_chart"
    :label="`${protocol} Uptime Checks`"
    header-class="text-black"
  >
    <q-card>
      <q-card-section class="q-pa-none">
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
import axios from 'axios'
import moment from 'moment'
export default {
  props: ['domain', 'protocol'],
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
      data: []
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
            resp.data._embedded.metrics.forEach(metric => result.push({
              date: metric.metricPeriodStart,
              checks: metric.totalChecks,
              uptime: (metric.successfulChecks * 100) / metric.totalChecks
            }))
            this.data = result
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
