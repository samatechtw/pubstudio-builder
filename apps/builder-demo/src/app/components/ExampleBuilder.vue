<template>
  <div class="example-builder">
    <h2>PubStudio Builder Library Example Usage</h2>
    <div class="info">
      <p>
        This is an example of how <span>@pubstudio/builder</span> can be used to set up a
        custom WYSIWYG editor
      </p>
      <p>The public API is a work in progress, and not yet ready for production use.</p>
      <p>The builder comes with:</p>
      <ul>
        <li>A WYSIWYG drag and drop editor for placing components and editing text.</li>
        <li>Menus for creating components, styles, and theme.</li>
        <li>Component tree view</li>
        <li>Style editing toolbar</li>
        <li>Component detail view</li>
      </ul>
      <p>
        Click <span class="preview" @click="emit('showPreview')">here</span> for a full
        screen preview
      </p>
      <p>This checkbox toggles the component tree.</p>
      <div class="checks">
        <Checkbox
          :item="{ label: 'Component Tree', checked: showTree }"
          @checked="showTree = !showTree"
        />
      </div>
      <p>
        In this example, the menus and component detail view are disabled. The buttons can
        be used to create custom components:
      </p>
      <div class="buttons">
        <PSButton text="Container" @click="createContainer" />
        <PSButton text="Text" @click="createText" />
        <PSButton text="Divider" @click="createDivider" />
      </div>
    </div>
    <!--
      TODO -- figure out how to include without enabling i18n
    <StyleToolbar :hideSettings="true" />
    -->
    <div class="build">
      <BuildContent />
      <ComponentTree v-if="showTree" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Checkbox, PSButton } from '@pubstudio/frontend/ui-widgets'
import { BuildContent, ComponentTree, useBuild } from '@pubstudio/frontend/feature-build'
import { useBuildEvent } from '@pubstudio/frontend/feature-build-event'

const emit = defineEmits<{
  (e: 'showPreview'): void
}>()

const { addComponent } = useBuild()
useBuildEvent()

const showTree = ref(false)

const createContainer = () => {
  addComponent({
    name: 'Container',
    content: '',
    style: {
      custom: {
        default: {
          width: '100%',
          'min-height': '120px',
          'background-color': '#AEDCFF',
        },
      },
    },
  })
}

const createText = () => {
  addComponent({
    name: 'Some text...',
    style: {
      custom: {
        default: {
          width: '100%',
          padding: '6px 0',
          color: '#333',
          'font-family': "'Courier New', monospace",
          'font-size': '17px',
        },
      },
    },
  })
}

const createDivider = () => {
  addComponent({
    name: 'Divider',
    content: '',
    style: {
      custom: {
        default: {
          width: '90%',
          margin: '16px auto',
          height: '1px',
          'background-color': '#aaa',
        },
      },
    },
  })
}
</script>

<style lang="postcss" scoped>
.example-builder {
  color: black;
  padding: 64px 40px 32px 40px;
  font-family: 'Trebuchet MS', sans-serif;
  font-size: 15px;
  span {
    font-weight: bold;
  }
}
.build {
  display: flex;
  flex-direction: row;
}
.build {
}
.preview {
  cursor: pointer;
}
.buttons {
  margin-top: 12px;
  > div:not(:first-child) {
    margin-left: 8px;
  }
}
@media (max-width: 640px) {
  .example-builder {
    padding: 48px 24px;
  }
}
</style>
