<template>
  <q-page>
    <q-table
      :data="data"
      :columns="columns"
      :filter="filter"
      row-key="id"
      :pagination.sync="pagination"
      :loading="loading"
      @request="getDomains"
      :rows-per-page-options="[5,10,15,20,25,50,100]"
      grid
      hide-header
    >
      <template v-slot:top>
        <div class="col-3 q-table__title">Monitored Domains</div>
        <q-space />
        <q-input rounded outlined dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-space />
        <q-select
          v-model="pagination.sortBy"
          :options="sortByOptions"
          label="Sort By"
          stack-label
          dense
          rounded
          outlined
          options-dense
          map-options
          emit-value
          @input="refreshData"
        />
        <q-space />
        <q-select
          v-model="pagination.descending"
          :options="descOptions"
          label="Direction"
          stack-label
          dense
          rounded
          outlined
          options-dense
          map-options
          emit-value
          @input="refreshData"
        />
        <q-space />
        <q-toggle borderless dense v-model="expanded" icon="unfold_more" />
      </template>
      <template v-slot:header-cell="props">
        <q-th :props="props" v-if="props.col.name !== 'frequency'">
          {{ props.col.label }}
        </q-th>
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
        sortBy: 'createdAt',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      sortByOptions: [
        {
          label: 'Date Added',
          value: 'createdAt'
        },
        {
          label: 'Domain',
          value: 'domain'
        }
      ],
      descOptions: [
        {
          label: 'Descending',
          value: true
        },
        {
          label: 'Ascending',
          value: false
        }
      ],
      columns: [
        { name: 'domain', align: 'left', label: 'Domain', field: 'domain', sortable: true },
        { name: 'createdAt', label: 'Date Added', field: 'createdAt', sortable: true },
        { name: 'frequency', label: 'Check Frequency (minutes)', field: 'frequency', sortable: false }
      ],
      data: []
    }
  },
  async mounted () {
    await this.refreshData()
  },
  methods: {
    async refreshData () {
      await this.getDomains({
        pagination: this.pagination,
        filter: this.filter
      })
    },
    async getDomains (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      const filter = props.filter
      const size = rowsPerPage
      const dbPage = page - 1

      this.loading = true

      const resp = await this.$backend.domains({ page: dbPage, size, filter, sortBy, descending })
      if (resp.success) {
        if (resp.data._embedded && resp.data._embedded.domains && resp.data._embedded.domains.length) {
          const domains = []
          resp.data._embedded.domains.forEach(domain => {
            domains.push({
              domain: domain.domain,
              frequency: domain.checkFrequencyMinutes,
              createdAt: moment(domain.dateAdded).format('LLLL')
            })
          })
          this.pagination = {
            page: resp.data.page.number + 1,
            rowsPerPage: resp.data.page.size,
            rowsNumber: resp.data.page.totalElements,
            descending,
            sortBy
          }
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
