# messager-service-test
This project is used for testing purpose

To install / init project

npm install

To run project (this project will run on PORT: 8080, mongodb PORT: 27017) 

npm start 

This project is using 
- Typescript
- Express
- Mongodb 

SERVICES THAT INCLUDE IN THIS PROJECT: 
- API 
- 3rd Party API (dummy email sender)
- Cron job 

For mongodb can create new db called 'birthday_alert' 

There will be 4 collections created: 

1. collections: cronjobs

    name: {type: String, required: true}, 
    type: {type: String, required: true}, 
    taskSchedule: {type: String, required: true}, // format cron (e.g., '*/5 * * * *')
    user_id: {type: String, required: true},
    response: {type: String, required: true},
    sentTryCount: {type: Number, required: true},
    retryType: {type: String, required: true},
    description: {type: String, required: true},
    status: {type: String, required: true}

3. collections: messagetexts
    type: {type: String, required: true},
    val: {type: String, required: true}

4. collections: timezones
    country: {type: String, required: true},
    timezone: {type: String, required: true}

5. collections: userprofiles
    firstName: {type: String, required: true},
    lastName: {type: String}, 
    email: {type: String, required: true},
    dates: {
        birthday: {
            date: {type: String, required:true},   // YYYY-MM-DD ex 2024-02-01
            month: {type: String, required: true},
            day: {type: String, required: true}
        },          
        anniversary: {
            date: {type: String, required:true},   // YYYY-MM-DD ex 2024-02-01
            month: {type: String, required: true},
            day: {type: String, required: true}
        }, 
        timeDifference: {type: String}
    },
    country: {type: String, required:true},
    role: {type: String}, 
    authentication: {
        password: {type: String, required: true, select: false},
        salt: {type: String, select: false},
        sessionToken: {type: String, select: false}
    }

API 
USERS
    REGISTER
    - admin: register 
    - user: register 

    - user: login 
            this login will create cookie that needed to run CRUD API (authtentication)

    CRUD
    - user: get all user list 
    - user: update data
    - user: delete
TIMEZONE 
    - timezone: add new timezone 
MESSAGE
    - message: add new message 

You can import postman api to run and setup the data 


CRON 
This cron is only to send birthday text based on user birth date and their location (timezone)
There is main cron that will run at 00:00 everyday to dispatch smaller cron (cron that used to post birthday text for each users)
if failed to post (3rd api) it will attempt to try again every 3 hours
if success then it will stop it self and update cron db (for report use if needed)
if user updating their birthday, then existing cron will be stopped and updating db, then it will create new cron based on their updated birthday 
if user updating their data without updating their birth day, then it will run as it is. 

notes: you may copy paste birthday cron to anniversary cron with minor changes 

Please feel free to let me know, you may let recruiter send to me for what I can do for you.

Thanks!
