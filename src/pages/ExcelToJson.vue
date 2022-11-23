<script lang="ts" setup>
import { read, utils } from 'xlsx'
import { saveAs } from 'file-saver'
import { ref, vModelCheckbox } from 'vue'

interface President {
  Name: string
  Index: number
}

let directoryHandle: FileSystemDirectoryHandle | null
const outputJsonData = ref()
const inputFileRef = ref<HTMLElement>()
const path = ref('')
const chooseFileName = ref('')
const outputFolderPath = ref('')

async function handleFile() {
  const [fileHandler] = await window.showOpenFilePicker()
  chooseFileName.value = fileHandler.name

  const file = await fileHandler.getFile()
  const source = await file.text()
  // const workBook = read(source)
  // console.log(workBook)
  // console.log(source)

  // const target = e.target! as HTMLInputElement
  // const fileList = target.files
  // if (!fileList)
  //   return

  // chooseFileName.value = fileList[0].name

  // const source = await fileList[0].arrayBuffer()

  // /* parse and load first worksheet */
  // const wb = read(source)
  // const data = utils.sheet_to_json<President>(wb.Sheets[wb.SheetNames[0]])
  // outputJsonData.value = data
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

async function handleDirectory() {
  directoryHandle = await window.showDirectoryPicker()
  outputFolderPath.value = directoryHandle.name
}
</script>

<template>
  <section class="relative mb-8">
    <h4 class="mb-2 text-2xl">
      Choose Excel File
    </h4>
    <div class="pl-4 mb-3 border-l-2 border-black bg-slate-100">
      don't choose desktop
      or folder without files inside
    </div>
    <div class="flex">
      <button
        class="inline-block p-4 font-mono text-sm font-bold text-gray-900 border-2 border-black rounded-l-lg cursor-pointer focus:outline-none bg-slate-300 hover:bg-slate-700 hover:text-white"
        type="button"
        @click="handleFile"
      >
        select file
      </button>
      <div class="flex-1 px-4 border-2 border-l-0 border-black rounded-r-lg flex items-center">
        {{ chooseFileName }}
      </div>
    </div>

    <!-- select target folder -->
    <h4 class="mb-2 text-2xl mt-8">
      Output folder
    </h4>
    <div class="pl-4 mb-3 border-l-2 border-black bg-slate-100">
      output file will export to this folder
    </div>
    <div class="flex">
      <button
        class="inline-block p-4 font-mono text-sm font-bold text-gray-900 border-2 border-black rounded-l-lg cursor-pointer focus:outline-none bg-slate-300 hover:bg-slate-700 hover:text-white"
        type="button"
        @click="handleDirectory"
      >
        folder path
      </button>
      <div class="flex-1 px-4 border-2 border-l-0 border-black rounded-r-lg flex items-center">
        {{ chooseFileName }}
      </div>
    </div>
    <!-- // 後續看要不要補錯誤訊息
    <div class="absolute mt-1 ml-2 text-red-500" /> -->
  </section>
</template>
