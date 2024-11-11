import express from 'express';

import {createMessageText, getMessageTextType} from '../db/messageText';

export const addMessageText = async (req: any, res: any) => {
    try{
        const {type, val} = req.body; 

        if(!type || !val){
            return res.sendStatus(400);
        }

        const existingMessage = await getMessageTextType(type);

        if(existingMessage.length > 0){
            return res.sendStatus(400);
        }

        const messageTxt = await createMessageText({
            type: type,
            val: val
        });

        return res.status(200).json(messageTxt).end();
    } catch (err){
        console.log(err);
        return res.sendStatus(400);
    }
} 