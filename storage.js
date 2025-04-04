const {Storage} = require('@google-cloud/storage')
require('dotenv').config()
async function uploadFile(file,fileDestination){
    try{
        const projectId = process.env.PROJECT_ID;
        const keyFilename = process.env.FILE_KEY_NAME;
        const storage = new Storage({projectId, keyFilename})
        const bucket = storage.bucket(process.env.BUCKET_NAME)
        const ret = await bucket.upload(file,{
            destination:`images/${fileDestination}`
        })
        return{
            ret
        }
    }catch(error){
        console.error('Error, ',error)
    }
}
(async()=>{
    const ret = await uploadFile("test.txt", "tes1.txt")
    console.log(ret)
})()