<template>
  <div>
    <q-expansion-item
      class="shadow-1 overflow-hidden"
      style="border-radius: 30px"
      icon="explore"
      :header-class="check.up ? 'bg-green-7 text-white' : 'bg-negative text-white'"
      expand-icon-class="text-white"
      caption="Protocol Accessibility info"
      >
      <template v-slot:header>
        <q-item-section avatar>
          <q-avatar :icon="check.protocol === 'HTTP' ? 'find_in_page' : 'policy'" :color="check.up ? 'green-7 text-white' : 'negative text-white'" text-color="white" />
        </q-item-section>

        <q-item-section>
          {{ check.protocol }}
        </q-item-section>

        <q-item-section side>
          <div class="row items-center">
            <q-icon :name="check.up ? 'check' : 'close'" color="white" size="24px" />
          </div>
        </q-item-section>
      </template>
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
          </q-list>
        </q-card-section>
      </q-card>
      <!-- Certificate -->
      <q-expansion-item
        default-closed
        expand-separator
        icon="security"
        label="Certificate"
        header-class="text-black"
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
    </q-expansion-item>
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
    }
  }
}
</script>
