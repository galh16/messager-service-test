import express from 'express';

import {getUserProfiles, deleteUserProfileById, getUserProfileByEmail, getUserProfileById} from '../db/userProfile';
import {getTimeZoneByCountry} from '../db/timeZone';
import {constants} from '../constants';
import {random, authentication} from '../helpers';
import {getOffsetForLoc, getServerTimezone, calculateTimezoneDifference, addTime} from '../helpers/timezone';
import CronJobModel from '../db/cronTask';
import {getCurrentDayAndMonth, getCurrentTime} from '../helpers/utils';
import {removeCronJob, addCronJob} from '../services/cronBirthday';

export const getAllUsers = async (req: any, res: any) => {
    try{
        const userProfiles = await getUserProfiles();

        return res.status(200).json(userProfiles).end();
    } catch (err){
        console.log(err);
        return res.sendStatus(400);
    }
} 

export const deleteUser = async (req: any, res: any) => {
    try{
        const {id} = req.params;

        const deletedUser = await deleteUserProfileById(id);

        return res.status(200).json(deletedUser).end();
    } catch (err){
        console.log(err);
        return res.sendStatus(400);
    }
}

export const updateUser = async (req: any, res: any) => {
    let getLastName, getBirthday, getAnniversary, timeDifference, getRole, salt, passHash, getNewPassword = '';

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

    try{
        let {newPassword} = req.body;
        getNewPassword = newPassword;
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
        const {id} = req.params;
        const {firstName, password, email, country} = req.body; 

        if(!firstName || !password || !email || !country){
            return res.sendStatus(400);
        }

        const user = await getUserProfileById(id).select('+authentication.salt +authentication.password');
        const existingUser = await getUserProfileByEmail(email).select('+authentication.salt +authentication.password');

        let getUser = null;

        if(existingUser.length > 0){
            if(user.email != existingUser[0].email){
                console.log("existingUser: ", existingUser);
                return res.sendStatus(400);
            }

            getUser = existingUser[0];
        } else {
            getUser = user;
        }

        if(!getRole){
            getRole = constants.DEFAULT_ROLE;
        } else if(!constants.ROLE_SET.includes(getRole)){
            return res.sendStatus(400);
        }
        
        const expectedPassword = authentication(getUser.authentication.salt, password);
        if(getUser.authentication.password != expectedPassword){
            return res.sendStatus(400);
        }

        if(getNewPassword != ''){
            salt = random();
            passHash = authentication(salt, getNewPassword);
        } else {
            passHash = getUser.authentication.password;
            salt = getUser.authentication.salt;
        }

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

        user.firstName = firstName;
        user.lastName = getLastName;
        user.email = email;
        user.dates.birthday.date = getBirthday == '' ? '-' : getBirthday;
        user.dates.birthday.month = tmpBirthday[1];
        user.dates.birthday.day = tmpBirthday[2];
        user.dates.anniversary.date = getAnniversary == '' ? '-' : getAnniversary;
        user.dates.anniversary.month = tmpAnniversary[1];
        user.dates.anniversary.day = tmpAnniversary[2];
        user.dates.timeDifference = timeDifference;
        user.country = country;
        user.role = getRole;
        user.authentication.password = passHash;
        user.authentication.salt = salt;

        await user.save();

        if(getBirthday != ''){
            // check is this user's birthday is today 
            let allowed = false;
            const getMonthDay = getCurrentDayAndMonth();
            const getCurTime = getCurrentTime();

            console.log("getMonthDay: ", getMonthDay);
            console.log("getCurTime: ", getCurTime);

            if(getMonthDay.month == user.dates.birthday.month && getMonthDay.day == user.dates.birthday.day){
                allowed = true;
            }

            if(allowed){

                // stop existing cron and set new cron   
                let name = user._id.toString();
                const getExistingJob = await CronJobModel.findOne({
                    "name": name,
                    "status": "PENDING"
                });

                getExistingJob.status = "FAILED";
                await getExistingJob.save(); 
                await removeCronJob(name);

                // set new cron 
                console.log("set new cron");
                let tmpDiff = user.dates.timeDifference.split(":");
                let actualTimeDiff = '';

                let tmpHour = parseInt(getCurTime.hours);
                let scheduleHours = '';
                
                // check if current hours is less than 8 am (tolerance 1 hour to prepare the cron to be standby)
                if(tmpHour < 8){ 
                    scheduleHours = "9";
                } else if (tmpHour >= 9){
                    scheduleHours = ""+(tmpHour + 1);
                }

                if(tmpDiff.length == 1){
                    actualTimeDiff = addTime(scheduleHours, user.dates.timeDifference+":00")
                } else {
                    actualTimeDiff = addTime(scheduleHours, user.dates.timeDifference)
                }

                let timeCron = actualTimeDiff.split(":");
                if(timeCron[1] == '00'){
                    timeCron[1] = "0";
                } else if(parseInt(timeCron[1]) < 9){
                    timeCron[1] = timeCron[1].substring(1);
                }

                if(parseInt(timeCron[0]) < 10){
                    timeCron[0] = timeCron[0].substring(1);
                }

                addCronJob(
                    name,
                    constants.TYPE_BIRTHDAY,
                    timeCron[1]+' '+timeCron[0]+' * * *', 
                    name,
                    "-",
                    0,
                    constants.RETRY_TYPE,
                    "Cron created",
                    "PENDING"
                , async () => {
                    console.log('Task for '+name+' is running.');
                });
            }
            
        }

        return res.status(200).json(user).end();
    } catch (err){
        console.log(err);
        return res.sendStatus(400);
    }
}