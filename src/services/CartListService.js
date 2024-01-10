const CartModel = require('../models/CartModel')

const mongoose = require('mongoose')
let ObjectID = mongoose.Types.ObjectId

const CartListService =async(req)=>{
    try{
        let user_id = new ObjectID(req.headers.user_id)
        let matchStage = {$match:{userID:user_id}}
 
        let JoinStageWithProduct = {$lookup:{from:'products', localField:'productID', foreignField:"_id", as:"product"}}
        let unwindProductStage = {$unwind:"$product"}
        
        let JoinStageWithBrand = {$lookup:{from:'brands', localField:'product.brandID', foreignField:'_id', as:'brand'}}
        let unwindBrandStage = {$unwind:'$brand'}

        let JoinStageCategory = {$lookup:{from:'categories', localField:'product.categoryID', foreignField:'_id', as:'category'}}
        let unwindCategoryStage={$unwind:"$category"};
        
        let result =await CartModel.aggregate([
            matchStage,
            JoinStageWithProduct,
            unwindProductStage,
            JoinStageWithBrand,
            unwindBrandStage,
            JoinStageCategory,
            unwindCategoryStage,
        ])
    
        return {status: "success", message:result}

    }catch(err){
        return {status: "fail", message:"Something went wrong"}
    }
}

const SaveCartListService =async(req)=>{
     try{
        let user_id = req.headers.user_id
        let reqBody = req.body;
        reqBody.userID = user_id
        await CartModel.create(reqBody,)
        return {status: "success", message:"Cart list create success"}
 
    }catch(err){
        return {status: "fail", message:"Something went wrong"}
    }
}
const UpdateCartListService =async(req)=>{
     try{
        let user_id = req.headers.user_id
        let cart_id = req.params.CartID
        let reqBody = req.body
        reqBody.userID = user_id
        await CartModel.updateOne({_id:cart_id, userID:user_id}, {$set:reqBody})

        return {status: "success", message:"CartList Update success"}

    }catch(err){
        return {status: "fail", message:"Something went wrong"}
    }
}
const RemoveCartListService =async(req)=>{
     try{
        let user_id = req.headers.user_id
        let reqBody = req.body
        reqBody.userID = user_id

        await CartModel.deleteOne(reqBody)
        return {status: "success", message:"cart remove successfully"}

    }catch(err){
        return {status: "fail", message:"Something went wrong"}
    }
}

module.exports = {
    CartListService,
    SaveCartListService,
    RemoveCartListService,
    UpdateCartListService
}