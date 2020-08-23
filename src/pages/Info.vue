<template>
  <q-page>
    <div class="flex flex-center q-py-xl">
      <q-img alt="NetCheck logo" src="~assets/netcheck-logo.png" style="width: 100%; max-width: 700px" />
    </div>
    <div class="flex flex-center">
      <p>Website performance and availability monitoring app</p>
    </div>
    <div class="flex flex-center">
      <p>Frontend version: {{appVersion}}</p>
    </div>
    <div class="flex flex-center">
      <p>Developed by <a href="https://github.com/memphisx">Kyriakos Bompotis</a></p>
    </div>
    <div class="flex flex-center">
      <p>Published under the <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">GPLv3</a> license</p>
    </div>
    <div class="flex flex-center">
      <p>Source: <a href="https://github.com/memphisx/netcheck-api">Backend</a> -- <a href="https://github.com/memphisx/netcheck-frontend">Frontend UI</a></p>
    </div>
    <div class="flex flex-center">
      <p><a href="/docs/v1/">OpenAPI docs</a></p>
    </div>
    <div class="flex flex-center">
      <p>Built using <a href="https://spring.io/">Spring</a> and <a href="https://quasar.dev/">Quasar</a> Frameworks</p>
    </div>
    <div class="flex flex-center">
      <div class="q-pa-md">
        <q-expansion-item
        class="shadow-1 overflow-hidden"
        style="border-radius: 30px"
        default-opened
        icon="local_hospital"
        header-class="bg-green-7 text-white"
        expand-icon-class="text-white"
        label="Backend Health"
      >
        <q-card>
          <q-card-section>
            <q-list separator>
              <q-item v-for="item in healthData" v-bind:key="item.title">
                <q-item-section>
                  <q-item-label overline>{{ item.title }}</q-item-label>
                  <q-item-label>{{ item.value }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      </div>
      <div class="q-pa-md">
        <q-expansion-item
          class="shadow-1 overflow-hidden"
          style="border-radius: 30px"
          default-opened
          icon="info"
          header-class="bg-green-7 text-white"
          expand-icon-class="text-white"
          label="Backend Info"
        >
          <q-card>
            <q-card-section>
              <q-list separator>
                <q-item v-for="item in infoData" v-bind:key="item.title">
                  <q-item-section>
                    <q-item-label overline>{{ item.title }}</q-item-label>
                    <q-item-label>{{ item.value }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
      <div class="q-pa-md">
        <q-expansion-item
          class="shadow-1 overflow-hidden"
          style="border-radius: 30px"
          default-opened
          icon="poll"
          header-class="bg-green-7 text-white"
          expand-icon-class="text-white"
          label="Backend Metrics"
        >
          <q-card>
            <q-card-section>
              <q-list separator>
                <q-item v-for="item in metrics" v-bind:key="item.title">
                  <q-item-section>
                    <q-item-label overline>{{ item.title }}</q-item-label>
                    <q-item-label>{{ item.value }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
    </div>
  </q-page>
</template>
<script>
import moment from 'moment'
import netcheck from '../libs/netcheck-client'
import prettyBytes from 'pretty-bytes'
export default {
  name: 'Info',
  data () {
    return {
      appVersion: process.env.VERSION ? `${process.env.VERSION}` : '',
      healthData: [],
      infoData: [],
      metrics: []
    }
  },
  async mounted () {
    await this.getHealthStatus()
    await this.getInfo()
    await this.getCPULoadAverage()
    await this.getHttpServerRequests()
    await this.getActiveDbConnections()
    await this.getUptime()
  },
  methods: {
    async getHealthStatus () {
      const resp = await netcheck().health()
      this.healthData = [{
        title: 'Backend Status',
        value: resp.data.status
      }, {
        title: 'Database Status',
        value: resp.data.components.db.status
      }, {
        title: 'Database Type',
        value: resp.data.components.db.details.database
      }, {
        title: 'DiskSpace Status',
        value: resp.data.components.diskSpace.status
      }, {
        title: 'Total DiskSpace',
        value: prettyBytes(resp.data.components.diskSpace.details.total)
      }, {
        title: 'Free DiskSpace',
        value: prettyBytes(resp.data.components.diskSpace.details.free)
      }, {
        title: 'DiskSpace Threshold',
        value: prettyBytes(resp.data.components.diskSpace.details.threshold)
      }, {
        title: 'Ping',
        value: resp.data.components.ping.status
      }]
    },
    async getInfo () {
      const resp = await netcheck().info()
      this.infoData = [{
        title: 'Backend App Version',
        value: resp.data.build.version
      }, {
        title: 'Backend app name',
        value: resp.data.app.name
      }, {
        title: 'Description',
        value: resp.data.app.description
      }, {
        title: 'Java vendor',
        value: resp.data.java.vendor
      }, {
        title: 'Java version',
        value: resp.data.java.version
      }, {
        title: 'VM Name',
        value: resp.data.java['vm-name']
      }, {
        title: 'VM Version',
        value: resp.data.java['vm-version']
      }, {
        title: 'Java Version Release Date',
        value: moment(resp.data.java['version-date']).format('LL')
      }, {
        title: 'OS Name',
        value: resp.data.os.name
      }, {
        title: 'Backend App Build Time',
        value: moment(resp.data.build.time).format('LLL')
      }]
    },
    async getCPULoadAverage () {
      const resp = await netcheck().metric({ metricType: 'system.load.average.1m' })
      this.metrics.push({
        title: 'Average System Load (1m)',
        description: resp.data.description,
        value: resp.data.measurements[0].value
      })
    },
    async getHttpServerRequests () {
      const resp = await netcheck().metric({ metricType: 'http.server.requests' })
      resp.data.measurements.forEach(measurement => {
        this.metrics.push({
          title: `Backend Requests (${measurement.statistic.toLowerCase().replace('_', ' ')})`,
          value: measurement.value
        })
      })
    },
    async getActiveDbConnections () {
      const resp = await netcheck().metric({ metricType: 'jdbc.connections.active' })
      this.metrics.push({
        title: 'Active DB connections',
        description: resp.data.description,
        value: resp.data.measurements[0].value
      })
    },
    async getUptime () {
      const resp = await netcheck().metric({ metricType: 'process.uptime' })
      this.metrics.push({
        title: 'Uptime',
        description: resp.data.description,
        value: moment.duration(resp.data.measurements[0].value, resp.data.baseUnit).humanize()
      })
    }
  }
}
</script>
