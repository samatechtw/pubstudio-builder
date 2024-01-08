import { useBuild } from '@pubstudio/frontend/feature-build'
import { Plus } from '@pubstudio/frontend/ui-widgets'
import { makeListItem } from '@pubstudio/frontend/util-builtin'
import { defineComponent, h } from 'vue'

export const ListAdd = defineComponent({
  name: 'ListAdd',
  props: {
    componentId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { addComponent } = useBuild()
    const componentId = props.componentId
    const onClick = () => {
      addComponent({ ...makeListItem('Item text'), parentId: componentId })
    }

    return () => {
      return h('div', { class: '__list-add', onClick }, [h(Plus)])
    }
  },
})
