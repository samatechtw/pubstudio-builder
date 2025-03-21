<template>
  <STInput
    ref="psInputRef"
    v-model="name"
    class="tree-item-rename"
    :data-tree-item-id="treeItemId"
    @focusout="updateName(UpdateNameEventSource.FocusOut)"
    @keyup="keyup"
  />
</template>

<script lang="ts">
enum UpdateNameEventSource {
  FocusOut,
  EnterPress,
}
</script>

<script lang="ts" setup>
import { onMounted, ref, toRefs } from 'vue'
import { STInput } from '@samatech/vue-components'
import { IComponent } from '@pubstudio/shared/type-site'
import { Keys } from '@pubstudio/shared/type-site'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { builderContext } from '@pubstudio/frontend/util-builder'

const props = defineProps<{
  component: IComponent
  treeItemId: string
}>()

const { component } = toRefs(props)

const { editComponent, editor } = useBuild()

const name = ref(component.value.name)

const psInputRef = ref()

const keyup = (e: KeyboardEvent) => {
  // This is for the keyup events when the input is focused.
  if (e.key === Keys.Escape) {
    // Cancel rename when escape is pressed.
    if (editor.value) {
      editor.value.componentTreeRenameData.renaming = false
    }
  } else if (e.key === Keys.Enter) {
    updateName(UpdateNameEventSource.EnterPress)
  }
}

const updateName = (eventSource: UpdateNameEventSource) => {
  // Pressing enter will emit the keyup event on STInput, which will turn the rename input back to
  // text after component name is updated. If the input is currently focused, that'll also cause the
  // focusout event on STInput to be emitted. Since we want to update component name in both focusout
  // and enter-press events, we have to do an extra check here to prevent updating component name twice
  // when the focusout event is triggered due to enter-press.
  if (
    eventSource === UpdateNameEventSource.FocusOut &&
    !editor.value?.componentTreeRenameData.renaming
  ) {
    // The component is not being renamed anymore when this function is trigged by focusout event.
    // This means there was rename event prior to this one, which is triggered by an enter press.
    // We don't have to do anything in this case.
    return
  } else if (eventSource === UpdateNameEventSource.EnterPress) {
    // Manually change `renaming` to false because no click event has happened in this case.
    if (editor.value) {
      editor.value.componentTreeRenameData.renaming = false
    }
  }
  if (name.value && component.value.name !== name.value) {
    // Only update component name when value is not empty & name is different.
    editComponent(component.value, {
      name: name.value,
    })
  }
}

onMounted(() => {
  // This is an alternative to the HTML `autofocus` attribute because `autofocus` only works once.
  // Input will not gain focus on any subsequent mount with the native `autofocus` attribute.
  psInputRef.value?.inputRef?.focus()
  psInputRef.value?.inputRef?.select()
})
</script>

<style lang="postcss" scoped>
.tree-item-rename {
  :deep(.st-input) {
    height: 24px;
  }
}
</style>
