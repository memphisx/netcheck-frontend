<template>
  <div>
    <q-expansion-item
      expand-separator
      default-closed
      :icon="iconName"
      :label="check.protocol"
      caption="Protocol Accessibility info"
    >
      <q-card>
        <q-card-section>
          <q-list bordered separator>
            <q-item clickable v-ripple>
              <q-item-section>
                <q-item-label overline>Status code</q-item-label>
                <q-item-label>{{ check.statusCode }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple>
              <q-item-section>
                <q-item-label overline>Response Time</q-item-label>
                <q-item-label>{{ check.responseTimeNs / 1000000 }}ms</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple>
              <q-item-section>
                <q-item-label overline>Checked On</q-item-label>
                <q-item-label>{{ check.checkedOn }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>
    <div v-if="check.protocol === 'HTTPS'">
      <q-expansion-item
        default-closed
        expand-separator
        icon="security"
        label="Certificate"
        header-class="text-black"
      >
        <q-card v-if="issuerCertificate">
          <q-card-section>
            <q-list bordered separator>
              <q-item clickable v-ripple>
                <q-item-section>
                  <q-item-label overline>Valid</q-item-label>
                  {{ issuerCertificate.valid }}
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple>
                <q-item-section>
                  <q-item-label overline>Expired</q-item-label>
                  {{ issuerCertificate.expired }}
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple>
                <q-item-section>
                  <q-item-label overline>Valid From</q-item-label>
                  {{ issuerCertificate.notBefore  }}
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple>
                <q-item-section>
                  <q-item-label overline>Expires On</q-item-label>
                  {{ issuerCertificate.notAfter }}
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple>
                <q-item-section>
                  <q-item-label overline>Certificate Issued By</q-item-label>
                  <q-item v-for="(value, key) in issuerCertificate.issuedBy" v-bind:key="key">
                    {{ key }} : {{ value }}
                  </q-item>
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple>
                <q-item-section>
                  <q-item-label overline>Issued For</q-item-label>
                  <q-item v-for="(value, key) in issuerCertificate.issuedFor" v-bind:key="key">
                    {{ key }} : {{ value }}
                  </q-item>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </div>
    <q-expansion-item
      default-closed
      expand-separator
      icon="dns"
      label="DNS Status"
      caption="Domain Name Resolution"
    >
      <q-card>
        <q-card-section>
          <q-list bordered separator>
            <q-item clickable v-ripple>
              <q-item-section>
                <q-item-label overline>DNS entry found</q-item-label>
                <q-item-label>{{ check.dnsResolves }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple>
              <q-item-section>
                <q-item-label overline>IP Address</q-item-label>
                <q-item-label>{{ check.ipAddress }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple>
              <q-item-section>
                <q-item-label overline>Host name</q-item-label>
                <q-item-label>{{ check.hostname }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </div>
</template>
<script type="text/javascript">
export default {
  props: ['check', 'issuerCertificate', 'backgroundColor', 'iconName']
}
</script>
