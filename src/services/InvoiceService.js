const mongoose = require('mongoose')
const axios = require('axios');
const CartModel = require('../models/CartModel');
const ProfileModel = require('../models/ProfileModel');
const InvoiceProductModel = require('../models/invoiceProductModel');
const InvoiceModel = require('../models/invoiceModel');
const PaymentSettingModel = require('../models/PaymentSettingModel');
const formData = require('form-data')
const ObjectID = mongoose.Types.ObjectId

const CreateInvoiceService = async(req) =>{
    //====step 1: Calculate total payable & vat ===========
    let user_id = new ObjectID(req.headers.user_id);
    let cus_email = req.headers.email;

    let matchStage  = {$match:{userID:user_id}}
    let JoinStageProduct =  {$lookup: {from: "products", localField: "productID", foreignField: "_id", as: "product"}};
    let unwindStage = {$unwind: "$product"}

    let CartProducts = await CartModel.aggregate([matchStage, JoinStageProduct, unwindStage])
    
    let totalAmount = 0;
    CartProducts.forEach(element => {
        let price;
        if (element['product']['discount']) {
            price = parseFloat(element['product']['discountPrice']);
        } else {
            price = parseFloat(element['product']['price']);
        }
        totalAmount += parseFloat(element['qty']) * price;
    });


    let vat = totalAmount * 0.05;
    let payable = totalAmount + vat; 

    // ===== Step 02: Prepare Customer Details & Shipping Details=====

    let Profile=await ProfileModel.aggregate([{$match: {userID:user_id}}]);
    let cus_details = `Name: ${Profile[0].cus_name}, Email: ${cus_email}. Address: ${Profile[0].cus_add}, Phone: ${Profile[0].cus_phone}`
    let ship_details=`Name: ${Profile[0].ship_name}, City: ${Profile[0].ship_city}, Address: ${Profile[0].ship_add}, Phone: ${Profile[0].ship_phone}`



    // ==== step 03: Transaction & Other's Id=====

    let tran_id = Math.floor(100000000+Math.random()*900000000);
    let val_id = 0;
    let delivery_status = "pending"
    let payment_status = "pending"

    // Step 04 ======  Create Invoice =====
    let CreateInvoice = await InvoiceModel.create({
        userID: user_id,
        payable: payable,
        cus_details: cus_details,
        ship_details: ship_details,
        tran_id:tran_id,
        val_id:val_id,
        payment_status:payment_status,
        delivery_status:delivery_status,
        total:totalAmount,
        vat:vat
    }) 

    // =======step 5 ===== Create Invoice Product
    let Invoice_id = CreateInvoice['_id']
  CartProducts.forEach(async(element) =>{
        await InvoiceProductModel.create({
            userID:user_id,
            productID:element['productID'],
            invoiceID:Invoice_id,
            qty:element['qty'],
            price:element['product']['discount']?element['product']['discountPrice']:element['product']['price'],
            color:element['color'],
            size:element['size'],
        })
    })

    // step 06  ==== remove carts
    await CartModel.deleteMany({userID:user_id})

    // ========step 07: Prepare SSL Payment =========

    let PaymentSetting = await PaymentSettingModel.find()

    const form = new formData()

    form.append('store_id', PaymentSetting[0]['store_id'])
    form.append('store_passwd', PaymentSetting[0]['store_passwd'])
    form.append('total_amount', payable.toString())
    form.append('currency', PaymentSetting[0]['currency'])
    form.append('tran_id', tran_id)
    form.append('success_url', `${PaymentSetting[0]['success_url']}/${tran_id}`);
    form.append('cancel_url', `${PaymentSetting[0]['cancel_url']}/${tran_id}`);
    form.append('ipn_url', `${PaymentSetting[0]['ipn_url']}/${tran_id}`)

    let profile = Profile[0]
    if (profile){
        form.append('cus_name', profile.cus_name || '');
        form.append('cus_email', cus_email || '');
        form.append('cus_add1', profile.cus_add || '');
        form.append('cus_add2', profile.cus_add || '');
        form.append('cus_city', profile.cus_city || '');
        form.append('cus_state', profile.cus_state || '');
        form.append('cus_postcode', profile.cus_postcode || '');
        form.append('cus_country', profile.cus_country || '');
        form.append('cus_phone', profile.cus_phone || '');
        form.append('cus_fax', profile.cus_fax || '');
    }

    form.append('shipping_method', 'YES')
    form.append('ship_name', Profile[0].ship_name)
    form.append('ship_add1', Profile[0].ship_add)
    form.append('ship_add2', Profile[0].ship_add)
    form.append('ship_city', Profile[0].ship_city)
    form.append('ship_state', Profile[0].ship_state)
    form.append('ship_country', Profile[0].ship_country)
    form.append('ship_postcode', Profile[0].ship_postcode)
    form.append('product_name', 'product_name')
    form.append('product_category', 'product_category')
    form.append('product_profile', 'product_profile')
    form.append('product_amount', 'product_amount')
  
    let SSLres = await axios.post(PaymentSetting[0]['init_url'], form)
    return {status:"success", data: SSLres.data}
}

const InvoiceListService = async(req) => {
    try{
        let user_id = req.headers.user_id
        let invoice = await InvoiceModel.find({userID:user_id})
        return {status:"success",data: invoice}
    }catch(err) {
        return {status:"fail", message:"Something Went Wrong"}
    }
}
const InvoiceProductListService = async(req) => {
    try{
       let user_id = new ObjectID(req.headers.user_id)
       let invoice_id = new ObjectID(req.params.invoice_id)
    
       let matchStage = {$match:{userID:user_id, invoiceID:invoice_id}}
    //    let JoinStageProduct = {$lookup:{from:'products', localField:'productID', foreignField:'_id', as:'product'}}
     let JoinStageProduct = {$lookup: {from: "products", localField: "productID", foreignField: "_id", as: "product"}};
       let unwindStageProduct = {$unwind:"$product"}
       let invoice = await InvoiceModel.aggregate([
        matchStage,
        JoinStageProduct,
        unwindStageProduct
       ])
       return {status:"success", data:invoice}
    }catch(err){
        return {status:"fail", message:"Something Went Wrong"}

    }
}
const PaymentSuccessService = async(req) => {
    try{
        let trxID = req.params.trxID
        await InvoiceModel.updateOne({tran_id:trxID}, {payment_status:'success'})

        return {status:"success"}
    }catch(e){
        return {status:"fail", message:"Something Went Wrong"}
    }
}
const PaymentFailService = async(req) => {
    try{
        let trxID = req.params.trxID
        await InvoiceModel.updateOne({tran_id:trxID}, {payment_status:'Cancel'})
        return {status:"Cancel"}
    }catch(e){
        return {status:"fail", message:"Something Went Wrong"}
    }
}
const PaymentIPNService = async(req) => {
    try{
        let trxID = req.params.trxID
        let status = req.body['status']
        await InvoiceModel.updateOne({tran_id:trxID}, {payment_status:status})

        return {status:"Success"}
    }catch(e){
        return {status:"fail", message:"Something Went Wrong"}
    }
}



module.exports = {
    CreateInvoiceService,
    PaymentFailService,
    PaymentSuccessService,
    InvoiceListService,
    InvoiceProductListService,
    PaymentIPNService
}
