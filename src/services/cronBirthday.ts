import cron from 'node-cron';

import CronJobModel, { ICronJob } from '../db/cronTask';
import { postData } from './apiPost';
import {constants} from '../constants';
import {getCurrentDayAndMonth} from '../helpers/utils';
import {getUserProfileByBirthday, getUserProfileById} from '../db/userProfile';
import {getMessageTextType} from '../db/messageText';
import {addTime} from '../helpers/timezone';

interface CronJobMap {
    [key: string]: cron.ScheduledTask;
}

const cronJobs: CronJobMap = {};

export const addCronJob = async (
    name: string,
    type: string,
    taskSchedule: string,
    user_id: string,
    response: string,
    sentTryCount: Number,
    retryType: string,
    description: string,
    status: string,
    task: () => void
) => {
    try{
        let allowed = true;
        if (cronJobs[name]) {
            console.log(`Cron job with name ${name} already exists.`);
            allowed = false;
        }

        if(allowed){
            // Save cron
            const newJob = new CronJobModel({ 
                name,
                type,
                taskSchedule,
                user_id,
                response,
                sentTryCount,
                retryType,
                description,
                status
            });
            await newJob.save();

            // Schedulling cron job
            const scheduledTask = cron.schedule(taskSchedule, async () => {
                console.log(`Executing cron job: ${name}`);
                
                const getMessage = await getMessageTextType(constants.TYPE_BIRTHDAY); 
                const getUser = await getUserProfileById(name); 

                let setMessage = getMessage[0].val;
                let fullName = getUser.firstName;

                if(getUser.lastName != ''){
                    fullName += " "+ getUser.lastName;
                }

                const message = setMessage.replace(/world/gi, "[full_name]");

                // POST 
                const url = constants.DEFAULT_SENDER_EMAIL_API;
                const payload = {
                    "email": getUser.email,
                    "message":message
                };

                try {
                    const response = await postData(url, payload);

                    if(response == null){
                        console.log('Response success from API: failed');

                        try {
                            console.log("removing cron job ");
                            scheduledTask.stop();
                            delete cronJobs[name];  

                            newJob.status = 'FAILED';
                            newJob.response = JSON.stringify(response);

                            await newJob.save();

                            console.log("registering cron job ");

                            let setTime = taskSchedule.split(" ");
                            let getHour = setTime[1];
                            let setHour = '';

                            let adjustHour = parseInt(getHour) + constants.RETRY_IN_HOUR;

                            if(adjustHour >= 24){
                                if(adjustHour == 24){
                                    adjustHour = 0;
                                } else {
                                    adjustHour = adjustHour - 24;
                                }
                            }

                            setHour = ""+ adjustHour;

                            addCronJob(
                                name,
                                constants.TYPE_BIRTHDAY,
                                setTime[0]+' '+setHour+' '+setTime[2]+' '+setTime[3]+' '+setTime[4], 
                                user_id,
                                "-",
                                0,
                                constants.RETRY_TYPE,
                                "Cron created",
                                "PENDING"
                            , async () => {
                                console.log('Task for '+name+' is running.');
                            });
        
                        } catch (error: any) {
                            console.log(error);
                        }

                    } else {
                        console.log('Response sukses from API:', response.data);

                        newJob.status = 'DONE';
                        newJob.response = JSON.stringify(response.data);

                        await newJob.save();

                        scheduledTask.stop();
                        delete cronJobs[name];
                    }
                } catch (error) {
                    console.error(error);
                }
            }, {
                scheduled: true,
                timezone: "Asia/Jakarta" 
            });
            cronJobs[name] = scheduledTask;
        }
    } catch(err){
        console.log(err);
    }
};

export const removeCronJob = async (name: string) => {
    if (!cronJobs[name]) {
        console.log("cron does not registered");
    } else {
        // remove cron from scheduller and db
        cronJobs[name].stop();
        delete cronJobs[name];
        await CronJobModel.deleteOne({ name });
    }
};
  
export const runBirtdayCron = async () => {
    console.log("start birthday services");

    cron.schedule('0 0 * * *', async () => { 
        console.log('Birthday cron job is running every day at 00.00');

        const getMonthDay = getCurrentDayAndMonth();
        const getProfile = await getUserProfileByBirthday(getMonthDay.month, getMonthDay.day);

        if (getProfile.length > 0){
            getProfile.forEach((data) => {
                let tmpDiff = data.dates.timeDifference.split(":");
                let actualTimeDiff = '';
                if(tmpDiff.length == 1){
                    actualTimeDiff = addTime("9", data.dates.timeDifference+":00")
                } else {
                    actualTimeDiff = addTime("9", data.dates.timeDifference)
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

                try {
                    console.log("registering cron job ");
                    addCronJob(
                        data._id.toString(),
                        constants.TYPE_BIRTHDAY,
                        timeCron[1]+' '+timeCron[0]+' * * *',   
                        data._id.toString(),
                        "-",
                        0,
                        constants.RETRY_TYPE,
                        "Cron created",
                        "PENDING"
                    , async () => {
                        console.log('Task for '+data._id.toString()+' is running.');
                    });

                } catch (error: any) {
                    console.log(error);
                }
            });
        }

    }, {
        scheduled: true,
        timezone: "Asia/Jakarta" // SERVER TIMEZONE
    });

};