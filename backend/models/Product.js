import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ["Храна", "Дрехи", "Играчки"], required: true },
  priceBGN: { type: Number, required: true },
  priceEUR: { type: Number },
  image: { type: String, required: true }
});

productSchema.pre("save", function(next) {
  this.priceEUR = (this.priceBGN / 1.96).toFixed(2);
  next();
});

export default mongoose.model("Product", productSchema);
