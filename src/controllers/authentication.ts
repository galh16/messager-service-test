import express from 'express';

import {getUserProfileByEmail, createUserProfile} from '../db/userProfile';
import {getTimeZoneByCountry} from '../db/timeZone';
import {random, authentication} from '../helpers';
import {getOffsetForLoc, getServerTimezone, calculateTimezoneDifference} from '../helpers/timezone';
import {constants} from '../constants';

export const login = async(req: any, res: any) => {
    try{
        const {password, email} = req.body; 

        if(!password || !email){
            return res.sendStatus(400);
        }

        const userProfileData = await getUserProfileByEmail(email).select('+authentication.salt +authentication.password');

        console.log("userProfileData: ", userProfileData);

        if(userProfileData.length == 0){
            return res.sendStatus(400);
        }

        let userProfile = userProfileData[0];

        const expectedPassword = authentication(userProfile.authentication.salt, password);

        if(userProfile.authentication.password != expectedPassword){
            return res.sendStatus(400);
        }

        const salt = random();
        userProfile.authentication.sessionToken = authentication(salt, userProfile._id.toString());

        await userProfile.save();

        res.cookie('GALIH-TEST-AUTH', userProfile.authentication.sessionToken, { domain: 'localhost', path: '/' });

        return res.status(200).json(userProfile).end();
    } catch(err){
        console.log(err);
        return res.sendStatus(400);
    }
}

/* CREATE / REGISTER NEW USER PROFILE  
 * @param {firstName} String  Required
 * @param {lastName} String
 * @param {email} String      Required
 * @param {birthday} String
 * @param {anniversary} String
 * @param {country} String    Required
 * @param {role} String
 * @param {password} String   Required
 * @returns {Object} 
 */
export const register = async(req: any, res: any) => {
    let getLastName, getBirthday, getAnniversary, timeDifference, getRole, salt, passHash = '-';

    try{
        let {lastName} = req.body;
        getLastName = lastName; 
    } catch (err){}

    try{
        let {birthday} = req.body;
        getBirthday = birthday;
    } catch (err){}

    try{
        let {anniversary} = req.body;
        getAnniversary = anniversary; 
    } catch (err){}

    try{
        let {role} = req.body;
        getRole = role;
    } catch (err){}

    let tmpBirthday = getBirthday.split("-");
    let tmpAnniversary = getAnniversary.split("-");
    try{
        if(tmpBirthday.length < 3){
            tmpBirthday = ['-', '-', '-']
        }

        if(tmpAnniversary.length < 3){
            tmpAnniversary = ['-', '-', '-']
        }
    } catch(err){}

    try{
        const {firstName, password, email, country} = req.body; 

        if(!firstName || !password || !email || !country){
            return res.sendStatus(400);
        }

        const existingUser = await getUserProfileByEmail(email);

        if(existingUser.length > 0){
            return res.sendStatus(400);
        }

        if(!getRole){
            getRole = constants.DEFAULT_ROLE;
        } else if(!constants.ROLE_SET.includes(getRole)){
            return res.sendStatus(400);
        }

        salt = random();
        passHash = authentication(salt, password);

        // get timezone code from db 
        const getTimeZone = await getTimeZoneByCountry(country);
        if(getTimeZone.length > 0){
            const serverTimeZone = getServerTimezone();
            const server_offset = getOffsetForLoc(serverTimeZone);
            const user_offset = getOffsetForLoc(getTimeZone[0].timezone);
            timeDifference = calculateTimezoneDifference(server_offset,user_offset);
        } else {
            timeDifference = null;
        }

        const userProfile = await createUserProfile({
            firstName: firstName,
            lastName: getLastName, 
            email: email, 
            dates: {
                birthday: {
                    date: getBirthday == '' ? '-' : getBirthday,  
                    month: tmpBirthday[1],
                    day: tmpBirthday[2]
                },
                anniversary: {
                    date: getAnniversary == '' ? '-' : getAnniversary, 
                    month: tmpAnniversary[1],
                    day: tmpAnniversary[2]
                },
                timeDifference: timeDifference
            }, 
            country: country,
            role: getRole, 
            authentication: {
                password: passHash,
                salt: salt
            }
        });

        return res.status(200).json(userProfile).end();
    } catch (err){
        console.log(err);
        return res.sendStatus(400);
    }
}