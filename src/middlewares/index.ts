import express from 'express';

import {get, merge} from 'lodash';
import {getUserProfileBySessionToken} from '../db/userProfile';
import {constants} from '../constants';

export const isAuthenticated = async (req: any, res: any, next: express.NextFunction) => {
    try{
        const sessionToken = req.cookies['GALIH-TEST-AUTH'];

        if(!sessionToken){
            return res.sendStatus(403);
        }

        const existingUser = await getUserProfileBySessionToken(sessionToken);

        if(!existingUser){
            return res.sendStatus(403);
        }

        var param = {
            'identity': [existingUser]
        };
          
          merge(req, param);

        return next();
    } catch (err){
        console.log(err);
        return res.sendStatus(400);
    }
}

export const isAdmin = async (req: any, res: any, next: express.NextFunction) => {
    try{
        const identity = get(req, 'identity')
        const sessionToken = req.cookies['GALIH-TEST-AUTH'];

        if(!sessionToken){
            return res.sendStatus(403);
        }

        if(identity.length == 0){
            return res.sendStatus(403);
        }

        const checkRole = identity[0].role;

        if(checkRole != constants.ACCESS_GRANTED_ROLE){
            return res.sendStatus(403);
        }

        return next();
    } catch (err){
        console.log(err);
        return res.sendStatus(400);
    }
}