<template>
  <q-page>
    <div class="flex flex-center q-py-xl">
      <img alt="Quasar logo" src="~assets/netcheck-logo.png">
    </div>
    <div class="flex flex-center">
      <q-input borderless bottom-slots @keydown.enter.prevent="submit()" ref="domain" v-model="domainName" label="https://">
        <template v-slot:prepend>
          <q-icon name="https" />
        </template>
        <template v-slot:append>
          <q-icon name="close" @click="text = ''" class="cursor-pointer" />
        </template>

        <template v-slot:hint>
          Enter your domain to check
        </template>
      </q-input>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'WebCheck',
  data () {
    return {
      domainName: ''
    }
  },
  methods: {
    submit () {
      const domain = this.domainName
      console.log(domain)
      this.$router.push(`/domains/${domain}`)
    }
  }
}
</script>
