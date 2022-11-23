<script setup lang="ts">
import { read, utils } from 'xlsx'
import { saveAs } from 'file-saver'
import { ref } from 'vue'

interface President {
  Name: string
  Index: number
}

const outputJsonData = ref()

async function handleChange(e: Event) {
  const target = e.target! as HTMLInputElement
  const fileList = target.files
  if (!fileList)
    return

  const source = await fileList[0].arrayBuffer()

  /* parse and load first worksheet */
  const wb = read(source)
  const data = utils.sheet_to_json<President>(wb.Sheets[wb.SheetNames[0]])
  outputJsonData.value = data
}

function exportJsonFile() {
  const fileName = 'myData.json'

  // Create a blob of the data
  const fileToSave = new Blob([JSON.stringify(outputJsonData.value)], {
    type: 'application/json',
  })

  // Save the file
  saveAs(fileToSave, fileName)
}
</script>

<template>
  <input type="file" @change="handleChange">
  <button @click="exportJsonFile">
    輸出成json
  </button>
</template>
