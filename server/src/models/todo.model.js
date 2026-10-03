import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    status:{
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending',
    },
    priority:{
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    dueDate:{
        type: Date,
        required: true,
    },
    dueTime:{
        type: String,
        required: true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {timestamps: true});

export const Todo = mongoose.model('Todo', todoSchema);