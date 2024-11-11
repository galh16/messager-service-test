import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
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
});

export const UserProfileModel = mongoose.model('UserProfile', UserProfileSchema);

export const getUserProfiles = () => UserProfileModel.find();
export const getUserProfileByEmail = (email: string) => UserProfileModel.find({email});
export const getUserProfileBySessionToken = (sessionToken: string) => UserProfileModel.findOne({
    'authentication.sessionToken' : sessionToken
});
export const getUserProfileById = (id: string) => UserProfileModel.findById(id);
export const createUserProfile = (values: Record<string, any>) => new UserProfileModel(values).save().then(
    (data) => data.toObject()
);
export const deleteUserProfileById = (id: string) => UserProfileModel.findOneAndDelete({_id: id});
export const updateUserProfileById = (id: string, values: Record<string, any>) => 
    UserProfileModel.findByIdAndUpdate(id, values);

export const getUserProfileByBirthday = (month: string, day: string) => UserProfileModel.find({
    "dates.birthday.month": month,
    "dates.birthday.day": day
});

