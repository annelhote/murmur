<script>
import Promise from 'promise-polyfill';

const noop = () => (null)

/**
 * SlideUpDown
 */
export default {
  name: 'SlideUpDown',
  props: {
    /**
     * Toggler property. Set to <em>false</em> to hide the component.
     */
    active: {
      type: Boolean,
    },
    /**
     * Duration of the animation.
     */
    duration: {
      type: Number,
      default: 200
    },
    /**
     * HTML tag to render this component to.
     */
    tag: {
      type: String,
      default: 'div'
    }
  },
  data () {
    return {
      state: 'post',
      mounted: false,
      scrollHeight: 0
    }
  },
  watch: {
    active (toggler) {
      this.triggerSlide()
    }
  },
  render (h) {
    return h(this.tag, { style: this.style, ref: 'container' }, this.$slots.default)
  },
  mounted () {
    this.deferedNextTick(() => {
      this.mounted = true
      this.cleanLayout()
      this.$container.addEventListener("transitionend", this.cleanLayout)
    })
  },
  computed: {
    stylePreTransition () {
      return {
        'overflow': 'hidden',
        'transition-property': 'height',
        'transition-duration':  `${this.duration}ms`,
        'height': this.mounted ?  `${this.$container.scrollHeight}px` : 0,
      }
    },
    styleActiveTransition () {
      return {
        'overflow': 'hidden',
        'transition-property': 'height',
        'transition-duration':  `${this.duration}ms`,
        'height': this.mounted ?  `${this.activeHeight}px` : 'auto',
      }
    },
    stylePostTransition () {
      // Reset style when the element is active
      return this.active ? { } : this.styleActiveTransition
    },
    style () {
      switch (this.state) {
        case 'pre': return this.stylePreTransition
        case 'active': return this.styleActiveTransition
        default: return this.stylePostTransition
      }
    },
    activeHeight () {
      return this.active ? this.$container.scrollHeight : 0
    },
    $container () {
      return this.$refs.container
    }
  },
  methods: {
    triggerSlide () {
      this.state = 'pre'
      this.scrollHeight = this.$container.scrollHeight
      // Defered next tick to let the component render once
      return this.deferedNextTick(() => this.state = 'active')
    },
    cleanLayout (e = null) {
      // This method can be triggered by animated child elements in
      // which case, we should do anything
      if(!e || e.target == this.$container) {
        this.state = 'post'
        return this.deferedNextTick()
      }
    },
    deferedNextTick (fn = noop) {
      return new Promise(resolve => {
        return setTimeout(() => this.$nextTick(resolve), 0)
      }).then(fn)
    },
  }
}
</script>
