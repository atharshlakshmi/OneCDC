import { Types, Document } from "mongoose";

export interface IItem extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price?: number;
  availability: boolean;
  images: string[];
  category?: string;
  cdcVoucherAccepted: boolean;
  lastUpdatedDate: Date;
  lastUpdatedBy: Types.ObjectId;
  reviews: Types.ObjectId[];
  catalogue: Types.ObjectId;
}
