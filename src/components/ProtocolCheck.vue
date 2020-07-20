<template>
  <div class="q-pa-md row items-start q-gutter-md">
    <q-card class="round-top-corners" flat bordered shadow-12>
      <q-item :class="check.up ? 'bg-green-7 text-white' : 'bg-negative text-white'">
        <q-item-section avatar>
          <q-avatar icon="policy" color="bg-green-7 text-white" text-color="white" />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ check.protocol }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row items-center">
            <q-icon :name="check.up ? 'check' : 'close'" color="white" size="24px" />
          </div>
        </q-item-section>
      </q-item>

      <q-card-section>
        <div class="text-overline text-orange-9">{{ check.protocol.toLowerCase() }}://{{ $route.params.domain }}</div>
        <div v-if="check.up === true">
          <div  class="text-h5 q-mt-sm q-mb-xs">Up and Running</div>
          <div class="text-caption text-grey">
            Website is accessible from here through a {{ check.protocol === 'HTTP' ? 'non' : '' }} secure connection
          </div>
          <div v-if="check.redirectUri" class="text-caption text-grey">
            It currently redirects to {{check.redirectUri}}
          </div>
          <div v-if="check.statusCode" class="text-caption text-grey">
            We got a {{ check.statusCode }} status code in {{ convertNanoToSeconds(check.responseTimeNs).toFixed(3) }} seconds
          </div>
        </div>
        <div v-if="check.up === false">
          <div  class="text-h5 q-mt-sm q-mb-xs">Down</div>
          <div class="text-caption text-grey">
            Website seems to be down from here through a {{ check.protocol === 'HTTP' ? 'non' : '' }} secure connection
          </div>
          <div v-if="check.redirectUri" class="text-caption text-grey">
            It currently redirects to {{check.redirectUri}}
          </div>
          <div v-if="check.statusCode" class="text-caption text-grey">
            We got a {{ check.statusCode }} status code in {{ convertNanoToSeconds(check.responseTimeNs).toFixed(3) }} seconds
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-expansion-item
        default-closed
        expand-separator
        label="Summary"
        icon="info"
      >
        <q-card>
          <q-card-section>
            <q-list separator>
              <q-item>
                <q-item-section>
                  <q-item-label overline>Status code</q-item-label>
                  <q-item-label>{{ check.statusCode }}</q-item-label>
                </q-item-section>
                <q-item-section side middle>
                  <q-icon :name="check.up ? 'check_circle' : 'cancel'" :color="check.up ? 'green' : 'red'" />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label overline>Response Time</q-item-label>
                  <q-item-label>{{ convertNanoToMili(check.responseTimeNs) }} ms</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label overline>Checked On</q-item-label>
                  <q-item-label>{{ toFriendlyDate(check.checkedOn) }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="check.redirectUri">
                <q-item-section>
                  <q-item-label overline>Redirects To</q-item-label>
                  <q-item-label>{{ check.redirectUri }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <!-- Certificate -->
      <q-expansion-item
        default-closed
        expand-separator
        icon="security"
        label="Certificate"
        v-if="check.protocol === 'HTTPS'"
      >
        <q-card v-if="issuerCertificate">
          <q-card-section>
            <q-list separator>
              <q-item>
                <q-item-section>
                  <q-item-label overline>Valid</q-item-label>
                </q-item-section>
                <q-item-section side middle>
                  <q-icon :name="issuerCertificate.valid ? 'check_circle' : 'cancel'" :color="issuerCertificate.valid ? 'green' : 'red'" />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label overline>Expired</q-item-label>
                </q-item-section>
                <q-item-section side middle>
                  <q-icon :name="issuerCertificate.expired ? 'check_circle' : 'cancel'" :color="issuerCertificate.expired ? 'red' : 'green'" />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label overline>Valid From</q-item-label>
                  {{ toFriendlyDate(issuerCertificate.notBefore)  }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label overline>Expires On</q-item-label>
                  {{ toFriendlyDate(issuerCertificate.notAfter) }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label overline>Certificate Issued By</q-item-label>
                  <q-list dense padding>
                    <q-item v-for="(value, key) in issuerCertificate.issuedBy" v-bind:key="key">
                      <q-item-section side middle>
                        <q-item-label>{{ key }}:</q-item-label>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ value }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label overline>Certificate Issued For</q-item-label>
                  <q-list dense padding>
                    <q-item v-for="(value, key) in issuerCertificate.issuedFor" v-bind:key="key">
                      <q-item-section side middle>
                        <q-item-label>{{ key }}:</q-item-label>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ value }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <!-- DNS -->
      <q-expansion-item
        default-closed
        expand-separator
        icon="dns"
        label="DNS Status"
        caption="Domain Name Resolution"
      >
        <q-card>
          <q-card-section>
            <q-list separator>
              <q-item>
                <q-item-section>
                  <q-item-label overline>DNS entry found</q-item-label>
                </q-item-section>
                <q-item-section side middle>
                  <q-icon :name="check.dnsResolves ? 'check_circle' : 'cancel'" :color="check.dnsResolves ? 'green' : 'red'" />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label overline>IP Address</q-item-label>
                  <q-item-label>{{ check.ipAddress }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label overline>Host name</q-item-label>
                  <q-item-label>{{ check.hostname }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-card>
  </div>
</template>
<script type="text/javascript">
import moment from 'moment'
export default {
  props: ['check', 'issuerCertificate', 'backgroundColor', 'iconName'],
  methods: {
    toFriendlyDate (dateTime) {
      return moment(dateTime).format('LLL')
    },
    convertNanoToMili (nanoseconds) {
      return nanoseconds / 1000000
    },
    convertNanoToSeconds (nanoseconds) {
      return nanoseconds / 1000000000
    }
  }
}
</script>
<style lang="sass" scoped>
  .round-corners
    width: 100%
    max-width: 350px
    border-radius: 30px
  .round-top-corners
    width: 100%
    max-width: 350px
    border-top-left-radius: 30px
    border-top-right-radius: 30px
</style>
