const SalesModel = require('../models/salesModel.js')
const { ObjectId } = require('mongoose').Types;


exports.getTotalRevenue = async(req, res)=> {
    try{
       const result = await SalesModel.aggregate([
        {
            $group:{
                _id:null,
                totalRevenue: {$sum: {$multiply: ["$quantity", "$price"]}}
            }
        }
       ])
        res.status(200).json({status: 'success', data: result})    
    }catch(err){
        res.status(400).json({status: 'success', data: err.toString()})    

    }
}
exports.getQuantityByProduct = async(req, res) =>{
    try{
        const result = await SalesModel.aggregate([
            {
                $group:{
                    _id: "$product",
                    totalQuantity: {$sum: "$quantity"}
                }
            }
        ])
       
        res.status(200).json({status: 'success', data: result})    
    }catch(err){
        res.status(400).json({status: 'success', data: err.toString()})    

    }
}
exports.TopProduct = async(req, res) =>{
    try{
       const result = await SalesModel.aggregate([
            {
                $group:{
                    _id: "$product",
                    totalRevenue: {$sum: {$multiply: ["$quantity", "$price"]}}
                }
            },
            {
                $sort: {totalRevenue: -1}
            },
            {
                $limit: 5
            }
       ])
        res.status(200).json({status: 'success', data: result})    
    }catch(err){
        res.status(400).json({status: 'success', data: err.toString()})    

    }
}
exports.AveragePrice = async(req, res) =>{
    try{
        const result = await SalesModel.aggregate([
            {
                $group:{
                    _id: null,
                    averagePrice: {$avg: "$price"}
                }
            }
        ])
        res.status(200).json({status: 'success', data: result})    
    }catch(err){
        res.status(400).json({status: 'success', data: err.toString()})    

    }
}
exports.revenueByMonth = async(req, res) =>{
    try {
        const result = await SalesModel.aggregate([
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } }
                }
            }
        ]);

        res.status(200).json({ status: 'success', data: result });
    }catch(err){
        res.status(400).json({status: 'success', data: err.toString()})    

    }
}
exports.highestQuantityBySold = async(req, res) =>{
    try{
       const result = await SalesModel.findOne().sort({quantity: -1})
        res.status(200).json({status: 'success', data: result})    
    }catch(err){
        res.status(400).json({status: 'success', data: err.toString()})    

    }
}
exports.DepartmentSalaryExpense = async(req, res) =>{
    try{
        const result = await SalesModel.aggregate([
            {
                $group:{
                    _id: "$department",
                    totalSalaryExpense: { $sum: {$multiply: ["$quantity", "$price"]} }
                }
            }
        ]);
        const formattedResult = result.reduce((acc, item) =>{
            acc[item._id] = item.totalSalaryExpense
            return acc
        }, {})
       
        res.status(200).json({status: 'success', data: formattedResult})    
    }catch(err){
        res.status(400).json({status: 'success', data: err.toString()})    

    }
}