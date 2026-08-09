import { defineComponent, h } from 'vue'

// not-found component fallback for static rendering and hydration.
export const StaticNotFound = defineComponent({
  name: 'StaticNotFound',
  render() {
    return h(
      'div',
      {
        style: {
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          padding: '40px 16px',
          'font-family': 'Helvetica, sans-serif',
          'font-size': '24px',
        },
      },
      'Page not found',
    )
  },
})
