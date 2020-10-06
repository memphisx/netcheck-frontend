<template>
  <div class="flex flex-center">
    <div class="q-pa-md">
      <q-expansion-item
        class="shadow-1 overflow-hidden"
        style="border-radius: 30px"
        default-opened
        icon="settings"
        header-class="bg-green-7 text-white"
        expand-icon-class="text-white"
        label="Check Configuration"
      >
        <q-card>
          <q-card-section>
            <q-list separator>
              <q-item v-for="setting in config" v-bind:key="setting.fieldName">
                <q-item-section>
                  <q-item-label caption>{{ setting.label }}</q-item-label>
                  <q-item-label>{{ setting.value }} {{ setting.suffix }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat dense color="primary" icon="edit">
                    <q-tooltip>Edit</q-tooltip>
                    <q-popup-edit
                      v-model="setting.value"
                      @save="updateConfigValue(setting)"
                    >
                      <template v-slot="{ initialValue, value, emitValue, validate, set, cancel }">
                        <q-input
                          autofocus
                          :value="setting.value"
                          :hint="setting.tooltip"
                          :type="setting.fieldType"
                          @input="emitValue"
                        >
                          <template v-slot:after>
                            <q-btn flat dense color="negative" icon="cancel" @click.stop="cancel" />
                            <q-btn flat dense color="positive" icon="check_circle" @click.stop="set" :disable="validate(value) === false || initialValue === value" />
                          </template>
                        </q-input>
                      </template>
                    </q-popup-edit>
                  </q-btn>
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
        icon="web"
        header-class="bg-green-7 text-white"
        expand-icon-class="text-white"
        label="Request Headers"
      >
        <q-card>
          <q-card-section separator v-if="headers.length > 0">
            <q-list separator>
              <q-item v-for="entry in headers" v-bind:key="entry.header">
                <q-item-section>
                  <q-item-label caption>{{ entry.header }}</q-item-label>
                  <q-item-label>{{ entry.value }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat dense color="primary" icon="edit">
                    <q-popup-edit v-model="entry.value" @save="updateHeader(entry.header, entry.value)">
                      <template v-slot="{ initialValue, value, emitValue, validate, set, cancel }">
                        <q-input
                          autofocus
                          dense
                          :value="entry.value"
                          :hint="entry.header"
                          @input="emitValue"
                        >
                          <template v-slot:after>
                            <q-btn flat dense color="negative" icon="cancel" @click.stop="cancel">
                              <q-tooltip>Cancel</q-tooltip>
                            </q-btn>
                            <q-btn flat dense color="positive" icon="check_circle" @click.stop="set" :disable="value === '' || initialValue === value">
                              <q-tooltip>Save</q-tooltip>
                            </q-btn>
                          </template>
                        </q-input>
                      </template>
                    </q-popup-edit>
                    <q-tooltip>Edit {{ entry.header }} header</q-tooltip>
                  </q-btn>
                </q-item-section>
                <q-item-section side style="padding-left: 0;">
                  <q-btn flat dense color="negative" icon="cancel" @click.stop="removeHeader(entry.header)">
                    <q-tooltip>Remove {{ entry.header }} header</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-section v-else align="center">
            No request headers
          </q-card-section>
          <q-card-actions align="center">
            <q-btn flat class="round-corners" label="Add new header" v-on:click.native="addHeaderPopUp = true"/>
          </q-card-actions>
        </q-card>
      </q-expansion-item>
    </div>
    <div class="q-pa-md">
      <q-expansion-item
        v-model="expanded"
        class="shadow-1 overflow-hidden"
        style="border-radius: 30px"
        dense
        header-class="bg-red text-white"
        expanded-icon="delete_forever"
        expand-icon="delete_forever"
        expand-icon-class="text-white"
        label="Remove Domain"
        switch-toggle-side
      >
        <q-card>
          <q-card-section class="round-corners" align="center">
            {{ message }}
          </q-card-section>
          <q-card-actions align="center">
            <q-btn flat color="red" class="round-corners" :disable="removeDisabled" :label="removeButtonLabel" v-on:click.native="removeDomain"/>
            <q-btn flat color="red" class="round-corners" label="Cancel" v-on:click.native="expanded=false" v-if="!removeDisabled"/>
          </q-card-actions>
        </q-card>
      </q-expansion-item>
    </div>
    <q-dialog v-model="addHeaderPopUp" v-if="addHeaderPopUp === true">
      <q-card class="round-corners">
        <q-item class="round-corners bg-primary">
          <q-item-section avatar>
            <q-avatar icon="settings" text-color="white" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Add new header</q-item-label>
          </q-item-section>
        </q-item>
        <q-card-section>
          <q-list>
            <q-input v-model="newHeader.header" filled label="Header" :hint="newHeaderHint" dense />
            <q-input v-model="newHeader.value" filled label="Value" :hint="newHeaderValueHint" dense />
          </q-list>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn flat color="green" class="round-corners" label="Add" v-on:click.native="addNewHeader"/>
          <q-btn flat class="round-corners" label="Cancel" v-on:click.native="addHeaderPopUp=false"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
export default {
  name: 'DomainConfig',
  data () {
    return {
      addHeaderPopUp: false,
      newHeaderHint: '',
      newHeader: {
        header: '',
        value: ''
      },
      newHeaderValueHint: '',
      config: [],
      headers: [],
      expanded: false,
      removeDisabled: false,
      removeButtonLabel: `Yes, remove ${this.$route.params.domain}`,
      message: `Are you sure you want to stop monitoring ${this.$route.params.domain} and remove all associated metrics and checks?`
    }
  },
  methods: {
    async addNewHeader () {
      const resp = await this.upsertHeader(this.newHeader.header, this.newHeader.value)
      console.log(resp)
      if (resp.status) {
        this.newHeader = {
          header: '',
          value: ''
        }
        this.newHeaderValueHint = ''
        this.newHeaderHint = ''
        this.addHeaderPopUp = false
        await this.getDomainConfig()
      }
      this.newHeaderValueHint = 'Something went wrong. Please try again.'
    },
    async updateConfigValue (setting) {
      let newValue = setting.value
      if (setting.fieldName === 'timeout') {
        newValue = setting.value * 1000
      }
      const resp = await this.$backend.upsertDomainConfigProperty({
        domain: this.$route.params.domain,
        field: setting.fieldName,
        value: newValue
      })
      console.log(resp)
    },
    async updateHeader (header, value) {
      const resp = await this.upsertHeader(header, value)
      if (resp.success) {
        await this.getDomainConfig()
        return
      }
      this.$q.notify({
        message: `Something went wrong while trying to update ${header} header for ${this.$route.params.domain}`,
        type: 'negative',
        position: 'top-right',
        html: false,
        timeout: 10000,
        closeBtn: true
      })
    },
    async upsertHeader (header, value) {
      const resp = await this.$backend.upsertDomainHeader({
        domain: this.$route.params.domain,
        header,
        value
      })
      return resp
    },
    async removeHeader (header) {
      const resp = await this.$backend.removeDomainHeader({
        domain: this.$route.params.domain,
        header
      })
      if (resp.success) {
        await this.getDomainConfig()
        return
      }
      this.$q.notify({
        message: `Something went wrong while trying to remove ${header} header for ${this.$route.params.domain}`,
        type: 'negative',
        position: 'top-right',
        html: false,
        timeout: 10000,
        closeBtn: true
      })
    },
    async removeDomain () {
      this.loading = true
      this.message = `Removing ${this.$route.params.domain}. This may take a while depending on the amount of associated data.`
      this.removeButtonLabel = 'Please wait!'
      this.removeDisabled = true
      const resp = await this.$backend.removeDomain({ domain: this.$route.params.domain })
      if (!resp.success) {
        this.message = 'Something went wrong'
        this.$q.notify({
          message: `Something went wrong while trying to remove ${this.$route.params.domain}`,
          type: 'negative',
          position: 'top-right',
          html: false,
          timeout: 10000,
          closeBtn: true
        })
        this.loading = false
      } else {
        this.$q.notify({
          message: `${this.$route.params.domain} was removed successfully`,
          type: 'positive',
          position: 'top-right',
          html: false,
          timeout: 10000,
          closeBtn: true
        })
        this.loading = false
        return this.$router.push('/domains')
      }
    },
    async getDomainConfig () {
      this.loading = true

      const resp = await this.$backend.domainStatus({ domain: this.$route.params.domain })
      if (resp.success) {
        const headers = []
        for (const [key, value] of Object.entries(resp.data.headers)) {
          headers.push({
            header: key,
            value
          })
        }
        this.headers = headers
        this.config = [{
          label: 'Check Frequency',
          fieldName: 'frequency',
          suffix: 'minutes',
          value: resp.data.checkFrequencyMinutes,
          fieldType: 'number',
          tooltip: 'Set check frequency in minutes',
          minValue: 1,
          maxValue: 1440
        }, {
          label: 'Endpoint',
          fieldName: 'endpoint',
          suffix: '',
          value: resp.data.endpoint,
          tooltip: 'Set the endpoint to be checked',
          fieldType: 'text'
        }, {
          label: 'Request timeout threshold',
          fieldName: 'timeout',
          suffix: 'seconds',
          value: resp.data.timeoutMs / 1000,
          fieldType: 'number',
          tooltip: 'Set check timeout in seconds',
          minValue: 1,
          maxValue: 60
        }]
      }
      this.loading = false
    }
  },
  async created () {
    await this.getDomainConfig()
  }
}
</script>
<style lang="sass" scoped>
.round-corners-max-width
  width: 100%
  max-width: 350px
  border-radius: 30px
.round-corners
  align-content: center
  max-width: 350px
  border-radius: 30px
</style>
