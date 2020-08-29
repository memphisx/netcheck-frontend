<template>
  <q-page>
    <q-table
      :data="data"
      :columns="columns"
      row-key="id"
      :pagination.sync="pagination"
      :loading="loading"
      @request="getDomains"
      :rows-per-page-options="[5,10,15,20,25,50,100]"
      rows-per-page-label="Domains per page"
      grid
    >
      <template v-slot:top>
        <div class="col-2 q-table__title">Monitored Domains</div>
        <q-space />
        <q-toggle v-model="expanded" icon="unfold_more" class="q-mb-md" />
      </template>
      <template v-slot:item="props">
        <DomainCard
          :data="props"
          :key="props.row.domain"
          :expanded="expanded"
        />
      </template>
    </q-table>
  </q-page>
</template>
<script>
import moment from 'moment'
import DomainCard from 'components/DomainCard'
export default {
  components: {
    DomainCard
  },
  data () {
    return {
      filter: '',
      loading: false,
      expanded: true,
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
        { name: 'frequency', label: 'Check Frequency (minutes)', field: 'frequency', sortable: false }
      ],
      data: []
    }
  },
  async mounted () {
    // get initial data from server (1st page)
    await this.getDomains({
      pagination: this.pagination,
      rowsPerPage: 3
    })
  },
  methods: {
    async getDomains (props) {
      const { page, rowsPerPage } = props.pagination
      const size = rowsPerPage
      const dbPage = page - 1

      this.loading = true

      const resp = await this.$backend.domains({ page: dbPage, size })
      if (resp.success) {
        if (resp.data._embedded && resp.data._embedded.domains && resp.data._embedded.domains.length) {
          this.pagination = {
            page: resp.data.page.number + 1,
            rowsPerPage: resp.data.page.size,
            rowsNumber: resp.data.page.totalElements
          }
          const domains = []
          resp.data._embedded.domains.forEach(domain => {
            domains.push({
              domain: domain.domain,
              frequency: domain.checkFrequencyMinutes,
              dateAdded: moment(domain.dateAdded).format('LLLL')
            })
          })
          this.data = domains
        }
      }
      this.loading = false
    }
  }
}
</script>
<style lang="sass">
  .q-table__grid-content
    justify-content: center
</style>
