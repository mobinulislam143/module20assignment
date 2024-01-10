const mongoose = require('mongoose')

const DataSchema = mongoose.Schema({
    product: {type:String, required: true},
    quantity: {type: String},
    price: {type:String, required: true},
    date: { type: Date, required: true },
    department: {type: String, required: true}
    
}, {versionKey: false})

const SalesModel = mongoose.model('sales', DataSchema)

module.exports = SalesModel