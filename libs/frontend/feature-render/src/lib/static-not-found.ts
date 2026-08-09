import { defineComponent, h } from 'vue'

// Plain-TS not-found component for static rendering and hydration. Sites
// normally provide a /not-found page; this only renders on client-side
// navigation to an unknown route. Kept SFC-free so the SSG CLI (esno) and the
// hydration runtime (no CSS extraction) can use it.
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
          'font-size': '20px',
        },
      },
      'Page not found',
    )
  },
})
