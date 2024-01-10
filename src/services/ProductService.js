const BrandModel = require('../models/BrandsModel')
const CategoryModel = require('../models/CategoryModel')
const ProductSliderModel = require('../models/ProductSliderModel')
const ProductDetailsModel = require('../models/ProductDetailsModel')
const ProductModel = require('../models/ProductModel')
const ReviewModel = require('../models/ReviewModel')
const UserModel = require('../models/UserModel')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const ProductService = async() =>{
    try {
        let data= await ProductModel.find();
        return {status:"success",data:data}
     }
     catch (e) {
         return {status:"fail",data:e}.toString()
     }
}

const BrandListService = async () => {
    try {
        let data= await BrandModel.find();
        return {status:"success",data:data}
     }
     catch (e) {
         return {status:"fail",data:e}.toString()
     }
}
const CategoryListService = async () => {
    try {
        let data= await CategoryModel.find();
        return {status:"success",data:data}
    }
    catch (e) {
        return {status:"fail",data:e}.toString()
    }
}
const SliderListService = async () => {
    try {
        let data= await ProductSliderModel.find();
        return {status:"success",data:data}
    }
    catch (e) {
        return {status:"fail",data:e}.toString()
    }
}


const ListByBrandService = async (req) => {
    try{
        let BrandID = new ObjectId(req.params.BrandID)
        let MatchStage = {$match:{brandID:BrandID}}
        let JoinWithBrandStage = {$lookup:{
            from:'brands',
            localField:'brandID',
            foreignField: '_id',
            as:'brand'
        }}
        let JoinWithCategoryStage = {$lookup:{from:'categories',localField:'categoryID', foreignField:'_id', as:'category'}}
        let UnWindBrandStage = {$unwind:'$brand'}
        let UnwindCategoryStage = {$unwind: '$category'}
        let ProjectionStage = {$project:{'brand._id':0,'category._id':0, 'categoryID':0,'brandID':0}}
        let data = await ProductModel.aggregate([
            MatchStage,
            JoinWithBrandStage,
            JoinWithCategoryStage,
            UnWindBrandStage,
            UnwindCategoryStage,
            ProjectionStage
        ])
        return {status: 'success', data: data}

    }catch(err){
        return {status:"fail",data:err.toString()}
    }
    
}
const ListByCategoryService = async (req) => {
     try{
        let CategoryID=new ObjectId(req.params.CategoryID);
        let MatchStage={$match:{categoryID:CategoryID}}

        let JoinWithBrandStage = {$lookup:{from:'brands',localField:'brandID', foreignField:'_id', as:'brands'}}
        let JoinWithCategoryStage = {$lookup:{from:'categories',localField:'categoryID', foreignField:'_id', as:'categorys'}}
        
        let UnWindBrandStage = {$unwind:'$brands'}
        let UnwindCategoryStage = {$unwind: '$categorys'}
        let ProjectionStage = {$project:{'brand._id':0,'category._id':0, 'categoryID':0,'brandID':0}}
        let data= await  ProductModel.aggregate([
            MatchStage, JoinWithBrandStage,JoinWithCategoryStage,
            UnWindBrandStage,UnwindCategoryStage, ProjectionStage
        ])
        return {status: 'success', data: data}

    }catch(err){
        return {status:"fail",data:err.toString()}
    }
    
}
const ListByRemarkService = async (req) => {
    try{
        let Remark = req.params.Remark
        let MatchStage = {$match:{remark:Remark}}
        let JoinWithBrandStage = {$lookup:{from:'brands',localField:'brandID', foreignField:'_id', as:'brand'}}
        let JoinWithCategoryStage = {$lookup:{from:'categories',localField:'categoryID', foreignField:'_id', as:'category'}}
        let UnWindBrandStage = {$unwind:'$brand'}
        let UnwindCategoryStage = {$unwind: '$category'}
        let ProjectionStage = {$project:{'brand._id':0,'category._id':0, 'categoryID':0,'brandID':0}}
        let data = await ProductModel.aggregate([
            MatchStage,
            JoinWithBrandStage,
            JoinWithCategoryStage,
            UnWindBrandStage,
            UnwindCategoryStage,
            ProjectionStage
        ])
        return {status: 'success', data: data}

    }catch(err){
        return {status:"fail",data:err.toString()}
    }
    
}

const ListBySmilierService = async (req) => {
    try{
        let CategoryID = new ObjectId(req.params.CategoryID)
        let MatchStage = {$match:{categoryID:CategoryID}}
        let limitStage = {$limit:5}
        let JoinWithBrandStage = {$lookup:{from:'brands', localField:'brandID', foreignField:'_id', as:'brand'}}
        let UnWindBrandStage = {$unwind:'$brand'}
        let JoinWithCategoryStage = {$lookup:{from:'categories', localField:'categoryID', foreignField:'_id', as:'category'}}
        let UnwindCategoryStage = {$unwind:"$category"}
        let ProjectionStage = {$project:{'brand._id':0, 'category._id':0,'categoryID':0, 'brandID':0}}

        let data = await ProductModel.aggregate([
            MatchStage,
            JoinWithBrandStage,
            UnWindBrandStage,
            JoinWithCategoryStage,
            UnwindCategoryStage,
            ProjectionStage,
            limitStage
        ])
        return {status:"success", data:data}
    }catch(err){
        return {status:"fail",data:err}.toString()

    }
}
const DetailsService = async (req) => {
    try{
        let ProductID = new ObjectId(req.params.ProductID)
    let MatchStage = {$match:{_id: ProductID}}
    
    let JoinWithBrandStage = {$lookup:{from:'brands', localField:'brandID', foreignField:'_id', as:'brand'}}
    let JoinWithCategoryStage={$lookup:{from:"categories",localField:"categoryID",foreignField:"_id",as:"category"}};
    let JoinWithDetailsStage = {$lookup:{from:'productdetails', localField:'_id', foreignField:'productID', as:'detail'}}
    
    let UnwindBrandStage={$unwind:"$brand"}
    let UnwindCategoryStage={$unwind:"$category"}
    let UnwindDetailsStage={$unwind:"$detail"}
    
    let ProjectionStage = {$project:{'brand._id':0,'category._id':0,'categoryID':0,'brandID':0}}
    let data = await ProductModel.aggregate([
        MatchStage,
        JoinWithBrandStage,
        JoinWithCategoryStage,
        JoinWithDetailsStage,
        UnwindBrandStage,
        UnwindCategoryStage,
        UnwindDetailsStage,
        ProjectionStage
    ])
    return {status:"success",data:data}

    }catch(err){
        return {status:'fail', data:err.toString()}
    }
}

const ListByKeywordService = async (req) => {
   try{
    let SearchRegex = { "$regex": req.params.Keyword, "$options": "i" };
    let SearchParams = [{ title: SearchRegex }, { shortDes: SearchRegex }];
    let SearchQuery = { $or: SearchParams };

    let MatchStage = { $match: SearchQuery };
    let JoinWithBrandStage = { $lookup: { from: "brands", localField: "brandID", foreignField: "_id", as: "brand" } };
    let JoinWithCategoryStage = { $lookup: { from: "categories", localField: "categoryID", foreignField: "_id", as: "category" } };
    let UnwindBrandStage = { $unwind: "$brand" };
    let UnwindCategoryStage = { $unwind: "$category" };
    let ProjectionStage = { $project: { 'brand._id': 0, 'category._id': 0, 'categoryID': 0, 'brandID': 0 } };


    let data = await ProductModel.aggregate([
        MatchStage, JoinWithBrandStage, JoinWithCategoryStage,
        UnwindBrandStage, UnwindCategoryStage, ProjectionStage
    ]);
    
        return {status:"success",data:data}


   }catch(err) {
        return {status:"fail",data:err.toString()}

   }


}

const ReviewListService = async (req) => {
   try{
    let ProductID=new ObjectId(req.params.ProductID);
    let MatchStage={$match:{productID:ProductID}}
    let JoinWithProfileStage = {$lookup:{from:'profiles', localField:'userID', foreignField:"userID", as:'profile'}}
    let UnwindProfileStage={$unwind:"$profile"}
    let ProjectionStage = {$project:{'des':1, 'rating':1, 'profile.cus_name': 1}}
    let data = await ReviewModel.aggregate([
        MatchStage,
        JoinWithProfileStage,
        UnwindProfileStage,
        ProjectionStage
    ])
    return {stats: 'success', data: data}
   }catch(err){
    return {status:"fail",data:e}.toString()

   }
}

module.exports = {
    BrandListService,
    CategoryListService,
    SliderListService,
    ListByCategoryService,
    ListByBrandService,
    ListByRemarkService,
    DetailsService,
    ListByKeywordService, 
    ReviewListService,
    ListBySmilierService,
    ProductService
}
