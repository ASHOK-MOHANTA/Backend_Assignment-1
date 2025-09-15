const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderName: { type: String, required: true },
  orderAmount: { type: Number, required: true },
  deliveryStatus: { type: Boolean, required: true },
  modeOfPayment: {
    type: String,
    enum: ["COD", "UPI", "NetBanking", "DebitCard", "CreditCard", "GiftCard"],
  },
  //This should be the user id from user collection
  orderby:{type:mongoose.Schema.Types.ObjectId,ref:"User"}
  // Established a relationship with user Collection/schema
});

const orderModel = mongoose.model("Orders", orderSchema);

module.exports = orderModel;
