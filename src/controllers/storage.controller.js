import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import multer from 'multer'
import { FileSystem } from '../models/systemStorage.model.js'

dotenv.config()

const upload = multer()

const storagePath = process.env.STORAGE_PATH || '../../storage'
const configPath = process.env.CONFIG_JSON || '../config/config.json'
const absoluteConfigPath = path.resolve(configPath)

const SystemManager = new FileSystem()
SystemManager.loadFromLocalPath()
SystemManager.watchChanges()

export const getFile = async (req, res) => {
  const { filename } = req.body
  const filepath = path.resolve(storagePath, filename)

  try {
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        error: 'Sorry, We have problems with the file you are looking for. Please try again later.'
      })
    }
    res.sendFile(filepath)
  } catch (error) {
    console.error('Error sending file:', error)
    res.status(500).json({ error: error.message })
  }
}

export const getConfig = async (req, res) => {
  if (!fs.existsSync(absoluteConfigPath)) {
    SystemManager.SaveToFile(absoluteConfigPath)
  }
  return res.sendFile(absoluteConfigPath)
}

// CRUD functions for managing files and directories

export const recieveFiles = async (req, res) => {
  upload.array('files')(req, res, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Error uploading files' })
    }
    const files = req.files
    const { destinationPath } = req.body

    if (!files || files.length === 0 || !destinationPath) {
      console.log(`Destinantion path: ${destinationPath} \nLenght of files ${files.length} \nfiles ${files}`)
      return res.status(400).json({ error: 'no mijo' })
    }

    // eslint-disable-next-line prefer-const
    let failed = []
    files.forEach(file => {
      const result = SystemManager.addNewFile(file.originalname, destinationPath, file.buffer)
      if (result === false) {
        failed.push(file.originalname)
      }
    })

    if (failed.length > 0) {
      return res.status(500).json({ error: 'Some files failed to upload', failed })
    }

    console.log('Files received and uploaded successfully')
    return res.status(200).json({ message: 'Files uploaded successfully' })
  })
}

export const createFolder = async (req, res) => {
  const { folderName, path } = req.body
  try {
    const verifyExists = SystemManager.verifyIfExistsInCurrentNode(folderName, path)
    if (verifyExists) {
      return res.status(400).json({ error: 'Folder already exists' })
    }
    SystemManager.addNewFolder(folderName, path)
    return res.status(200).json({ message: 'Folder created successfully' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

export const removeFolder = async (req, res) => {
  const { folderName, folderPath } = req.body
  try {
    const verifyExists = SystemManager.verifyIfExistsInCurrentNode(folderName, folderPath)
    console.log(verifyExists)
    if (!verifyExists) {
      return res.status(400).json({
        error: 'Folder does not exist',
        folderName,
        folderPath
      })
    }
    SystemManager.removeFolder(folderName, folderPath)
    return res.status(200).json({ message: 'Folder removed successfully' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}

export const removeFile = async (req, res) => {
  const { filename, filepath } = req.body
  try {
    const verifyIfExists = SystemManager.verifyIfExistsInCurrentNode(filename, filepath)
    if (verifyIfExists) {
      return res.status(400).json({ error: 'File does not exist' })
    }
    SystemManager.removeFile(filename, filepath)
    return res.status(200).json({ message: 'File removed successfully' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}

export const renameFolder = async (req, res) => {
  const { foldername, targetpath, newname } = req.body
  try {
    const verifyIfExists = SystemManager.verifyIfExistsInCurrentNode(foldername, targetpath)
    if (!verifyIfExists) {
      return res.status(400).json({ error: 'Folder name does not exist' })
    }

    SystemManager.renameFolder(foldername, targetpath, newname)
    return res.status(200).json({ message: 'Folder renamed successfully' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}

export const renameFile = async (req, res) => {
  const { filename, targetpath, newname } = req.body
  try {
    const verifyIfExists = SystemManager.verifyIfExistsInCurrentNode(filename, targetpath)
    if (!verifyIfExists) {
      return res.status(400).json({ error: 'File name does not exist' })
    }

    SystemManager.renameFile(filename, targetpath, newname)
    return res.status(200).json({ message: 'File renamed successfully' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
