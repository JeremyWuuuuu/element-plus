import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Avatar from '../src/index.vue'
import { IMAGE_SUCCESS, IMAGE_FAIL } from '@element-plus/test-utils'

beforeAll(() => {
  Object.defineProperty(global.Image.prototype, 'src', {
    set(src) {
      const event = new Event(
        src === IMAGE_FAIL ? 'error' : 'load',
      )
      nextTick(() => this.dispatchEvent(event))
    },
  })
})

describe('Avatar.vue', () => {
  test('render test', () => {
    const wrapper = mount(Avatar)
    expect(wrapper.find('.el-avatar').exists()).toBe(true)
  })

  test('size is number', () => {
    const wrapper = mount(Avatar, {
      props: { size: 50 },
    })
    expect(wrapper.attributes('style')).toContain('height: 50px')
  })

  test('size is string', () => {
    const wrapper = mount(Avatar, {
      props: { size: 'small' },
    })
    expect(wrapper.classes()).toContain('el-avatar--small')
  })

  test('shape', () => {
    const wrapper = mount(Avatar, {
      props: { size: 'small', shape: 'square' },
    })
    expect(wrapper.classes()).toContain('el-avatar--square')
  })

  test('icon avatar', () => {
    const wrapper = mount(Avatar, {
      props: { icon: 'el-icon-user-solid' },
    })
    expect(wrapper.classes()).toContain('el-avatar--icon')
    expect(wrapper.find('i').classes()).toContain('el-icon-user-solid')
  })

  test('image avatar', () => {
    const wrapper = mount(Avatar, {
      props: { src: IMAGE_SUCCESS },
    })
    expect(wrapper.find('img').exists()).toBe(true)
  })

  test('image fallback', async () => {
    const wrapper = mount(Avatar, {
      props: { src: IMAGE_FAIL },
      slots: { default: 'fallback' },
    })
    await nextTick()
    expect(wrapper.emitted('error')).toBeDefined()
    await nextTick()
    expect(wrapper.text()).toBe('fallback')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  test('image fit', () => {
    const fits = ['fill', 'contain', 'cover', 'none', 'scale-down']
    for (const fit of fits) {
      const wrapper = mount(Avatar, {
        props: { fit, src: IMAGE_SUCCESS },
      })
      expect(wrapper.find('img').attributes('style')).toContain(`object-fit: ${fit};`)
    }
  })
})

