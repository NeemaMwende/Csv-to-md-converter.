import Papa from 'papaparse'

export default {
  parseCSV(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${results.errors[0].message}`))
            return
          }
          resolve(results.data)
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`))
        },
      })
    })
  },
}
