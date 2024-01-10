
const WishListModel = require('../models/wishListModel')
const mongoose = require('mongoose')
const ObjectID = mongoose.Types.ObjectId 

const WishListService  = async(req)=>{
   try{
    let user_id = new ObjectID(req.headers.user_id);
    let matchStage = {$match:{userID:user_id}}
 
    let JoinStageWithProduct = {$lookup:{from:'products', localField:'productID', foreignField:"_id", as:"product"}}
    let unwindProductStage = {$unwind:"$product"}

    let JoinStageWithBrand = {$lookup:{from:'brands', localField:'product.brandID', foreignField:'_id', as:'brand'}}
    let unwindBrandStage = {$unwind:'$brand'}

    let JoinStageCategory = {$lookup:{from:'categories', localField:'product.categoryID', foreignField:'_id', as:'category'}}
    let unwindCategoryStage={$unwind:"$category"};

    // let projectionStage = {$project:{}}
    let result =await WishListModel.aggregate([
        matchStage,
        JoinStageWithProduct,
        unwindProductStage,
        JoinStageWithBrand,
        unwindBrandStage,
        JoinStageCategory,
        unwindCategoryStage,
    ])

    return {status:"success",data:result}
   }catch(err){
    return {status:"fail",message:"Something Went Wrong !"}

   }
}
const SaveWishListService  = async (req) => {
   try{
    let user_id = req.headers.user_id
    let reqBody = req.body
    reqBody.userID = user_id;
    await WishListModel.updateOne(reqBody, {$set:reqBody}, {upsert:true})
    return {status:"success",message:"Wish List Save Success"}

   }catch(err) {
    return {status:"fail",message:"Something Went Wrong !"}

   }
}

const RemoveWishListService  = async(req) => {
   try{
    let user_id = req.headers.user_id;
    let reqBody = req.body;
    reqBody.userID = user_id
    await WishListModel.deleteOne(reqBody)
    return {status:"success",message:"Wish List Remove Success"}

   }catch(e){
    return {status:"fail",message:"Something Went Wrong !"}

   }
}

module.exports = {
   WishListService,
   SaveWishListService,
   RemoveWishListService
}