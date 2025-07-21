import express from 'express'
import dotenv from 'dotenv'
import storageRoutes from './src/routes/storage.routes.js'
import cors from 'cors'
import { getApiAddress } from './src/services/apiAddress.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const HOST = '0.0.0.0'
const API_ADDRESS = getApiAddress()

app.use(express.json())

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      `http://${API_ADDRESS}:3000`,
      'http://miapp:3000',
      undefined // permite Postman o llamadas locales sin origin
    ];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));


app.get('/', (req, res) => {
  res.send(`
    <h1> Hola perro </h1>
    <p> Tu IP es: ${API_ADDRESS}</p>
    `)
})


app.use('/api/storage', storageRoutes)

app.listen(PORT, HOST, () => {
  console.log(`Server is running at http://${API_ADDRESS}:${PORT}`)
})
