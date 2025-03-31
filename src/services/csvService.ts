import Papa from 'papaparse'

/**
 * Service for parsing CSV files
 */
export default {
  /**
   * Parse a CSV file and return the data
   * @param {File} file - The CSV file to parse
   * @returns {Promise} - Promise that resolves to the parsed data
   */
  parseCSV(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        // This is the key fix - don't enforce a strict column count
        delimiter: ',',
        quoteChar: '"',
        escapeChar: '"',
        comments: false,
        fastMode: false,
        // Important: Add this to prevent field count checking
        transform: (value) => {
          return value.trim()
        },
        transformHeader: (header) => {
          return header.trim()
        },
        // Don't throw error on different field counts
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`))
        },
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            // Filter out field count errors and only reject if there are other errors
            const criticalErrors = results.errors.filter(
              (err) =>
                !err.message.includes('Too few fields') && !err.message.includes('Too many fields'),
            )

            if (criticalErrors.length > 0) {
              reject(new Error(`CSV parsing error: ${criticalErrors[0].message}`))
              return
            }
          }
          resolve(results.data)
        },
      })
    })
  },
}
