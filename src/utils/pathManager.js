import path from 'path'

export const itemPathBuilder = (filename, itemPath) => {
  try {
    const buildPath = itemPath + '/' + filename
    const absPath = path.resolve(buildPath)
    return absPath
  } catch (err) {
    console.error(err)
    return false
  }
}
