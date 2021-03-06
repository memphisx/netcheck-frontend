<template>
  <div>
    <q-table
      :data="data"
      :columns="columns"
      row-key="id"
      :pagination.sync="pagination"
      :loading="loading"
      @request="fetchDomainHistory"
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
import moment from 'moment'
export default {
  props: ['domain', 'protocol'],
  data () {
    return {
      filter: '',
      currentStatus: '',
      currentStatusStartDate: Date.now(),
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
        { name: 'checkedOn', label: 'Changed on', field: 'checkedOn', sortable: false, format: val => moment(val).format('LLL') },
        { name: 'reason', label: 'Reason', field: 'reason', sortable: false },
        { name: 'duration', label: 'Duration', field: 'duration', sortable: false }
      ],
      data: []
    }
  },
  methods: {
    async fetchDomainHistory (props) {
      const { page, rowsPerPage } = props.pagination
      const size = rowsPerPage
      const dbPage = page - 1

      this.loading = true
      const resp = await this.$backend.domainStates({
        domain: this.domain,
        protocol: this.protocol,
        size,
        page: dbPage
      })
      if (resp.success && resp.data._embedded && resp.data._embedded.states) {
        this.pagination = {
          page: resp.data.page.number + 1,
          rowsPerPage: resp.data.page.size,
          rowsNumber: resp.data.page.totalElements
        }
        const states = []
        let counter = 0
        resp.data._embedded.states.forEach(state => {
          if (counter === 0 && resp.data.page.number === 0) {
            this.currentStatus = state.up ? 'UP' : 'DOWN'
            this.currentStatusStartDate = state.checkedOn
            states.push({
              ...state,
              duration: moment.duration(state.durationSeconds, 'seconds').humanize() + ' (ONGOING)'
            })
          } else {
            states.push({
              ...state,
              duration: moment.duration(state.durationSeconds, 'seconds').humanize()
            })
          }
          counter++
        })
        this.data = states
      }
      this.loading = false
    },
    generateChartData (checks) {
      const moment = require('moment')
      const categories = []
      const seriesData = []
      checks.forEach(check => {
        categories.push(moment(check.checkedOn).format('hh:mm'))
        seriesData.push(Math.round(check.responseTimeNs / 1000000))
      })
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
