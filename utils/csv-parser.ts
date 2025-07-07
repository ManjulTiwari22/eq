export async function fetchCSVData(url: string) {
  try {
    const response = await fetch(url)
    const csvText = await response.text()

    // Parse CSV manually
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())

    const data = lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => {
        const values = []
        let current = ""
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === "," && !inQuotes) {
            values.push(current.trim())
            current = ""
          } else {
            current += char
          }
        }
        values.push(current.trim())

        const row: Record<string, string> = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })
        return row
      })

    return { headers, data }
  } catch (error) {
    console.error("Error fetching CSV:", error)
    return { headers: [], data: [] }
  }
}

export function getUniqueValues(data: any[], field: string): string[] {
  const values = data
    .map((row) => row[field])
    .filter((value) => value && value.trim() !== "")
    .map((value) => value.replace(/"/g, "").trim())

  return [...new Set(values)].sort()
}
