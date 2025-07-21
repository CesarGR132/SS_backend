import fs from 'fs'

export const getFileData = (path) => {
    const stats = fs.statSync(path)
    
    return {
        size: manageUnit(stats.size),
        type: getFileType(path),
        creationDate: stats.birthtime,
        owner: stats.uid
   }
}

export const getFileType = (path) => {
    const parts = path.split('.')
    const extension = parts[parts.length - 1]
    return extension
}

const manageUnit = (bytes) => {
    if (bytes < 1024) {
        return (bytes.toFixed(2)) + 'B'
    } else if (bytes < 1024 * 1024) {
        return ((bytes / 1024).toFixed(2)) + 'KB'
    } else if (bytes < 1024 * 1024 * 1024) {
        return ((bytes / (1024 * 1024)).toFixed(2)) + 'MB'
    } else if (bytes < 1024 * 1024 * 1024 * 1024) {
        return ((bytes / (1024 * 1024 * 1024)).toFixed(2)) + 'GB'
    }
}