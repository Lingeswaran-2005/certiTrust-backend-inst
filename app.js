const express = require('express')
const app = express()
const cors = require('cors')
const pool = require('./db')
const PORT = 5000

//MiddleWare

app.use(cors())
app.use(express.json())

// Helper Functions

async function getHashAndSign(tableName , code) {
    const result = await pool.query(`select department_signature , institution_signature from ${tableName} where short_code = $1`,[code])
    return(result.rows[0])
}

// Routing

app.post("/rec/hash",async(req,res)=>{
    const data = req.body
    try {
        console.log("server 2 running")
        const hash = await getHashAndSign(data["deptTableName"],data["short_code"])
        

        if (!hash){
            res.status(404).json({"message":"No Hash Found"})
        }

        
        const {department_signature:deptSign  , institution_signature : instSign} = hash
        
        console.log("hash sent")
        res.status(200).json({"message":"hash sent successfully","deptSign":deptSign,"instSign":instSign})

    } catch (error) {

        console.log(error)
        res.status(500).json({"message":"DB Error"})

    }
})



app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))