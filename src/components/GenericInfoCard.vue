<template>
  <div class="q-pa-sm items-start clickable">
    <q-card :class="cardClass + ' generic-card'" flat bordered @click="cardClickTrigger">
      <q-card-section class="row q-gutter-md">
        <q-icon :name="icon" class="generic-card-icon" />
        <div class="vertical">
          <div class="generic-card-caption" v-if="description && description!==''">{{ description }}</div>
          <div class="generic-card-text" v-if="type === 'countUp'">
            <ICountUp
              :endVal="Number(value)"
              :options="options"
            />
          </div>
          <div class="generic-card-text" v-else-if="type === 'duration'">{{ duration }}{{ suffix }}</div>
          <div class="generic-card-text" v-else>{{ value }}{{ suffix }}</div>
        </div>
      </q-card-section>
    </q-card>
    <q-dialog v-model="card" v-if="dialogInfo">
      <q-card class="round-corners">
        <q-item :class="cardClass">
          <q-item-section avatar>
            <q-avatar :icon="icon" text-color="white" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ dialogInfo.title }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-card-section>
          <q-list separator>
            <q-item v-for="(info) in dialogInfo.data" v-bind:key="info.title">
              <q-item-section>
                <q-item-label overline>{{ info.title }}</q-item-label>
                <q-item-label>{{ info.value }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script type="text/javascript">
import ICountUp from 'vue-countup-v2'
import moment from 'moment'
import { openURL } from 'quasar'
export default {
  props: ['cardClass', 'icon', 'value', 'suffix', 'description', 'type', 'decimalPlaces', 'linkTo', 'dialogInfo'],
  components: {
    ICountUp
  },
  methods: {
    toFriendlyDate (dateTime) {
      return moment(dateTime).format('LLL')
    },
    cardClickTrigger () {
      if (this.linkTo) {
        openURL(this.linkTo)
      }
      if (this.dialogInfo) {
        this.card = true
      }
    }
  },
  created: function () {
    if (this.type && this.type === 'duration') {
      const self = this
      this.tasks.push(setInterval(() => {
        const currentTime = moment(Date.now())
        const end = moment(self.value)
        self.duration = moment.duration(currentTime.diff(end)).asSeconds().toFixed(0)
      }, 1000))
    }
  },
  async beforeDestroy () {
    await this.tasks.forEach((task) => {
      clearInterval(task)
    })
  },
  data () {
    return {
      tasks: [],
      delay: 1000,
      duration: 0,
      card: false,
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
  .generic-card
    @media(max-width: 600px)
      font-size: 0.75rem
      font-weight: 400
      line-height: 1.25rem
      min-width: 30px
      letter-spacing: 0.03333em
    @media(min-width: 601px)
      font-size: 4rem
  .generic-card-icon
    @media(max-width: 600px)
      font-size: 1.2rem
      font-weight: 400
      line-height: 1.25rem
      letter-spacing: 0.03333em
    color: #fff !important
  .generic-card-caption
    @media(max-width: 600px)
      display: none
    font-size: 0.75rem
    font-weight: 400
    line-height: 1.25rem
    letter-spacing: 0.03333em
    color: #fff !important
  .generic-card-text
    @media(max-width: 600px)
      font-size: 1rem
      color: #fff !important
    @media(min-width: 601px)
      font-size: 2.125rem
      font-weight: 400
      line-height: 2.5rem
      letter-spacing: 0.00735em
      color: #fff !important
  .round-corners
    width: 100%
    border-radius: 10px
    @media(min-width: 601px)
      min-width: 200px
</style>
