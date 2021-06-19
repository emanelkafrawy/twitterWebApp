const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    userTo: { type: Schema.Types.ObjectId, ref: 'User' },
    userFrom: { type: Schema.Types.ObjectId, ref: 'User' },
    NotifiactionType: String,
    opened:{ type: Boolean, default: false},
    entityId: Schema.Types.ObjectId //from multi schema notifi from post or following or message....

}, { timestamps: true });


// statics->allow for defining functions that exist directly on your Model.
NotificationSchema.statics.insertNotification = async(userTo, userFrom, NotifiactionType, entityId) =>{
    var data = {
        userTo: userTo,
        userFrom: userFrom,
        NotifiactionType: NotifiactionType,
        entityId: entityId
    }
    await Notifiaction.deleteOne(data).catch(error => console.log(error));
    return Notifiaction.create(data).catch(error => console.log(error));
};

var Notifiaction = mongoose.model('Notification', NotificationSchema);
module.exports = Notifiaction;