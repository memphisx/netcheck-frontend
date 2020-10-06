<template>
  <div class="q-pa-sm items-start clickable">
    <div v-if="metric.extendedType && metric.extendedType === 'PERCENTAGE'">
      <apexChart
        type="radialBar"
        :options="chart.options"
        :series="chart.series"
        :key="`${metric.fieldName}_${metric.id}`"
      />
    </div>
    <q-card
      v-else
      class="round-corners bg-green generic-card" flat bordered
    >
      <q-card-section class="row q-gutter-md">
        <q-icon :name="generateIcon(metric)" class="generic-card-icon" />
        <div class="vertical">
          <div class="generic-card-caption" v-if="metric.label && metric.label!==''">{{ metric.label }}</div>
          <div class="generic-card-text" v-if="metric.extendedType && metric.extendedType == 'DATETIME'">
            {{ metric.value }}
          </div>
          <div class="generic-card-text" v-else-if="metric.extendedType && metric.extendedType === 'BYTES' || metric.extendedType === 'KILOBYTES'">
            {{ generatePrettyBytes(metric) }}
          </div>
          <div class="generic-card-text" v-else>
            {{ generateValue(metric) }} {{ metric.suffix }}
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>
<script type="text/javascript">
import prettyBytes from 'pretty-bytes'
import VueApexCharts from 'vue-apexcharts'
export default {
  props: ['metric'],
  components: {
    apexChart: VueApexCharts
  },
  methods: {
    generateValue (metric) {
      if (metric.valueType === 'DOUBLE') {
        return parseFloat(metric.value)
      } else if (metric.valueType === 'INT') {
        return parseInt(metric.value)
      }
      return metric.value
    },
    generateOptions (metric) {
      return {
        useEasing: true,
        useGrouping: true,
        decimalPlaces: metric.valueType === 'DOUBLE' ? 2 : 0,
        separator: ',',
        decimal: '.',
        prefix: '',
        suffix: metric.suffix ? metric.suffix : ''
      }
    },
    generatePrettyBytes (metric) {
      return prettyBytes(parseInt(metric.value) * 1024)
    },
    generateIcon (metric) {
      if (metric.extendedType === 'TEMPERATURE') {
        return 'fas fa-thermometer-half'
      }
      if (metric.extendedType === 'DATETIME') {
        return 'schedule'
      }
      if (metric.extendedType === 'PERCENTAGE') {
        return 'fas fa-percentage'
      }
      return 'show_chart'
    }
  },
  data () {
    return {
      tasks: [],
      delay: 1000,
      duration: 0,
      card: false,
      chart: {
        series: [],
        options: {
          chart: {
            type: 'radialBar',
            offsetY: -20,
            sparkline: {
              enabled: true
            },
            animations: {
              enabled: false
            }
          },
          plotOptions: {
            radialBar: {
              startAngle: -90,
              endAngle: 90,
              track: {
                background: '#e7e7e7',
                strokeWidth: '97%',
                margin: 5, // margin is in pixels
                dropShadow: {
                  enabled: true,
                  top: 2,
                  left: 0,
                  color: '#999',
                  opacity: 1,
                  blur: 2
                }
              },
              dataLabels: {
                name: {
                  show: true,
                  offsetY: -6,
                  fontSize: '12px'
                },
                value: {
                  offsetY: -40,
                  fontSize: '20px'
                }
              }
            }
          },
          grid: {
            padding: {
              top: -10
            }
          },
          fill: {
            type: 'gradient',
            gradient: {
              shade: 'light',
              shadeIntensity: 0.4,
              inverseColors: false,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 50, 53, 91]
            }
          },
          labels: []
        }
      }
    }
  },
  async mounted () {
    if (this.metric.extendedType === 'PERCENTAGE') {
      this.chart.series.push(this.metric.value)
      this.chart.options.labels.push(this.metric.label)
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
