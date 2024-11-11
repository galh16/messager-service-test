import mongoose from 'mongoose';

const TimeZoneSchema = new mongoose.Schema({
    country: {type: String, required: true},
    timezone: {type: String, required: true}
});

export const TimeZoneModel = mongoose.model('TimeZone', TimeZoneSchema);

export const getTimeZone= () => TimeZoneModel.find();
export const getTimeZoneByCountry = (country: string) => TimeZoneModel.find({country});
export const getTimeZoneByCountryTimezone = (country: string, timezone: string) => TimeZoneModel.find({country, timezone});
export const getTimeZoneById = (id: string) => TimeZoneModel.findById(id);
export const createTimeZone = (values: Record<string, any>) => new TimeZoneModel(values).save().then(
    (data) => data.toObject()
);
export const deleteTimeZoneById = (id: string) => TimeZoneModel.findOneAndDelete({_id: id});
export const updateTimeZoneById = (id: string, values: Record<string, any>) => 
    TimeZoneModel.findByIdAndUpdate(id, values);