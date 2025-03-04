import { on, off } from '@element-plus/utils/dom'
import { obtainAllFocusableElements, EVENT_CODE } from '@element-plus/utils/aria'

import type { ObjectDirective } from 'vue'

export const FOCUSABLE_CHILDREN = '_trap-focus-children'
export const TRAP_FOCUS_HANDLER = '_trap-focus-handler'

export interface ITrapFocusElement extends HTMLElement {
  [FOCUSABLE_CHILDREN]: HTMLElement[]
  [TRAP_FOCUS_HANDLER]: (e: KeyboardEvent) => void
}

const TrapFocus: ObjectDirective = {
  beforeMount(el: ITrapFocusElement) {
    el[FOCUSABLE_CHILDREN] = obtainAllFocusableElements(el)

    el[TRAP_FOCUS_HANDLER] = (e: KeyboardEvent) => {
      const focusableElement = el[FOCUSABLE_CHILDREN]
      if (focusableElement.length > 0 && e.code === EVENT_CODE.tab) {
        if (focusableElement.length === 1) {
          e.preventDefault()
          return
        }
        const goingBackward = e.shiftKey
        const isFirst = e.target === focusableElement[0]
        const isLast = e.target === focusableElement[focusableElement.length - 1]
        if (isFirst && goingBackward) {
          e.preventDefault()
          focusableElement[focusableElement.length - 1].focus()
        }
        if (isLast && !goingBackward) {
          e.preventDefault()
          focusableElement[0].focus()
        }

        // the is critical since jsdom did not implement user actions, you can only mock it
        // DELETE ME: when testing env switches to puppeteer
        if (process.env.NODE_ENV === 'test') {

          const index = focusableElement.findIndex(element => element === e.target)
          if (index !== -1) {
            focusableElement[goingBackward ? index - 1 : index + 1]?.focus()
          }
        }
      }
    }
    on(document, 'keydown', el[TRAP_FOCUS_HANDLER])
  },
  updated(el: ITrapFocusElement) {
    el[FOCUSABLE_CHILDREN] = obtainAllFocusableElements(el)
  },
  unmounted(el: ITrapFocusElement) {
    off(document, 'keydown', el[TRAP_FOCUS_HANDLER])
  },
}

export default TrapFocus
