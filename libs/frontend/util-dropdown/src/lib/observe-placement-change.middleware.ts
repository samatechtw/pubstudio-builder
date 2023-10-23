import { Middleware, Placement } from '@floating-ui/vue'
import { Ref } from 'vue'

export interface IObservePlacementChangeOptions {
  currentPlacement: Ref<Placement>
  onChange: (placement: Placement) => void
}

export const observePlacementChange = (
  options: IObservePlacementChangeOptions,
): Middleware => {
  const { currentPlacement, onChange } = options

  // Using composables in a middleware is not recommended because
  // a middleware function is being called within every render.

  return {
    name: 'observePlacementChange',
    fn: (state) => {
      const newPlacement = state.placement
      if (newPlacement !== currentPlacement.value) {
        onChange(newPlacement)
      }
      return {}
    },
  }
}
