<template>
  <div class="data-table-nav">
    <div class="rows-per-page">
      <span class="rows-per-page-label">
        {{ t('table.rows_per_page') }}
      </span>
      <select class="rows-per-page-select" :value="pageSize" @change="selectPageSize">
        <option v-for="size in pageSizeOptions" :key="size" :value="size">
          {{ size }}
        </option>
      </select>
    </div>
    <div class="paging-info">
      <div class="paging-info-label">
        <span class="paging-info-range">
          {{ t('table.paging_info_range', { offset, limit }) }}
        </span>
        <span class="paging-info-total">
          {{ t('table.paging_info_total', { total }) }}
        </span>
      </div>
      <Caret
        class="paging-info-go-prev-page-button"
        :color="atFirstPage ? '#d7d7db' : undefined"
        :disabled="atFirstPage"
        @click="prevPage"
      />
      <Caret
        class="paging-info-go-next-page-button"
        :color="atLastPage ? '#d7d7db' : undefined"
        :disabled="atLastPage"
        @click="nextPage"
      />
    </div>
    <div class="jump-to-page">
      <span class="jump-to-page-label">
        {{ t('table.jump_to_page') }}
      </span>
      <select class="jump-to-page-select" :value="page" @change="selectPage">
        <option v-for="n in maxPage" :key="n">
          {{ n }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { Caret } from '@pubstudio/frontend/ui-widgets'
import { AdminTablePageSize } from '@pubstudio/frontend/util-fields'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'setPage', value: number): void
  (e: 'setPageSize', value: AdminTablePageSize): void
}>()
const props = withDefaults(
  defineProps<{
    page?: number
    maxPage?: number
    pageSize?: AdminTablePageSize
    pageSizeOptions?: Array<AdminTablePageSize>
    offset?: number
    total?: number
  }>(),
  {
    page: 1,
    maxPage: 1,
    pageSize: 50,
    pageSizeOptions: () => [25, 50, 100],
    offset: 0,
    total: 1,
  },
)
const { page, maxPage, pageSize, total } = toRefs(props)

const atFirstPage = computed(() => {
  return page.value <= 1
})

const atLastPage = computed(() => {
  return page.value >= maxPage.value
})

const prevPage = () => {
  if (page.value > 1) {
    emit('setPage', page.value - 1)
  }
}
const nextPage = () => {
  if (page.value < maxPage.value) {
    emit('setPage', page.value + 1)
  }
}
const selectPageSize = (event: Event) => {
  const elem = event?.target as HTMLInputElement
  emit('setPageSize', Number(elem.value) as AdminTablePageSize)
}
const selectPage = (event: Event) => {
  const elem = event?.target as HTMLInputElement
  emit('setPage', Number(elem.value))
}
// Index of last displayed item
const limit = computed(() => {
  const lim = page.value * pageSize.value
  return total.value >= lim ? lim : total.value
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.data-table-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  min-height: 66px;
  background-color: white;
  border-top: 1px solid $grey-100;
  .rows-per-page {
    display: flex;
    align-items: center;
    .rows-per-page-label {
      @mixin caption;
      margin-right: 24px;
    }
    .rows-per-page-select {
      padding: 4px 8px;
      border-color: $grey-200;
    }
  }
  .paging-info {
    @mixin caption;
    display: flex;
    align-items: center;
    .paging-info-range {
      color: $color-primary;
    }
    .paging-info-total {
      color: $color-disabled;
    }
    .paging-info-go-prev-page-button {
      margin-left: 24px;
      transform: rotate(90deg);
      cursor: pointer;
      &[disabled='true'] {
        cursor: default;
      }
    }
    .paging-info-go-next-page-button {
      margin-left: 24px;
      transform: rotate(-90deg);
      cursor: pointer;
      &[disabled='true'] {
        cursor: default;
      }
    }
  }
  .jump-to-page {
    display: flex;
    align-items: center;
    .jump-to-page-label {
      @mixin caption;
      margin-right: 24px;
    }
    .jump-to-page-select {
      padding: 4px 8px;
      border-color: $grey-200;
    }
  }
}
</style>
