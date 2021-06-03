const mongoose = require('mongoose');

const discordSchema = mongoose.Schema({
    channelName: String,
    conversation: [
        {
            message: String,
            timestamp: String,
            user: {
                displayName: String,
                email: String,
                photo: String,
                uid: String
            }
        }
    ]
});

const conversations =  mongoose.model('conversations', discordSchema)
module.exports = conversations;

//export default mongoose.model('conversations', discordSchema)