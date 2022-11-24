import { v4 as uuidv4 } from 'uuid'
import { TransformModeEnum } from '../enums/mode.enum'

export const TransformModeList = [
  {
    key: 'jsonToExcel',
    value: TransformModeEnum.jsonToExcel,
  },
  {
    key: 'excelToJson',
    value: TransformModeEnum.excelToJson,
  },
]

export const defaultLangItemList = [
  {
    langKey: 'Bangla',
    folderName: 'bn',
    id: uuidv4(),
  },
  {
    langKey: 'EN',
    folderName: 'en',
    id: uuidv4(),
  },
  {
    langKey: 'Hindi',
    folderName: 'hi-in',
    id: uuidv4(),
  },
  {
    langKey: 'Tamil',
    folderName: 'ml',
    id: uuidv4(),
  },
  {
    langKey: 'Urdu',
    folderName: 'ur-in',
    id: uuidv4(),
  },
]
