<template>
  <div class="q-pa-md">
    <q-table
      :data="data"
      :columns="columns"
      row-key="id"
      :pagination.sync="pagination"
      :loading="loading"
      @request="getServers"
      :rows-per-page-options="[5,10,15,20,25,50,100]"
      rows-per-page-label="Servers per page"
    >
      <template v-slot:body="props">
        <q-tr :props="props" class="clickable" @click="$router.push('/servers/'+ props.row.id)">
          <q-td key="serverName" :props="props">
            {{ props.row.serverName }}
          </q-td>
          <q-td key="initialized" :props="props">
            <q-icon :name="props.row.initialized ? 'check_circle' : 'cancel' " :color="props.row.initialized ? 'green' : 'red'" style="font-size: 1.5em;"/>
          </q-td>
          <q-td key="description" :props="props">
            {{ props.row.description }}
          </q-td>
          <q-td key="createdAt" :props="props">
            {{ props.row.createdAt }}
          </q-td>
        </q-tr>
      </template>
      <template v-slot:body-cell-serverName="cellProperties">
        <q-td :props="cellProperties" class="clickable">
          <span @click="$router.push('/servers/'+ cellProperties.value)">{{ cellProperties.value }}</span>
        </q-td>
      </template>
    </q-table>
  </div>
</template>
<script>
import moment from 'moment'
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
        { name: 'serverName', align: 'left', label: 'Server Name', field: 'serverName', sortable: false },
        { name: 'initialized', align: 'center', label: 'Initialized', field: 'initialized', sortable: false },
        { name: 'description', label: 'Description', field: 'description', sortable: false },
        { name: 'createdAt', label: 'Date Added', field: 'createdAt', sortable: false }
      ],
      data: []
    }
  },
  async mounted () {
    await this.getServers({
      pagination: this.pagination,
      rowsPerPage: 3
    })
  },
  methods: {
    async getServers (props) {
      const { page, rowsPerPage } = props.pagination
      const size = rowsPerPage
      const dbPage = page - 1

      this.loading = true

      const resp = await this.$backend.servers({ page: dbPage, size })
      if (resp.success) {
        if (resp.data._embedded && resp.data._embedded.servers && resp.data._embedded.servers.length) {
          this.pagination = {
            page: resp.data.page.number + 1,
            rowsPerPage: resp.data.page.size,
            rowsNumber: resp.data.page.totalElements
          }
          const servers = []
          resp.data._embedded.servers.forEach(server => {
            servers.push({
              id: server.serverId,
              serverName: server.serverName,
              description: server.description,
              initialized: server.metricDefinitions && server.metricDefinitions.length && server.metricDefinitions.length > 0,
              createdAt: moment(server.createdAt).format('LLLL')
            })
          })
          this.data = servers
        }
      }
      this.loading = false
    }
  }
}
</script>
