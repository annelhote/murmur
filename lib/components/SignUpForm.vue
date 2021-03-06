<template>
  <form @submit.prevent="subscribe($event)" class="sign-up-form" :class="{ 'sign-up-form--horizontal': horizontal }">
    <fieldset :disabled="frozen">
      <label class="text-uppercase text-muted font-weight-bold" for="input-email" v-if="!noLabel">
        {{ $t("sign-up-form.label") }}
      </label>
      <div class="sign-up-form__fieldset__group" :class="{ 'input-group': horizontal }">
        <input v-model="email" name="EMAIL" type="email" class="form-control" :placeholder="$t('sign-up-form.placeholder')" id="input-email" />
        <div class="sign-up-form__fieldset__group__addon" :class="{ 'input-group-append': horizontal }">
          <button class="btn btn-primary text-uppercase font-weight-bold" type="submit">
            {{ $t("sign-up-form.submit") }}
          </button>
        </div>
      </div>
    </fieldset>
    <p v-if="errorMessage" class="alert alert-danger p-2 m-0 mt-2" v-html="errorMessage"></p>
    <p v-if="successMessage" class="alert alert-success p-2 m-0 mt-2" v-html="successMessage"></p>
  </form>
</template>

<script>
import Promise from 'promise-polyfill'
import jsonp from 'jsonp'
import last from 'lodash/last'
import config from '../config'
import i18n from '@/i18n'

/**
 * SignUpForm
 */
export default {
  i18n,
  name: "SignUpForm",
  props: {
    /**
     * Mailchimp URL to send the data to.
     */
    action: {
      type: String,
      default: () => config.get('signup-form.action')
    },
    /**
     * Disable the main label.
     */
    noLabel: {
      type: Boolean
    },
    /**
     * Horizontal layout of the form.
     */
    horizontal: {
      type: Boolean
    },
    /**
     * Mailchimp tracker tag to identify the origin.
     */
    tracker: {
      type: String,
      default: () => config.get('signup-form.tracker')
    },
    /**
     * Referrer URL cant be passed explicitely
     */
    referrer: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      email: '',
      frozen: false,
      response: {},
      errorMessage: null,
      successMessage: null
    };
  },
  computed: {
    url () {
      return this.action.replace('/post?', '/post-json?').concat('&c=?')
    },
    parentReferrer () {
      if (this.referrer) {
        return this.referrer
      }
      return window.location != window.parent.location ? document.referrer : document.location.href
    },
    submitUrl () {
      const url = new URL(this.url)
      url.searchParams.set('EMAIL', this.email)
      url.searchParams.set('SIGNUP', this.tracker)
      url.searchParams.set('MMERGE24', this.parentReferrer)
      url.searchParams.set('group[9][1]', '1')
      return url.href
    }
  },
  methods: {
    subscribe () {
      this.resetMessages()
      this.freeze()
      // Send the data, catch the result no matter what and unfreeze the form
      return this.send().then(this.done, this.done)
    },
    send () {
      return new Promise((resolve, reject) => {
        jsonp(this.submitUrl, { param: 'c' }, (err, data) => {
          return err ? reject(err) : resolve(data)
        })
      })
    },
    done ({ result, msg }) {
      if (result === 'success') {
        this.email = ''
        this.successMessage = msg
      } else {
        // Mailchimp formats errors in list
        this.errorMessage = last((msg || "Something's wrong").split('0 -'))
      }
      this.unfreeze()
    },
    resetMessages () {
      this.errorMessage = null
      this.successMessage = null
    },
    freeze () {
      this.frozen = true
    },
    unfreeze () {
      this.frozen = false
    }
  }
};
</script>

<style lang="scss">
  @import '../styles/lib.scss';

  .sign-up-form {

    .sign-up-form__fieldset__group__addon .btn {
      font-size: 0.9em;
    }

    &:not(&--horizontal) {

      .sign-up-form__fieldset__group__addon .btn {
        display: block;
        width: 100%;
      }
    }
  }
</style>
