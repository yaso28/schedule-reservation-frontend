<template>
  <span>
    {{ formattedYmd }}
    <span :class="dayOfWeekClass">
      ({{ $t(`day_of_week.${dayOfWeekIndex}`) }})
    </span>
  </span>
</template>

<script>
import dayOfWeek from '@/consts/dayOfWeek'

export default {
  name: 'MyDateSpan',
  inheritAttrs: false,
  inject: ['dateService'],
  props: {
    value: {
      type: String,
      required: true
    }
  },
  computed: {
    date () {
      return this.dateService.create(this.value)
    },
    year () {
      return this.dateService.year(this.date)
    },
    month () {
      return this.dateService.month(this.date)
    },
    day () {
      return this.dateService.day(this.date)
    },
    dayOfWeekIndex () {
      return this.dateService.dayOfWeekIndex(this.date)
    },
    formattedYmd () {
      return `${this.year}/${this.padZero(this.month)}/${this.padZero(this.day)}`
    },
    isSaturday () {
      return this.dayOfWeekIndex === dayOfWeek.saturday
    },
    isSunday () {
      return this.dayOfWeekIndex === dayOfWeek.sunday
    },
    dayOfWeekClass () {
      return {
        'text-primary': this.isSaturday,
        'text-danger': this.isSunday
      }
    }
  },
  methods: {
    padZero (num) {
      return num.toString().padStart(2, '0')
    }
  }
}
</script>
