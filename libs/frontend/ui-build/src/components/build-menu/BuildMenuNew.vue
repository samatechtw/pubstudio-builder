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
        class="new-image"
        :text="t('build.image')"
        :builtinComponentId="image.id"
      />
      <NewComponent
        class="new-captioned-image"
        :text="t('build.captioned_image')"
        :builtinComponentId="captionedImage.id"
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
        class="new-divider-vertical"
        :text="t('build.divider_vertical')"
        :builtinComponentId="dividerVertical.id"
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
    </div>
    <ContactFormWalkthroughModal />
    <MailingListWalkthroughModal />
  </div>
</template>

<script lang="ts" setup>
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
} from '@pubstudio/frontend/util-builtin'
import {
  ContactFormWalkthroughModal,
  useContactForm,
} from '@pubstudio/frontend/feature-contact-form'
import {
  MailingListWalkthroughModal,
  useMailingListForm,
} from '@pubstudio/frontend/feature-mailing-list-form'
import NewComponent from './NewComponent.vue'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'

const { t } = useI18n()
const { showContactFormWalkthrough } = useContactForm()
const { showMailingListWalkthrough } = useMailingListForm()
const { isSiteApi } = useSiteSource()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.new-menu {
  @mixin flex-row;
  height: 100%;
  width: 200px;
  padding-top: 12px;
  background-color: $blue-100;
  overflow: auto;
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
