<script setup lang="ts">
import { ref } from 'vue'
import Layout from './layout/Layout.vue'
import SelectorTabs from './components/SelectorTabs.vue'
import { TransformModeList } from './const/default'

const mode = ref<Mode>(TransformModeList[0])
</script>

<template>
  <Layout>
    <section class="mb-8">
      <h4 class="mb-2 text-2xl">
        Choose Mode
      </h4>
      <div class="pl-4 mb-3 border-l-2 border-black bg-slate-100">
        <span class="font-bold ">jsonToExcel</span>  : trans all language json files to single xlsx file <br>
        <span class="font-bold ">excelToJson</span> : trans single xlsx file to all language json files
        <span class="font-bold ">autoKeyInExcel</span> : 為excel翻譯檔遺漏的key自動補上key
      </div>
      <SelectorTabs
        v-model:tabs="mode"
        :tab-list="TransformModeList"
        :with-route="true"
      />
    </section>
    <router-view />
  </Layout>
</template>
