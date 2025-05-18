<template>
  <div class="new-menu">
    <div class="new-left">
      <NewComponent
        class="new-container-horizontal"
        :text="t('build.container_h')"
        :builtinComponentId="containerHorizontal.id"
      />
      <NewComponent
        class="new-container-vertical"
        :text="t('build.container_v')"
        :builtinComponentId="containerVertical.id"
      />
      <NewComponent
        class="new-grid"
        :text="t('build.grid')"
        :builtinComponentId="grid.id"
      />
      <NewComponent
        class="new-image"
        :text="t('build.image')"
        :builtinComponentId="image.id"
      />
      <NewComponent
        class="new-video"
        :text="t('build.video')"
        :builtinComponentId="video.id"
      />
      <NewComponent
        class="new-captioned-image"
        :text="t('build.captioned_image')"
        :builtinComponentId="captionedImage.id"
      />
      <NewComponent
        class="new-background-image"
        :text="t('build.background_image')"
        :builtinComponentId="backgroundImage.id"
      />
      <NewComponent class="new-svg" :text="t('build.svg')" :builtinComponentId="svg.id" />
      <NewComponent
        class="new-link"
        :text="t('build.link')"
        :builtinComponentId="link.id"
      />
      <NewComponent
        class="new-button"
        :text="t('build.button')"
        :builtinComponentId="button.id"
      />
      <NewComponent
        class="new-nav-menu"
        :text="t('build.nav_menu')"
        :builtinComponentId="navMenu.id"
      />
      <NewComponent class="new-ul" :text="t('build.ul')" :builtinComponentId="ul.id" />
      <NewComponent
        class="new-header"
        :text="t('build.header')"
        :builtinComponentId="header.id"
      />
      <NewComponent
        class="new-footer"
        :text="t('build.footer')"
        :builtinComponentId="footer.id"
      />
      <NewComponent
        class="new-divider-horizontal"
        :text="t('build.divider_horizontal')"
        :builtinComponentId="dividerHorizontal.id"
      />
      <NewComponent
        v-if="isSiteApi"
        class="new-view-counter"
        :text="t('build.view_counter')"
        :builtinComponentId="viewCounter.id"
      />
      <NewComponent
        v-if="showLanguageSelect"
        class="new-language-select"
        :text="t('build.lang_select')"
        builtinComponentId=""
        :skipAdd="true"
        @add="addLanguageSelect(site)"
      />
    </div>
    <div class="new-right">
      <NewComponent
        class="new-text"
        :text="t('build.text')"
        :builtinComponentId="text.id"
      />
      <NewComponent class="new-h1" :text="t('build.h1')" :builtinComponentId="h1.id" />
      <NewComponent class="new-h2" :text="t('build.h2')" :builtinComponentId="h2.id" />
      <NewComponent class="new-h3" :text="t('build.h3')" :builtinComponentId="h3.id" />
      <NewComponent class="new-h4" :text="t('build.h4')" :builtinComponentId="h4.id" />
      <NewComponent class="new-h5" :text="t('build.h5')" :builtinComponentId="h5.id" />
      <NewComponent class="new-h6" :text="t('build.h6')" :builtinComponentId="h6.id" />
      <NewComponent class="new-ol" :text="t('build.ol')" :builtinComponentId="ol.id" />
      <NewComponent
        class="new-input"
        :text="t('build.input')"
        :builtinComponentId="input.id"
      />
      <NewComponent
        class="new-textarea"
        :text="t('build.textarea')"
        :builtinComponentId="textarea.id"
      />
      <NewComponent
        class="new-label"
        :text="t('build.label')"
        :builtinComponentId="label.id"
      />
      <NewComponent
        class="new-divider-vertical"
        :text="t('build.divider_vertical')"
        :builtinComponentId="dividerVertical.id"
      />
      <NewComponent
        class="new-image-gallery"
        :text="t('build.image_gallery')"
        :builtinComponentId="imageGallery.id"
      />
      <NewComponent
        class="new-lightbox-gallery"
        :text="t('build.lightbox_gallery')"
        builtinComponentId=""
        :skipAdd="true"
        @add="addLightboxGallery(site)"
      />
      <NewComponent
        v-if="isSiteApi"
        class="new-contact-form"
        :text="t('build.contact_form')"
        :builtinComponentId="contactForm.id"
        @add="showContactFormWalkthrough"
      />
      <NewComponent
        v-if="isSiteApi"
        class="new-mailing-list"
        :text="t('build.mailing_list')"
        :builtinComponentId="mailingList.id"
        @add="showMailingListWalkthrough"
      />
      <NewComponent
        v-if="store.user.isAdmin.value"
        class="new-vue"
        :text="t('build.vue')"
        :skipAdd="true"
        :builtinComponentId="vueComponent.id"
        @add="showVueComponentModal = true"
      />
    </div>
    <ContactFormWalkthroughModal />
    <MailingListWalkthroughModal />
    <VueComponentModal />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  containerHorizontal,
  containerVertical,
  text,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  image,
  captionedImage,
  ol,
  ul,
  link,
  navMenu,
  button,
  header,
  footer,
  input,
  textarea,
  svg,
  dividerVertical,
  dividerHorizontal,
  contactForm,
  mailingList,
  backgroundImage,
  viewCounter,
  vueComponent,
  label,
  grid,
  imageGallery,
  video,
} from '@pubstudio/frontend/util-builtin'
import {
  ContactFormWalkthroughModal,
  useContactForm,
} from '@pubstudio/frontend/feature-contact-form'
import {
  MailingListWalkthroughModal,
  useMailingListForm,
} from '@pubstudio/frontend/feature-mailing-list-form'
import {
  useVueComponent,
  VueComponentModal,
} from '@pubstudio/frontend/feature-vue-component'
import NewComponent from './NewComponent.vue'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { addLanguageSelect, addLightboxGallery } from '@pubstudio/frontend/feature-build'

const { t } = useI18n()
const { showContactFormWalkthrough } = useContactForm()
const { showMailingListWalkthrough } = useMailingListForm()
const { showVueComponentModal } = useVueComponent()
const { isSiteApi, site } = useSiteSource()

const showLanguageSelect = computed(() => {
  return Object.keys(site.value.context.i18n).length > 1
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.new-menu {
  @mixin flex-row;
  height: 100%;
  width: $left-menu-width;
  padding-top: 12px;
  background-color: $blue-100;
}
.new-left,
.new-right {
  @mixin flex-col;
  overflow: visible;
  width: 50%;
  border-top: 1px solid $border1;
}
.new-left {
  :deep(.new-component) {
    border-right: 1px solid $border1;
    border-bottom: 1px solid $border1;
  }
}
.new-right {
  :deep(.new-component) {
    margin-left: -1px;
    border-bottom: 1px solid $border1;
    border-left: 1px solid $border1;
  }
}
</style>
