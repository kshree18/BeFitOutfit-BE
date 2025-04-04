class _response{
    sendResponse=(data, res)=>{
        try{
            if(data.code){
                res.status(data.code)
                delete data.code
                res.send(data)
                return true
            }
            res.status(data && data.status ? 200 : 400)
                res.send(data)
                return true
        }
        catch(error){
            console.log(error)
            res.status('404').send({
                status:false,
                error
            })
            return false
        }
    }
}

module.exports= new _response()