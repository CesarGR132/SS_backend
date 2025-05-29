import express from 'express'
import dotenv from 'dotenv'
import storageRoutes from './src/routes/storage.routes.js'
import cors from 'cors'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors())

app.use('/api/storage', storageRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
