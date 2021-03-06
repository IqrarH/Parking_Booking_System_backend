const express = require('express');
const Floor = require('../../models/Floor');
var router = express.Router();
const auth = require('../../middlewares/auth');
const app = express();
let spotsArray=[];

router.post('/addFloor',auth.isToken,auth.isUser,auth.isAdmin,(req,res)=>{
    let floor = Floor();
    floor.floorNumber = req.body.floorNumber;
    for(var j=1;j<=25;j++){
        const isBooked = false;
        const spotNo = j;
        let newSpot = {isBooked,spotNo};
        spotsArray.push(newSpot);
    }
    floor.spots = spotsArray;

    // TODO  fill the default value here
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill 
    floor.save((err, result) => {
        if(!err){
            res.status(200).send({status: 200, message: 'New Floor has been added'})
        }
        else{
            console.log(err)
            res.status(203).send({message: 'Unable to add floor'})
        }
    })
})
router.get('/checkAvailableSpots/:floorNumber',auth.isToken,auth.isUser,async(req,res)=>{
    const data = await Floor.findOne({floorNumber:req.params.floorNumber}).exec()
    if(!data){
        res.status(203).send({status:203, message:'Floor Not Found'});
    }
    const temp = data.spots
    var freeSpots="";
    for(var i=0;i<25;i++){
        if(!temp[i].isBooked){
            freeSpots+=temp[i].spotNo;
            freeSpots+=", "
        }
    }
    if(freeSpots){
        res.status(200).send({status: 200, message:'Spots '+freeSpots+' are available on floor '+ req.params.floorNumber});
    }
    else{
        res.status(200).send({status: 203, message:'No spots available on floor '+req.params.floorNumber+' currenlty'});
    }
})
router.get('/checkAllAvailableSpots',auth.isToken,auth.isUser,async(req,res)=>{
    const data = await Floor.find().exec();
    var freeSpots="";
    var count = 0;
    for(var i=0;i<data.length;i++){
        const temp = data[i].spots
        for(var j=0;j<25;j++){
            if(!temp[j].isBooked){
                count++;
            }
        }
        freeSpots+=count+" spots available on floor "+data[i].floorNumber+"\n";
        count=0;
    }
    if(freeSpots){
        res.status(200).send(freeSpots);
    }else{
        res.status(200).send({message:'No spots available currently'})
    }
})

router.delete('/removeFloor/:floorNumber',auth.isToken,auth.isUser,auth.isAdmin,(req,res)=>{
    Floor.deleteOne({floorNumber:req.params.floorNumber},
        function(err, data) {
            if(err){
                res.status(203).send({message: 'Unable to delete, Floor does not exist'})
            }
            else{
                res.status(200).send({message: 'Floor has been deleted successfully'})
             }
    })
})
router.get('/showAll',auth.isToken,auth.isUser,auth.isAdmin, async(req,res)=>{
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 20;
    let count = 0;

    await Floor.find().exec((err,floors) => {
        count = floors.length;
    })

    Floor.find()
    .skip((page-1) * limit)
    .limit(limit)
    .exec((err, data)=>{
        if(err){
            res.status(203).send({status: 203, message: 'Unable to show floor'})
        }
        else{
            res.status(200).send({status:200, totalDocs:count, data: data})
        }
    })
})


router.get('/',(req,res)=>{
    res.send('PMS is ON!!!')
})

module.exports = router;