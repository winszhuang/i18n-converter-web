<script lang="ts" setup>
import type { WorkBook } from 'xlsx'
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

async function openFile() {
  try {
    const [fileHandler] = await window.showOpenFilePicker()

    const file = await fileHandler.getFile()
    const data = await file.arrayBuffer()
    const wb = read(data)

    if (wb.bookType !== 'xlsx')
      return alert('this file is not xlsx!! please select xlsx format file')

    chooseFileName.value = fileHandler.name
    const canParse = checkSheetsHaveKeyField(wb)
    if (!canParse)
      return
  }
  catch (error) {
    console.error((error as Error).message)
  }
}

function checkSheetsHaveKeyField(workBook: WorkBook) {
  const missKeySheetNames = []

  for (let a = 0; a < Object.values(workBook.Sheets).length; a++) {
    const sheet = Object.values(workBook.Sheets)[a]
    /** e.g. [A1, A2, A3, B1, B2, B3, C1, C2] */
    const positionList = Object.keys(sheet)
    /** e.g. [A1, B1, C1, D1] */
    const headList = positionList.filter(position => position.match(/^[a-zA-Z]1$/))
    const hasKey = headList.find((head) => {
      return (sheet[head].v as string).trim().toLowerCase() === 'key'
    })

    if (!hasKey) {
      const currentSheetName = workBook.SheetNames[a]
      missKeySheetNames.push(currentSheetName)
    }
  }

  if (missKeySheetNames.length) {
    const message = missKeySheetNames.reduce((prev, curr) => {
      prev += `${curr}\n`
      return prev
    }, 'those sheet doesn\'t have key on header: \n-------------\n')
    alert(message)
    return false
  }

  return true
}

function checkSheetsHaveAllLang(workBook: WorkBook) {

}

function convert() {
  if (!chooseFileName.value || !outputFolderPath.value) {
    alert('required select file and target folder')
    return
  }

  console.log('convert ite')
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
        @click="openFile"
      >
        select file
      </button>
      <div class="flex items-center flex-1 px-4 border-2 border-l-0 border-black rounded-r-lg">
        {{ chooseFileName }}
      </div>
    </div>

    <!-- select target folder -->
    <h4 class="mt-8 mb-2 text-2xl">
      Output folder
    </h4>
    <div class="pl-4 mb-3 border-l-2 border-black bg-slate-100">
      output file will export to this folder
    </div>
    <div class="flex mb-8">
      <button
        class="inline-block p-4 font-mono text-sm font-bold text-gray-900 border-2 border-black rounded-l-lg cursor-pointer focus:outline-none bg-slate-300 hover:bg-slate-700 hover:text-white"
        type="button"
        @click="handleDirectory"
      >
        folder path
      </button>
      <div class="flex items-center flex-1 px-4 border-2 border-l-0 border-black rounded-r-lg">
        {{ outputFolderPath }}
      </div>
    </div>
    <button
      class="block w-full py-4 text-xl font-bold bg-orange-300 border-2 border-black rounded-lg active:bg-orange-500 hover:bg-orange-400"
      @click="convert"
    >
      convert
    </button>
    <!-- // 後續看要不要補錯誤訊息
    <div class="absolute mt-1 ml-2 text-red-500" /> -->
  </section>
</template>
