import { mount } from '@vue/test-utils'
import SignUpForm from '@/components/SignUpForm'
import Murmur from '@/main'
import $ from 'jquery'

describe('SignUpForm', () => {

  it('is a Vue instance', () => {
    const wrapper = mount(SignUpForm)
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('renders the label by default', () => {
    const wrapper = mount(SignUpForm)
    expect(wrapper.find('label').exists()).toBeTruthy()
  })

  it('disables the label when props.noLabel is passed', () => {
    const noLabel = true
    const wrapper = mount(SignUpForm, {
       propsData: { noLabel }
    })
    expect(wrapper.find('label').exists()).toBeFalsy()
  })

  it('doesn\'t render the form horizontally by default', () => {
    const wrapper = mount(SignUpForm)
    expect(wrapper.is('.sign-up-form--horizontal')).toBeFalsy()
  })

  it('renders the form horizontally when props.horizontal is passed', () => {
    const horizontal = true
    const wrapper = mount(SignUpForm, {
       propsData: { horizontal }
    })
    expect(wrapper.is('.sign-up-form--horizontal')).toBeTruthy()
  })

  it('uses a default tracker when none is given', () => {
    const wrapper = mount(SignUpForm)
    const tracker = Murmur.config.get('signup-form.tracker')
    expect(wrapper.find('[name=SIGNUP]').element.value).toBe(tracker)
  })

  it('uses a custom tracker when props.tracker is passed', () => {
    const tracker = 'YOLO'
    const wrapper = mount(SignUpForm, {
      propsData: { tracker }
    })
    expect(wrapper.find('[name=SIGNUP]').element.value).toBe(tracker)
  })

  it('sends the email when submitting the form', () => {
    const wrapper = mount(SignUpForm)
    wrapper.vm.send = jest.fn(() => $.Deferred())
    expect(wrapper.vm.send.mock.calls.length).toBe(0)
    wrapper.trigger('submit')
    expect(wrapper.vm.send.mock.calls.length).toBe(1)
  })

  it('sends the email when submitting the form and display the confirmation', () => {
    const wrapper = mount(SignUpForm)
    const msg = '☮️'
    wrapper.vm.send = jest.fn(() => $.Deferred().resolve({ result: 'success', msg }))
    wrapper.trigger('submit')
    expect(wrapper.vm.successMessage).toBe(msg)
  })

  it('sends the email and drops it when the result is a success', () => {
    const wrapper = mount(SignUpForm)
    const msg = '☮️'
    wrapper.vm.email = 'data@icij.org'
    wrapper.vm.send = jest.fn(() => $.Deferred().resolve({ result: 'success', msg }))
    wrapper.trigger('submit')
    expect(wrapper.vm.email).toBe('')
  })

  it('sends the email when submitting the form and display the error', () => {
    const wrapper = mount(SignUpForm)
    const msg = '❎'
    wrapper.vm.send = jest.fn(() => $.Deferred().resolve({ msg }))
    wrapper.trigger('submit')
    expect(wrapper.vm.errorMessage).toBe(msg)
  })

  it('sends the email but doesn\'t drop it when the result is an error', () => {
    const wrapper = mount(SignUpForm)
    const msg = '❎'
    wrapper.vm.email = 'data@icij.org'
    wrapper.vm.send = jest.fn(() => $.Deferred().reject({ msg }))
    wrapper.trigger('submit')
    expect(wrapper.vm.email).toBe('data@icij.org')
  })

  it('sends the email when submitting the form and display the error, with a rejected promise', () => {
    const wrapper = mount(SignUpForm)
    const msg = '❎'
    wrapper.vm.send = jest.fn(() => $.Deferred().reject({ msg }))
    wrapper.trigger('submit')
    expect(wrapper.vm.errorMessage).toBe(msg)
  })

  it('sends the email and transform the error message', () => {
    const wrapper = mount(SignUpForm)
    wrapper.vm.send = jest.fn(() => $.Deferred().reject({ msg: '0 -❎' }))
    wrapper.trigger('submit')
    expect(wrapper.vm.errorMessage).toBe('❎')
  })

  it('sends the email and show a default error message', () => {
    const wrapper = mount(SignUpForm)
    wrapper.vm.send = jest.fn(() => $.Deferred().reject({ }))
    wrapper.trigger('submit')
    expect(wrapper.vm.errorMessage).toBe('Something\'s wrong')
  })
})
