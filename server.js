import http from 'http'
import path from 'path'
import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'

const app = express()
const server = http.createServer(app)

// Express App Config
app.use(cookieParser())
app.use(express.json())


// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.resolve('public')))
// } else {
const corsOptions = {
    origin: [
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://localhost:5173'
    ],
    credentials: true
}
app.use(cors(corsOptions))
// }

import { authRoutes } from './api/auth/auth.routes.js'
// import { userRoutes } from './api/user/user.routes.js'
// import { reviewRoutes } from './api/review/review.routes.js'
import { boardRoutes } from './api/board/board.routes.js'
import { setupSocketAPI } from './services/socket.service.js'

// routes
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'
app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
// app.use('/api/user', userRoutes)
// app.use('/api/review', reviewRoutes)
app.use('/api/board', boardRoutes)
setupSocketAPI(server)


app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


import { logger } from './services/logger.service.js'
const port = process.env.PORT || 3030
server.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})



////////////////////ghat gpt
import { OpenAI } from "openai";
import { CHAT_GPT_KEY4 } from './services/apiKeys.js'
import bodyParser from 'body-parser'
import { log } from 'console'

const openai = new OpenAI({
    apiKey: CHAT_GPT_KEY4 // This is also the default, can be omitted
});

app.use(bodyParser.json())

app.post('/chat', async (req, res) => {
    console.log(req.body);
    const { prompt } = req.body
    const completion = await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: prompt
    });

    res.send(completion.data.choices[0].text)
})