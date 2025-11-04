import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String,
  priceBGN: { type: Number, required: true },
  image: String
});

productSchema.pre("save", function(next) {
  this.priceEUR = (this.priceBGN / 1.96).toFixed(2);
  next();
});

export default mongoose.model("Product", productSchema);
