<template>
  <div class="selectable-dropdown show" v-if="!hide" :class="{ 'selectable-dropdown--multiple': multiple, [listClass]: true }">
    <span v-for="(item, index) in items"
          :key="index"
          @click.exact="clickToSelectItem(item)"
          @click.ctrl="clickToAddItem(item)"
          @click.shift="clickToSelectRangeToItem(item)"
          :class="{ active: itemActivated(item), [itemClass]: true }"
          class="selectable-dropdown__item px-3 d-flex">
      <!-- @slot Item content -->
      <slot name="item" v-bind:item="item">
        <div class="selectable-dropdown__item__check" v-if="multiple">
          <fa :icon="indexIcon(item)" class="mr-2" />
        </div>
        <div class="flex-grow-1 text-truncate selectable-dropdown__item__label">
          <!-- @slot Item's label content -->
          <slot name="item-label" v-bind:item="item">
            {{ serializer(item) }}
          </slot>
        </div>
      </slot>
    </span>
  </div>
</template>

<script>
  import castArray from 'lodash/castArray'
  import eq from 'lodash/eq'
  import findIndex from 'lodash/findIndex'
  import filter from 'lodash/filter'
  import identity from 'lodash/identity'
  import isEqual from 'lodash/isEqual'
  import isString from 'lodash/isString'
  import last from 'lodash/last'
  import range from 'lodash/range'

  import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons'

  const KEY_ESC_CODE = 27
  const KEY_UP_CODE = 38
  const KEY_DOWN_CODE = 40

  export default {
    name: 'SelectableDropdown',
    props: {
      /**
       * The items of the list.
       */
      items: {
        type: Array,
        default () { return [] }
      },
      /**
       * The actual selected item.
       */
      value: {
        type: [String, Object, Array, Number],
        default: null
      },
      /**
       * If true, the dropdown is hidden and deactivated.
       */
      hide: {
        type: Boolean
      },
      /**
       * If true, the key events won't be propagated.
       */
      propagate: {
        type: Boolean
      },
      /**
       * The user can select values.
       */
      multiple: {
        type: Boolean
      },
      /**
       * A function to change the label rendering.
       */
      serializer: {
        type: Function,
        default: identity
      },
      /**
       * The class to apply to the list.
       */
      listClass: {
        type: String,
        default: 'dropdown-menu'
      },
      /**
       * The class to apply to each item.
       */
      itemClass: {
        type: String,
        default: 'dropdown-item'
      },
      /**
       * Set to true to deactivate action when arrow keys are pressed
       */
      deactivateKeys: {
        type: Boolean
      },
      /**
       * Comparaison function to verify equality between selected items.
       */
      eq: {
        type: Function,
        default: eq
      }
    },
    components: {
      /** Prevent a bug with vue-docgen-api
       * @see https://github.com/vue-styleguidist/vue-docgen-api/issues/23
       */
      Fa: require('./Fa').default
    },
    data () {
      return {
        activeItems: []
      }
    },
    mounted () {
      this.activateItemOrItems()
      this.toggleKeys()
    },
    destroyed () {
      this.unbindKeys()
    },
    watch: {
      hide () {
        this.toggleKeys()
      },
      activeItems () {
        /**
         * Fired when the selected value change. It will pass a canonical value
         * or an array of values if the property `multiple` is set to true.
         *
         * @event input
         * @type {String, Object, Array, Number}
         */
        this.$emit('input', this.multiple ? this.activeItems : this.activeItems[0])
      },
      value (itemOrItems) {
        const items = castArray(itemOrItems)
        if (!isEqual(this.activeItems, items)) {
          this.activateItemOrItems(items)
        }
      }
    },
    methods: {
      indexIcon (item) {
        return this.itemActivated(item) ? faCheckSquare : faSquare
      },
      itemActivated (item) {
        return findIndex(this.activeItems, i => this.eq(item, i)) > -1
      },
      clickToSelectItem (item) {
        /**
         * Fired when user click on an item
         *
         * @event click
         * @type {String, Object, Array, Number}
         */
         this.$emit('click', item)
         if (this.multiple) {
           this.addItem(item)
         } else {
           this.selectItem(item)
         }
      },
      clickToAddItem (item) {
        /**
         * Fired when user click on an item
         *
         * @event click
         * @type {String, Object, Array, Number}
         */
         this.$emit('click', item)
         this.addItem(item)

      },
      clickToSelectRangeToItem (item) {
        /**
         * Fired when user click on an item
         *
         * @event click
         * @type {String, Object, Array, Number}
         */
         this.$emit('click', item)
         this.selectRangeToItem(item)
      },
      emitEventOnItem (name, item) {
        this.$emit(name, item)
      },
      selectItem (item) {
        if (this.itemActivated(item) && this.activeItems.length === 1) {
          this.activeItems = filter(this.activeItems, i => !this.eq(item, i))
        } else {
          this.activeItems = [ item ]
        }
      },
      addItem (item) {
        if (this.itemActivated(item)) {
          this.activeItems = filter(this.activeItems, i => !this.eq(item, i))
        } else {
          this.activeItems.push(item)
        }
      },
      selectRangeToItem (item) {
        // No activated items
        if (!this.activeItems.length || !this.multiple) {
          this.selectItem(item)
        } else {
          const index = this.items.indexOf(item)
          if (index > this.firstActiveItemIndex) {
            this.activeItems = this.items.slice(this.firstActiveItemIndex, index + 1)
          } else {
            this.activeItems = this.items.slice(index, this.firstActiveItemIndex + 1)
          }
        }
      },
      activateItemOrItems (itemOrItems = this.value) {
        const items = castArray(itemOrItems)
        this.activeItems = [...items]
      },
      activatePreviousItem () {
        this.activeItems = [ this.items[ Math.max(this.firstActiveItemIndex - 1, -1) ] ]
      },
      activateNextItem () {
        this.activeItems = [ this.items[ Math.min(this.firstActiveItemIndex + 1, this.items.length - 1) ] ]
      },
      deactivateItems () {
        this.activeItems = []
        /**
         * Fired when items selection is deactivated
         *
         * @event deactivate
         */
         this.$emit('deactivate')
      },
      keyDown (event) {
        const keyCode = event.keyCode || event.which
        // The dropdown must be active
        if (this.deactivateKeys || this.hide || !this.isKnownKey(keyCode)) return
        // Should we stop the event propagation?
        if (!this.propagate && event.stopPropagation) {
          event.stopPropagation()
          event.preventDefault()
        }
        // Then call the right method
        this.keysMap[keyCode].call(this)
      },
      isKnownKey (keycode) {
        return Object.keys(this.keysMap).map(Number).indexOf(keycode) > -1
      },
      unbindKeys () {
        window.removeEventListener("keydown", this.keyDown)
      },
      bindKeys () {
        window.addEventListener("keydown", this.keyDown)
      },
      toggleKeys () {
        if (this.hide) {
          this.unbindKeys()
        } else {
          this.bindKeys()
        }
      }
    },
    computed: {
      firstActiveItemIndex () {
        return this.activeItems.length ? this.items.indexOf(this.activeItems[0]) : -1
      },
      lastActiveItemIndex () {
        return this.activeItems.length ? this.items.indexOf(this.activeItems.slice(-1)) : -1
      },
      keysMap () {
        return {
          [KEY_UP_CODE]: this.activatePreviousItem,
          [KEY_DOWN_CODE]: this.activateNextItem,
          [KEY_ESC_CODE]: this.deactivateItems
        }
      }
    }
  }
</script>

<style lang="scss">
  .selectable-dropdown {
    user-select: none;

    &.dropdown-menu {
      position: relative;
      top: 0;
      left: 0;
      float: none;
    }
  }
</style>
