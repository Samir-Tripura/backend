import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";




const videoSchema = new Schema(
    {
        videoFile:{
            type: String, //cloudinary url
            required: true
        },
        title:{
            type : String,
            require: true
        },
        description:{
            type : String,
            require: true
        },
        duration:{
            type : Number,
            require: true
        },
        views:{
            type : Number,
            default: 0
        },
        isPublished:{
            type : Boolean,
            default: true
        },
        isPublished:{
            type : Schema.Types.ObjectId,
            ref: "User",
            default: true
        },

    
        timestamps: true
})

videoSchema.plugin(mongooseAggregatePaginate)

export const video = mongoose.model("video", videoSchema)