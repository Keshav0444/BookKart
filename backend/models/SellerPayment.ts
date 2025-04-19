import mongoose, { Document, Schema } from 'mongoose';


export interface ISellerPayment extends Document{
    seller:mongoose.Types.ObjectId;
    order:mongoose.Types.ObjectId;
    product:mongoose.Types.ObjectId;
    amount:number;
    paymentMethod:string;
    status: 'pending' | 'completed' | 'failed';
    processedBy:mongoose.Types.ObjectId;
    notes?:string;
}


const sellerPaymentSchema = new Schema<ISellerPayment> (
    {
        seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        amount:{type:Number, required:true},
        paymentMethod:{type:String, required:true},
        status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
        processedBy:{ type: Schema.Types.ObjectId, ref: 'User', required: true },
        notes:{type:String},
    }, 

    {timestamps:true}
)

export default mongoose.model<ISellerPayment>("SellerPayment",sellerPaymentSchema)

