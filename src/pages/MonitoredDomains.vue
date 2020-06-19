<template>
  <div class="flex q-pa-md">
    <q-card class="text-center text-h4">
      <q-card-section class="q-pa-none">
        <q-markup-table>
          <thead>
          <tr>
            <th class="text-left">Domain</th>
            <th class="text-left">Last known status</th>
          </tr>
          </thead>
          <tbody>
            <tr v-for="domain in domains" :key="domain.domain" @click="$router.push('/domains/'+ domain.domain)">
              <td class="text-left">{{domain.domain}}</td>
              <td class="text-left">{{domain.lastStatus}}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>
  </div>
</template>
<script>
export default {
  name: 'WebCheck',
  data () {
    return {
      domains: []
    }
  },
  methods: {
    getDomains () {
      const http = require('axios')

      return http
        .get(`${process.env.BACKEND_URL}/domains/`)
        .then(resp => {
          if (resp.data._embedded && resp.data._embedded.domains && resp.data._embedded.domains.length) {
            this.domains = resp.data._embedded.domains
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  },
  created () {
    this.$q.loadingBar.start()
    this.getDomains()
    this.$q.loadingBar.stop()
  }
}
</script>
