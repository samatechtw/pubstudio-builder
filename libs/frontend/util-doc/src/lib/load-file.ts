export async function loadFile(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    const fileReader = new FileReader()
    fileReader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string)
      } else {
        resolve(undefined)
      }
    }
    fileReader.onerror = (error) => {
      console.log('FileReader error:', error)
      resolve(undefined)
    }
    fileReader.readAsText(file)
  })
}
