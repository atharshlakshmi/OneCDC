import { Types } from "mongoose";

export interface ICatalogue {
  shop: Types.ObjectId;
  items: Types.ObjectId[];
}
