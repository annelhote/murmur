<script>
  import i18n from '@/i18n'
  import { BTabs, BTab, BInputGroup, BInputGroupAppend, BFormInput } from 'bootstrap-vue'
  import HapticCopy from './HapticCopy.vue'

  /**
   * A form with tabs to offer several copy formats to users.
   */
  export default {
    name: 'AdvancedLinkForm',
    i18n,
    components: {
      BTabs,
      BTab,
      BInputGroup,
      BInputGroupAppend,
      BFormInput,
      HapticCopy
    },
    props: {
      /**
       * The link to copy
       */
      link: {
        type: String
      },
      /**
       * Title associated with the link
       */
      title: {
        type: String
      },
      /**
       * The forms to display
       */
      forms: {
        type: Array,
        default: () => (['raw', 'markdown', 'rich', 'html'])
      },
      /**
      * Index of the selected tab
      */
      value:  {
        type: Number,
        default: 0
      },
      /**
      * Activate the card integration for the tabs
      */
      card: {
        type: Boolean
      },
      /**
      * Renders the tabs with the appearance of pill buttons
      */
      pills: {
        type: Boolean
      },
      /**
      * Makes the tabs and the panels smaller.
      */
      small: {
        type: Boolean
      },
      /**
      * Makes the tabs and the panels smaller.
      */
      vertical: {
        type: Boolean
      },
      /**
       * CSS class (or classes) to apply to the currently active tab.
       */
      activeNavItemClass: {
        type: String
      },
      /**
       * When set to 'true', disables the fade animation on the tabs.
       */
      noFade: {
        type: Boolean
      }
    },
    computed: {
      titleOrLink () {
        return this.title || this.link
      },
      linkAsMarkdown () {
        return `[${this.titleOrLink}](${this.link})`
      },
      linkAsHtml () {
        return `<a href="${this.link}" target="_blank">${this.titleOrLink}</a>`
      },
      formClasses () {
        const props = ['card', 'pills', 'small', 'vertical']
        return props.reduce((classes, prop) => {
          classes[`advanced-link-form--${prop}`] = this[prop]
          return classes
        }, {})
      }
    },
    methods: {
      showForm (name) {
        return this.forms.indexOf(name) > -1
      },
      selectInput (target) {
        this.$el.querySelector(target).select()
      },
      selectRaw () {
        this.selectInput('.advanced-link-form__raw__input')
      },
      selectRich () {
        // The element to select
        const node = this.$el.querySelector('.advanced-link-form__rich__input')
        // Browser supports `getSelection`
        if (window.getSelection) {
          const selection = window.getSelection()
          const range = document.createRange()
          range.selectNodeContents(node)
          selection.removeAllRanges()
          selection.addRange(range)
        // Browser supports `body.createTextRange`
        } else if (document.body.createTextRange) {
          const range = document.body.createTextRange()
          range.moveToElementText(node)
          range.select()
        }
      },
      selectMarkdown () {
        this.selectInput('.advanced-link-form__markdown__input')
      },
      selectHtml () {
        this.selectInput('.advanced-link-form__html__input')
      }
    }
  }
</script>

<template>
  <b-tabs class="advanced-link-form" :content-class="card ? 'mt-0' : 'mt-3'"
    :card="card"
    :pills="pills"
    :value="value"
    :small="small"
    :vertical="vertical"
    :active-nav-item-class="activeNavItemClass"
    :no-fade="noFade"
    :class="formClasses"
    @input="$emit('input', $event)">
    <b-tab :title="$t('advanced-link-form.raw.tab')" v-if="showForm('raw')">
      <div class="advanced-link-form__raw" :class="{ small }">
        <b-input-group :size="small ? 'sm' : 'md'">
          <b-form-input readonly :value="link" class="advanced-link-form__raw__input" @click="selectRaw()" />
          <b-input-group-append>
              <haptic-copy class="btn-secondary" :text="link" @attempt="selectRaw()" />
          </b-input-group-append>
        </b-input-group>
      </div>
    </b-tab>
    <b-tab :title="$t('advanced-link-form.rich.tab')" v-if="showForm('rich')">
      <div class="advanced-link-form__rich" :class="{ small }">
        <b-input-group :size="small ? 'sm' : 'md'">
          <a :href="link" class="form-control advanced-link-form__rich__input" @click.prevent="selectRich()" v-html="titleOrLink"></a>
          <b-input-group-append>
            <haptic-copy class="btn-secondary" html :text="linkAsHtml" :plain="link" @attempt="selectRich()" />
          </b-input-group-append>
        </b-input-group>
        <p class="text-muted mt-2 mb-0">
          {{ $t('advanced-link-form.rich.description') }}
        </p>
      </div>
    </b-tab>
    <b-tab :title="$t('advanced-link-form.markdown.tab')" v-if="showForm('markdown')">
      <div class="advanced-link-form__markdown" :class="{ small }">
        <b-input-group :size="small ? 'sm' : 'md'">
          <b-form-input readonly :value="linkAsMarkdown" class="advanced-link-form__markdown__input" @click="selectMarkdown()" />
          <b-input-group-append>
              <haptic-copy class="btn-secondary" :text="linkAsMarkdown" @attempt="selectMarkdown()" />
          </b-input-group-append>
        </b-input-group>
        <p class="text-muted mt-2 mb-0">
          {{ $t('advanced-link-form.markdown.description') }}
        </p>
      </div>
    </b-tab>
    <b-tab :title="$t('advanced-link-form.html.tab')" v-if="showForm('html')">
      <div class="advanced-link-form__html" :class="{ small }">
        <b-input-group :size="small ? 'sm' : 'md'">
          <b-form-input readonly :value="linkAsHtml" class="advanced-link-form__html__input" @click="selectHtml()" />
          <b-input-group-append>
              <haptic-copy class="btn-secondary" :text="linkAsHtml" @attempt="selectHtml()" />
          </b-input-group-append>
        </b-input-group>
      </div>
    </b-tab>
  </b-tabs>
</template>

<style lang="scss" scoped>
  @import '../styles/lib';

  .advanced-link-form {
    text-align: left;

    &__raw__input[readonly],
    &__markdown__input[readonly],
    &__html__input[readonly] {
      background: $input-bg;
    }

    &__rich__input {
      text-align: center;
      text-decoration: underline;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>
