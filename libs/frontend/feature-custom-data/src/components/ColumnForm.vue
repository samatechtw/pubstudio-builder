<template>
  <div class="column-info">
    <div class="column-info-left">
      <PSInput v-model="info.name" :placeholder="t('name')" class="col-name" />
      <PSInput v-model="info.default" :placeholder="t('default')" class="col-default" />
      <Minus v-if="showDelete" class="col-remove" @click="emit('remove')" />
    </div>
    <div class="column-info-right">
      <div class="col-check-wrap">
        <Checkbox
          :item="{
            label: t('required'),
            checked: !!info.validators.Required,
          }"
          @checked="toggleValidator('Required')"
        />
      </div>
      <div class="col-check-wrap">
        <Checkbox
          :item="{
            label: t('unique'),
            checked: !!info.validators.Unique,
          }"
          @checked="toggleValidator('Unique')"
        />
      </div>
      <div class="col-check-wrap">
        <Checkbox
          :item="{
            label: t('email'),
            checked: !!info.validators.Email,
          }"
          @checked="toggleValidator('Email')"
        />
      </div>
      <div class="col-input-wrap">
        <PSInput
          v-if="info.validators.MinLength"
          v-model="info.validators.MinLength.parameter"
          :clearable="true"
          :placeholder="t('custom_data.min_length')"
          type="number"
          @clear="toggleValidator('MinLength')"
        />
        <div v-else class="col-input-add" @click="toggleValidator('MinLength')">
          {{ `+ ${t('custom_data.min_length')}` }}
        </div>
      </div>
      <div class="col-input-wrap">
        <PSInput
          v-if="info.validators.MaxLength"
          v-model="info.validators.MaxLength.parameter"
          :clearable="true"
          :placeholder="t('custom_data.max_length')"
          type="number"
          @clear="toggleValidator('MaxLength')"
        />
        <div v-else class="col-input-add" @click="toggleValidator('MaxLength')">
          {{ `+ ${t('custom_data.max_length')}` }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { IEditTableColumn, IEditTableColumnRule } from '../lib/i-edit-column'
import { Checkbox, Minus, PSInput } from '@pubstudio/frontend/ui-widgets'
import { ICustomTableColumnRuleType } from '@pubstudio/shared/type-api-site-custom-data'
import { toRefs } from 'vue'

const props = defineProps<{
  info: IEditTableColumn
  showDelete: boolean
}>()
const { info } = toRefs(props)
const emit = defineEmits<{
  (e: 'toggleValidator', validator: IEditTableColumnRule): void
  (e: 'remove'): void
}>()

const { t } = useI18n()

const toggleValidator = (validator: ICustomTableColumnRuleType, param?: string) => {
  const edit = { rule_type: validator, parameter: param }
  if (info.value.validators[edit.rule_type]) {
    delete info.value.validators[edit.rule_type]
  } else {
    info.value.validators[edit.rule_type] = edit
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.column-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  margin-top: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid $grey-300;
}

.col-name {
  width: 100%;
}

.column-info-left {
  @mixin flex-col;
  width: 40%;
  align-items: center;
}
.column-info-right {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 60%;
  padding-left: 16px;
}

.checkbox {
  margin: 0 0 0 6px;
  .checkbox-text {
    font-size: 13px;
    font-weight: bold;
    padding-top: 0;
  }
}
.col-input-wrap {
  display: flex;
  align-items: center;
  width: calc(50% - 4px);
  height: 40px;
  margin-top: 12px;
  .ps-input-wrap .ps-input {
    height: 38px;
  }
}
.col-input-add {
  @mixin title-bold 13px;
  color: $blue-500;
  cursor: pointer;
}
.col-default {
  margin-top: 8px;
  width: 100%;
}
.col-remove {
  @mixin size 24px;
  cursor: pointer;
  margin-top: 6px;
}

.col-check-wrap {
  display: flex;
  align-items: center;
  flex-grow: 1;
}
</style>
