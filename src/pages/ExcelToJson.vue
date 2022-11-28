<script lang="ts" setup>
import { v4 as uuidv4 } from 'uuid'
import type { WorkBook, WorkSheet } from 'xlsx'
import { read, utils } from 'xlsx'
import { computed, ref } from 'vue'
import Loading from 'vue-loading-overlay'
import CheckBox from '../components/CheckBox.vue'
import { defaultLangItemList } from '../const/default'
import 'vue-loading-overlay/dist/css/index.css'

let directoryHandle: FileSystemDirectoryHandle | null
const isLoading = ref(false)
const outputJsonData = ref()
const chooseFileName = ref('')
const outputFolderPath = ref('')
const langList = ref([...defaultLangItemList])
const currentXlxsWorkBook = ref<WorkBook>()
const convertSetting = ref({
  updateI18nFile: false,
})
const isLangTableComplete = computed(() => langList.value.every(item => item.folderName && item.langKey))

function addLang() {
  langList.value.push({
    langKey: '',
    folderName: '',
    id: uuidv4(),
  })
}

function removeLangItem(id: string) {
  langList.value = langList.value.filter(item => item.id !== id)
}

function transLangKeyToFolderName(langKey: string) {
  const langItem = langList.value.find(item => item.langKey === langKey)
  if (!langItem)
    return null

  return langItem.folderName
}

async function openFile() {
  try {
    const [fileHandler] = await window.showOpenFilePicker()

    const file = await fileHandler.getFile()
    const data = await file.arrayBuffer()
    const wb = read(data)

    if (wb.bookType !== 'xlsx')
      return alert('this file is not xlsx!! please select xlsx format file')

    const canParse = checkSheetsHaveKeyField(wb)
    if (!canParse)
      return

    currentXlxsWorkBook.value = wb
    chooseFileName.value = fileHandler.name
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

async function convert() {
  if (!chooseFileName.value)
    return alert('required select file')

  if (!isLangTableComplete.value)
    return alert('please finish lang folder table')

  if (!outputFolderPath.value)
    return alert('required target folder')

  isLoading.value = true
  await parse()
  isLoading.value = false
}

/**
 * 根據給定的langList產出如下格式obj
 * {
 *  'en': {},
 *  'zh-tw': {},
 *  'hi-in': {}
 * }
 */
function generateLangObj() {
  return langList.value.reduce((prev, curr) => {
    prev[curr.folderName] = {}
    return prev
  }, {} as Record<string, Record<string, string>>)
}

async function parse(wb = currentXlxsWorkBook.value) {
  if (!wb)
    return

  try {
    for (const sheetName of wb.SheetNames) {
      const sheet = wb.Sheets[sheetName]
      const langObj = combineSheetToLangObj(sheet)

      for (const [langKeyOfFolderName, singleLangJson] of Object.entries(langObj)) {
        // #NOTICE 迴圈內處理單個lang

        /** 某語系的資料夾處理者 */
        const langDirectoryHandler = await directoryHandle?.getDirectoryHandle(langKeyOfFolderName, {
          create: true,
        })

        const currentSheetFileHandle = await langDirectoryHandler?.getFileHandle(`${sheetName}.json`, {
          create: true,
        })

        const originalFile = await currentSheetFileHandle?.getFile()
        if (originalFile?.type !== 'application/json')
          throw new Error('updated file should be json format!!')

        const originalString = await originalFile?.text()
        const originalJson = originalString
          ? JSON.parse(originalString)
          : {}

        const updatedJson = {
          ...originalJson,
          ...singleLangJson,
        }

        const writable = await currentSheetFileHandle?.createWritable()
        await writable?.write(JSON.stringify(updatedJson, null, 2))
        await writable?.close()
      }
    }
    alert('success!!')
  }
  catch (error) {
    alert((error as Error).message)
  }
}

/**
 * 轉換單個sheet成一個json obj。格式如下
 *
 * {
 *    bn: { GraphSetup: "গ্রাফ সেটআপ", Notice: "নোটিশ" },
 *    en: { GraphSetup: "Graph Setup", Notice: "Notice" },
 *    ...
 * }
 */
function combineSheetToLangObj(sheet: WorkSheet) {
  const langObj = generateLangObj()
  const json = utils.sheet_to_json(sheet) as Array<Record<string, string>>

  // rowData表示單行資料, e.g. { Key: 'Horse', EN: 'Horse', Hindi: 'हॉर्स रेसिंग' }
  for (const rowData of json)
    pushRowDataToLangObj(rowData, langObj)

  return langObj
}

function generateRowKeyByWithEn(rowData: Record<string, string>) {
  for (const [key, value] of Object.entries(rowData)) {
    if (key.toLowerCase().includes('en'))
      // 清除所有非英文或數字的符號
      return value.replace(/\s+/g, '').replace(/[^0-9a-zA-Z]/g, '')

    const isEnglishWord = value.replace(/\s+/g, '').match(/^([a-zA-Z])+$/)
    if (isEnglishWord)
      return value.replace(/\s+/g, '').replace(/[^0-9a-zA-Z]/g, '')
  }
  // 如果都抓不到key，就隨機生成亂碼來填key
  return uuidv4()
}

function pushRowDataToLangObj(rowData: Record<string, string>, langObj: Record<string, Record<string, string>>) {
  /** 當前翻譯的key */
  const currentRowKey = getKeyByRowData(rowData) || generateRowKeyByWithEn(rowData)

  Object.entries(rowData).forEach(([key, value]) => {
    if (key.toLowerCase().includes('key'))
      return

    const folderName = transLangKeyToFolderName(key)
    if (!folderName)
      throw new Error(`不正確的語系名稱${key}`)

    if (langObj[folderName!][currentRowKey!])
      console.warn(`有存在的key: ${currentRowKey}`)

    langObj[folderName!][currentRowKey!] = value
  })
}

/** 取得當前翻譯行的對應Key */
function getKeyByRowData(rowData: Record<string, string>) {
  const index = Object.keys(rowData).findIndex(item => item.toLowerCase().includes('key'))
  if (index === -1)
    return null

  return Object.values(rowData)[index]
}

async function openDirectory() {
  directoryHandle = await window.showDirectoryPicker()
  outputFolderPath.value = directoryHandle.name
}
</script>

<template>
  <Loading
    v-model:active="isLoading"
    :is-full-page="true"
  />
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

    <!-- add lang folder -->
    <h4 class="mt-8 mb-2 text-2xl">
      Add Lang Folder
    </h4>
    <div class="pl-4 mb-3 border-l-2 border-black bg-slate-100">
      程序會使用以下輸入的語系去做轉換
    </div>
    <table class="w-full border-2 border-separate border-black rounded-lg">
      <tr class="divide-x-2 divide-black bg-emerald-300">
        <th class="py-3 border-b-2 border-black" style="width: 40%">
          Lang Key In Sheet
        </th>
        <th class="py-3 border-b-2 border-black">
          output folder name
        </th>
        <th class="py-3 bg-red-300 border-b-2 border-black">
          delete
        </th>
      </tr>
      <template v-if="langList.length">
        <tr
          v-for="lang in langList"
          :key="lang.id"
          class="text-center divide-x-2 divide-black"
        >
          <td class="py-3 border-b-2 border-black">
            <input
              v-model="lang.langKey"
              type="text"
              class="w-full px-4 outline-none"
              placeholder="Hindi"
            >
          </td>
          <td class="py-3 border-b-2 border-black">
            <input
              v-model="lang.folderName"
              type="text"
              class="w-full px-4 outline-none"
              placeholder="hi-in"
            >
          </td>
          <td class="py-3 text-xl border-b-2 border-black">
            <button class=" text-slate-500 hover:text-slate-800 active:text-slate-900" @click="removeLangItem(lang.id)">
              X
            </button>
          </td>
        </tr>
      </template>
      <template v-else>
        <tr class="text-center divide-x-2 divide-black">
          <td colspan="3" class="py-8 font-bold ">
            no data
          </td>
        </tr>
      </template>
      <tfoot class="w-full">
        <tr>
          <td colspan="3">
            <button
              class="block w-full py-2 text-lg font-bold border-2 border-black rounded-lg bg-lime-300 active:bg-lime-500 hover:bg-lime-400"
              @click="addLang"
            >
              add
            </button>
          </td>
        </tr>
      </tfoot>
    </table>

    <!-- select target folder -->
    <h4 class="mt-8 mb-2 text-2xl">
      Output I18n folder
    </h4>
    <div class="pl-4 mb-3 border-l-2 border-black bg-slate-100">
      output file will export to this folder
    </div>
    <div class="flex mb-8">
      <button
        class="inline-block p-4 font-mono text-sm font-bold text-gray-900 border-2 border-black rounded-l-lg cursor-pointer focus:outline-none bg-slate-300 hover:bg-slate-700 hover:text-white"
        type="button"
        @click="openDirectory"
      >
        folder path
      </button>
      <div class="flex items-center flex-1 px-4 border-2 border-l-0 border-black rounded-r-lg">
        {{ outputFolderPath }}
      </div>
    </div>

    <!-- convert setting -->
    <h4 class="mt-8 mb-2 text-2xl">
      Convert Setting
    </h4>
    <div class="pl-4 mb-3 border-l-2 border-black bg-slate-100">
      Determine output results based on convert settings
    </div>
    <div class="p-4 mb-8 font-mono text-sm font-bold text-gray-900 border-2 border-black rounded-l-lg cursor-pointerbg-slate-300">
      <CheckBox
        v-model:enabled="convertSetting.updateI18nFile"
        text="update to exist i18n file"
      />
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
