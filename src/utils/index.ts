/**
 * @example
 * const langObj = {
    en: {
      test: '123',
      common: {
        mark: 'mark',
        menu: 'menu',
      },
    },
  }

  const currentKey = 'common.mark.large.mark'
  const currentValue = 'Hello'

  const result = updateObj(langObj.en, currentKey, currentValue)
  console.log(result)

  // output
  {
    "test": "123",
    "common": {
      "mark": {
        "large": {
          "mark": "Hello"
        }
      },
      "menu": "menu"
    }
  }
 */
export function updateObj(obj: Record<string, any>, key: string, value: string) {
  obj = JSON.parse(JSON.stringify(obj))
  if (key.includes('.')) {
    const keyList = key.split('.')
    let currentObj = obj
    let count = 0
    while (count < keyList.length) {
      const currentKey = keyList[count]
      if (count === keyList.length - 1) {
        currentObj[currentKey] = value
        break
      }
      if (typeof currentObj[currentKey] !== 'object')
        currentObj[currentKey] = {} as Record<string, any>

      count++
      currentObj = currentObj[currentKey]
    }
  }
  else {
    obj[key] = value
  }
  return obj
}
