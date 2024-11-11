import express from 'express';

import {createTimeZone, getTimeZoneByCountryTimezone} from '../db/timeZone';

export const addTimeZone = async (req: any, res: any) => {
    try{
        const {country, timezone} = req.body; 

        if(!country || !timezone){
            return res.sendStatus(400);
        }

        const existingTimezone = await getTimeZoneByCountryTimezone(country, timezone);

        if(existingTimezone.length > 0){
            return res.sendStatus(400);
        }

        const timeZone = await createTimeZone({
            country: country,
            timezone: timezone
        });

        return res.status(200).json(timeZone).end();
    } catch (err){
        console.log(err);
        return res.sendStatus(400);
    }
} 