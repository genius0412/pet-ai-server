import express from "express"
import { createServer } from "http"
import cors from "cors"
import * as db from "quick.db"
import * as brain from "brain.js"
import xss from "xss"
import csrf from "csurf"
import cookieParser from "cookie-parser"

/** app settings (define) */
const app: express.Application = express()
const port: number = Number(process.env.PORT) || 5000
const server = createServer(app)
const csrfProtection = csrf({ cookie: true })

/** define functions for ai */
const encode = (d: String) => {
    let arr = new Array()

    d.split(' ').map(c => {
        arr.push(c.charCodeAt(0)/255)
    })

    return arr
}

const convert = (e: any) => {
    return ({
        input: e.ID,
        output: JSON.parse(e.data)
    })
}

/** check if undefined text/class is in database */
if(db.get("undefined")) db.delete("undefined")

/** ai settings */
const network = new brain.NeuralNetwork()
const cData = db.all().map(e => convert(e))
console.log(`Converted Data: ${JSON.stringify(cData)}`)

const eData = cData.map(e => ({ input: encode(e.input), output: e.output }))
console.log(`Encoded Data: ${JSON.stringify(eData)}`) 

network.train(eData, {log: false})

/** app settings */
app.use(cors())
app.use(express.json())
app.use(cookieParser())

/** api */
server.listen(port, () => {
    console.log(`server listening on ${port}`)
})

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("Hello World!")
})

app.post("/train", (req: express.Request, res: express.Response) => {
    let obj = {} , obj2 = {}
    const text = xss(String(req.body.text))
    const cl = xss(String(req.body.class))
    obj2[cl] = 1
    obj["input"] = text
    obj["output"] = obj2
    
    console.log(`Train data: ${JSON.stringify(obj)}`)
    db.set(text, obj2)
    network.train(obj)
})

app.get("/data", (req: express.Request, res: express.Response) => {
    console.log(`Requested \"/data\"`)
    res.send(db.all().map(e => convert(e)) )
})

app.post("/run", (req: express.Request, res: express.Response) => {
    const text = xss(String(req.body.text))
    console.log(`Method: RUN\nData: ${text}\nClass: ${JSON.stringify(network.run(encode(text)))}`)
    res.send(JSON.stringify(network.run(encode(text))))
})