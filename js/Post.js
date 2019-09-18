const Mastodon = require('mastodon-api');
const Twit = require('twit');

const fs = require('fs');

const config = require('../config');

module.exports = class Post {

    constructor() {

        this.M = new Mastodon(config.mastodon);
        this.T = new Twit(config.twitter);
    }

    send(content) {

        this.sendTweet(content);
        this.sendToot(content);
    }

    sendTweet(content) {

        const T = this.T;

        const b64content = fs.readFileSync(content.media, {
            encoding: 'base64'
        });
        T.post('media/upload', {
            media_data: b64content
        }, function (err, data, response) {
            let mediaIdStr = data.media_id_string
            let meta_params = {
                media_id: mediaIdStr
            }
            T.post('media/metadata/create', meta_params, function (err, data, response) {
                if (!err) {
                    let params = {
                        status: content.text,
                        media_ids: [mediaIdStr]
                    }
                    T.post('statuses/update', params, function (err, data, response) {
                        console.log(data)
                    })
                }
            })
        });
    }

    sendToot(content) {

        const M = this.M;

        M.post('media', {
            file: fs.createReadStream(content.media)
        }).then(resp => {
            const id = resp.data.id;
            M.post('statuses', {
                status: content.text,
                media_ids: [id]
            })
        });
    }
}
