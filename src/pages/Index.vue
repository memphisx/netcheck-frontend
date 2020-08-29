<template>
  <q-page>
    <div class="flex flex-center q-py-xl">
      <q-img alt="NetCheck logo" src="~assets/netcheck-logo.png" style="width: 100%; max-width: 700px" />
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
          Enter the domain you want to check
        </template>
      </q-input>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'NetCheck',
  data () {
    return {
      domainName: ''
    }
  },
  methods: {
    submit () {
      const domain = this.domainName
      this.$router.push(`/check/${domain}`)
    }
  }
}
</script>
