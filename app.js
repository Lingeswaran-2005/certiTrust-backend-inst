const express = require('express')
const app = express()
const cors = require('cors')
const pool = require('./db')
const PORT = 5000
const dotenv = require("dotenv").config()
const crypto = require('crypto')

//MiddleWare

app.use(cors())
app.use(express.json())

// Helper Functions

async function getHashAndSign(tableName , code) {
    const result = await pool.query(`select department_signature , institution_signature from ${tableName} where short_code = $1`,[code])
    return(result.rows[0])
}

function generateSignature(data,privateKey){
    const hash = crypto.createHash("sha256").update(data).digest()
    const sign = crypto.createSign("sha256").update(hash).sign(privateKey , "base64")
    return(sign)
}

// Routing

app.post("/rec/hash",async(req,res)=>{
    const data = req.body
    try {
        console.log("server 2 running")
        const hash = await getHashAndSign(data["deptTableName"],data["short_code"])
        

        if (!hash){
            return res.status(404).json({"message":"No Hash Found"})
        }

        
        const {department_signature:deptSign  , institution_signature : instSign} = hash
        
        console.log("hash sent")
        return res.status(200).json({"message":"hash sent successfully","deptSign":deptSign,"instSign":instSign})

    } catch (error) {

        console.log(error)
        return res.status(500).json({"message":"DB Error"})

    }
})

app.post("/api/dept/hash",(req,res)=>{
    try{
        const {data}  = req.body
        const rawData = data.map(i=>{
            return `${i["name"]}|${i["dept"]}|${i["issuedate"]}`
        })
        
        let deptSignatures = rawData.map(i=> generateSignature(i,process.env.DEPT_PRIVATE_KEY))
        console.log(deptSignatures)
        return res.status(200).json({message:"Department signature successfull"})
    }
    catch(err){
        console.log(err.message)
        res.status(500).json({message:"internal server error"})
    }

})

app.post("/api/inst/hash",(req,res)=>{
    try{
        const {data}  = req.body
        const rawData = data.map(i=>{
            return `${i["name"]}|${i["dept"]}|${i["issuedate"]}`
        })
        
        let deptSignatures = rawData.map(i=> generateSignature(i,process.env.INST_PRIVATE_KEY))
        console.log(deptSignatures)
        return res.status(200).json({message:"Institution signature successfull"})
    }
    catch(err){
        console.log(err.message)
        res.status(500).json({message:"internal server error"})
    }

})


app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))