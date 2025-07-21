import { FileNode } from './storage.model.js'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'
import { getFileData } from '../utils/getMetadata.js'
import { itemPathBuilder } from '../utils/pathManager.js'

dotenv.config()

const configPath = path.resolve(process.env.CONFIG_JSON || '../config/config.json')
const storagePath = path.resolve(process.env.STORAGE_PATH || './Almacenamiento')
export class FileSystem {
  constructor () {
    this.root = new FileNode('root', true)
  }

  // Load the file tree from the local directory
  loadFromLocalPath () {
    if (!fs.existsSync(storagePath)) {
      throw new Error(`Path does not exist: ${storagePath}`)
    }
    this.root = this._buildTreeFromDirectory(storagePath)
  }

  // Recursively build the file tree from the local directory
  _buildTreeFromDirectory (localPath) {
    const stats = fs.statSync(localPath)
    if (stats.isDirectory()) {
      const dirNodePath = localPath + '/' + path.basename(localPath) + '/'
      const creationDate = new Date(stats.birthtime).toLocaleString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })
      const node = new FileNode(path.basename(localPath), true, dirNodePath, creationDate, stats.size)
      const items = fs.readdirSync(localPath)
      items.forEach(item => {
        const itemPath = path.join(localPath, item)
        const childNode = this._buildTreeFromDirectory(itemPath)
        node.addChild(childNode)
      })
      return node
    }
    let content = null
    let size = 0
    let type = ''
    let creationDate = ''
    let owner = ' '

    try {
      if (stats.size < 1024 * 1024) {
        content = fs.readFileSync(localPath, 'utf8') 
        const fileData = getFileData(localPath)
        size = fileData.size
        type = fileData.type
        creationDate = new Date(fileData.creationDate).toLocaleString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })
        owner = fileData.owner
      }
    } catch (err) {
      content = null
    }

    return new FileNode(path.basename(localPath), false, localPath, creationDate, size, type, owner)
  }

  // Listener for changes in the local directory
  watchChanges () {
    fs.watch(storagePath, { recursive: true }, (eventType, filename) => {
      if (filename) {
        console.log(`Storage Change detected: ${eventType} on ${filename}`)
        this.loadFromLocalPath(storagePath)
        this.SaveToFile()
      }
    })
  }

  // updateTree (aimPath, name, isDirectory, action) {
  //   const parts = aimPath.split('/').filter(Boolean)
  //   let currentNode = this.root

  //   for (const part of parts) {
  //     if (!currentNode.children) return false
  //     const nextNode = currentNode.children.find(child => child.name === part && child.isDirectory)
  //     if (!nextNode) return false
  //     currentNode = nextNode
  //   }
  //   if (action === 'create') {
  //     if (currentNode.children.some(child => child.name === name)) return false
  //     const newNode = new FileNode(name, isDirectory, path.join(currentNode.path, name))
  //     currentNode.addChild(newNode)
  //     return true
  //   } else if (action === 'delete') {
  //     const targetNode = currentNode.children.find(child => child.name === name)
  //     if (!targetNode) return false
  //     currentNode.removeChild(targetNode)
  //     return true
  //   }
  //   return false
  // }

  // Save the JSON configuration file to the config folder
  SaveToFile () {
    try {
      const json = JSON.stringify(this.root, null, 2)
      fs.writeFileSync(configPath, json)
    } catch (err) {
      console.error(err)
    }
  }
  // CRUD functions for files and folders

  addNewFolder (folderName, currentPath) {
    try {
      const buildPath = currentPath + '/' + folderName
      const absolutePath = path.resolve(buildPath)
      fs.mkdirSync(absolutePath, { recursive: true })
      return true
    } catch (err) {
      console.error(err.message)
      return false
    }
  }

  addNewFile (filename, destinationPath, content) {
    try {
      const buildPath = destinationPath + '/' + filename
      const absPath = path.resolve(buildPath)
      fs.writeFileSync(absPath, content)
    } catch (err) {
      console.error(err.message)
      return false
    }
  }

  removeFolder (folderName, currentPath) {
    try {
      const itemPath = itemPathBuilder(folderName, currentPath)
      console.log('This is the path: ', itemPath)
      fs.rmdirSync(itemPath, { recursive: true })
      return true
    } catch (err) {
      console.error(err.message)
      return false
    }
  }

  removeFile (filename, currentPath) {
    try {
      const itemPath = itemPathBuilder(filename, currentPath)
      fs.unlinkSync(itemPath)
      return true
    } catch (err) {
      console.error(err.message)
      return false
    }
  }

  renameFolder (folderName, targetPath, newFolderName) {
    try {
      const itemPath = itemPathBuilder(folderName, targetPath)
      fs.renameSync(itemPath, newFolderName)
      return true
    } catch (err) {
      console.error(err.message)
      return false
    }
  }

  renameFile (fileName, targetpath, newFileName) {
    try {
      const itemPath = itemPathBuilder(fileName, targetpath)
      fs.renameSync(itemPath, newFileName)
      return true
    } catch (err) {
      console.error(err.message)
      return false
    }
  }
  // Functions to determinate if a file or folder exists

  findItem (filename) {
    const queue = [this.root]
    while (queue.length > 0) {
      const currentNode = queue.shift()

      if (currentNode.name === filename) {
        return currentNode
      }

      if (currentNode.isDirectory && currentNode.children) {
        queue.push(...currentNode.children)
      }
    }
    return null
  }

  verifyIfExists (filename) {
    const fileNode = this.root.findFile(filename)
    if (!fileNode) {
      return false
    }
    return true
  }

  verifyIfExistsInCurrentNode (itemName, currentPath) {
    try {
      const absPath = itemPathBuilder(itemName, currentPath)
      console.log(absPath)
      if (!fs.existsSync(absPath)) {
        return false
      }
      return true
    } catch (err) {
      console.error(err.message)
      return false
    }
  }
}

export default FileSystem
