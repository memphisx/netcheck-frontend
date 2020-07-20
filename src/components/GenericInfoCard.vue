<template>
  <div class="q-pa-md row items-start">
    <q-card :class="cardClass" flat bordered>
      <q-card-section class="row q-gutter-md">
        <q-icon :name="icon" class="text-white" style="font-size: 4rem;" />
        <div class="vertical">
          <div class="text-caption text-white" v-if="description && description!==''">{{ description }}</div>
          <div class="text-h4 text-white" v-if="type === 'countUp'">
            <ICountUp
              :endVal="Number(value)"
              :options="options"
            />
          </div>
          <div class="text-h4 text-white" v-else-if="type === 'duration'">{{ duration }}{{ suffix }}</div>
          <div class="text-h4 text-white" v-else>{{ value }}{{ suffix }}</div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>
<script type="text/javascript">
import ICountUp from 'vue-countup-v2'
import moment from 'moment'
export default {
  props: ['cardClass', 'icon', 'value', 'suffix', 'description', 'type', 'decimalPlaces'],
  components: {
    ICountUp
  },
  methods: {
    toFriendlyDate (dateTime) {
      return moment(dateTime).format('LLL')
    }
  },
  created: function () {
    if (this.type && this.type === 'duration') {
      const self = this
      setInterval(() => {
        const currentTime = moment(Date.now())
        const end = moment(self.value)
        self.duration = moment.duration(currentTime.diff(end)).asSeconds().toFixed(0)
      }, 1000)
    }
  },
  data () {
    return {
      delay: 1000,
      duration: 0,
      options: {
        useEasing: true,
        useGrouping: true,
        decimalPlaces: this.decimalPlaces ? this.decimalPlaces : 0,
        separator: ',',
        decimal: '.',
        prefix: '',
        suffix: this.suffix ? this.suffix : ''
      }
    }
  }
}
</script>
<style lang="sass" scoped>
  .round-corners
    width: 100%
    border-radius: 10px
  .round-top-corners
    width: 100%
    border-top-left-radius: 20px
    border-top-right-radius: 30px
</style>
