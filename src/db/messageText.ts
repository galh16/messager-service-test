import mongoose from 'mongoose';

const MessageTextSchema = new mongoose.Schema({
    type: {type: String, required: true},
    val: {type: String, required: true}
});

export const MessageTextModel = mongoose.model('MessageText', MessageTextSchema);

export const getMessageText= () => MessageTextModel.find();
export const getMessageTextType = (type: string) => MessageTextModel.find({type});
export const getMessageTExtById = (id: string) => MessageTextModel.findById(id);
export const createMessageText = (values: Record<string, any>) => new MessageTextModel(values).save().then(
    (data) => data.toObject()
);
export const deleteMessageTExtById = (id: string) => MessageTextModel.findOneAndDelete({_id: id});
export const updateMessageTextById = (id: string, values: Record<string, any>) => 
    MessageTextModel.findByIdAndUpdate(id, values);