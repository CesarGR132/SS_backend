import express from 'express'
import {
  getFile,
  createFolder,
  getConfig,
  recieveFiles,
  removeFolder,
  removeFile,
  renameFolder,
  renameFile
} from '../controllers/storage.controller.js'

const router = express.Router()

router.post('/getFile', getFile)
// router.get('/displayStorage', displayStorage)
router.post('/createNewFolder', createFolder)
router.post('/addNewFiles', recieveFiles)
router.post('/removeFolder', removeFolder)
router.post('/removeFile', removeFile)
router.post('/renameFolder', renameFolder)
router.post('/renameFile', renameFile)
router.get('/getConfig', getConfig)

export default router
