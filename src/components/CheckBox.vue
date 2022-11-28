<script setup lang="ts">
import { useVModel } from '@vueuse/core'

const props = defineProps<{
  text: string
  enabled: boolean
}>()

const emit = defineEmits(['update:enabled'])
const isEnabled = useVModel(props, 'enabled', emit)
</script>

<template>
  <div class="flex items-center mb-4">
    <input
      id="checkbox-1"
      v-model="isEnabled"
      aria-describedby="checkbox-1"
      type="checkbox"
      class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
    >
    <label for="checkbox-1" class="ml-3 text-sm font-medium text-gray-900">
      {{ text }}
    </label>
  </div>
</template>
