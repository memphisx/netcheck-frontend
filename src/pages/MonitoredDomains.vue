<template>
  <div class="q-pa-md">
    <q-table
      title="Monitored Domains"
      :data="data"
      :columns="columns"
      row-key="id"
      :pagination.sync="pagination"
      :loading="loading"
      @request="getDomains"
    >
      <template v-slot:body-cell-domain="cellProperties">
        <q-td :props="cellProperties" >
          <span @click="$router.push('/domains/'+ cellProperties.value)">{{ cellProperties.value }}</span>
        </q-td>
      </template>
      <template v-slot:body-cell-lastHttpStatus="cellProperties">
        <q-td :props="cellProperties" >
          <q-icon v-if="cellProperties.value" class="text-green" name="check_circle" />
          <q-icon v-else class="text-red" name="cancel"/>
        </q-td>
      </template>
      <template v-slot:body-cell-lastHttpsStatus="cellProperties">
        <q-td :props="cellProperties" >
          <q-icon v-if="cellProperties.value" class="text-green" name="check_circle" />
          <q-icon v-else class="text-red" name="cancel"/>
        </q-td>
      </template>
    </q-table>
  </div>
</template>
<script>
const http = require('axios')
const moment = require('moment')
export default {
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
        { name: 'domain', align: 'left', label: 'Domain', field: 'domain', sortable: false },
        { name: 'dateAdded', label: 'Date Added', field: 'dateAdded', sortable: false },
        { name: 'lastHttpStatus', label: 'Last Http Status', field: 'lastHttpStatus', sortable: false, align: 'center', style: 'font-size: 1.5em' },
        { name: 'lastHttpsStatus', label: 'Last Https Status', field: 'lastHttpsStatus', sortable: false, align: 'center', style: 'font-size: 1.5em' },
        { name: 'lastHttpCheck', label: 'Last Http Check', field: 'lastHttpCheck', sortable: false },
        { name: 'lastHttpsCheck', label: 'Last Https Check', field: 'lastHttpsCheck', sortable: false }
      ],
      data: []
    }
  },
  mounted () {
    // get initial data from server (1st page)
    this.getDomains({
      pagination: this.pagination,
      rowsPerPage: 3
    })
  },
  methods: {
    getDomains (props) {
      const { page, rowsPerPage } = props.pagination
      const size = rowsPerPage
      const dbPage = page - 1

      this.loading = true

      return http.get(`${process.env.BACKEND_URL}/domains?page=${dbPage}&size=${size}`)
        .then(resp => {
          if (resp.data._embedded && resp.data._embedded.domains && resp.data._embedded.domains.length) {
            this.pagination = {
              page: resp.data.page.number + 1,
              rowsPerPage: resp.data.page.size,
              rowsNumber: resp.data.page.totalElements
            }
            const domains = []
            resp.data._embedded.domains.forEach(domain => {
              const lastChecks = {}
              domain.lastDomainCheckModel.httpChecks.forEach(httpCheck => {
                if (httpCheck.protocol === 'HTTPS') {
                  lastChecks.lastHttpsStatus = httpCheck.up
                  lastChecks.lastHttpsCheck = moment(httpCheck.checkedOn).format('LLLL')
                } else {
                  lastChecks.lastHttpStatus = httpCheck.up
                  lastChecks.lastHttpCheck = moment(httpCheck.checkedOn).format('LLLL')
                }
              })
              domains.push({
                domain: domain.domain,
                dateAdded: moment(domain.dateAdded).format('LLLL'),
                ...lastChecks
              })
            })
            this.data = domains

            this.loading = false
          }
        })
        .catch(err => {
          console.error(err)
          this.loading = false
        })
    }
  }
}
</script>
