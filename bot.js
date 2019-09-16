const WIDTH = 1280;
const HEIGHT = 1280;

const GIFEncoder = require('gifencoder');
const encoder = new GIFEncoder(WIDTH, HEIGHT);

const {
    createCanvas
} = require('canvas');
const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

const fs = require('fs');
const imagemin = require('imagemin');
const imageminGifsicle = require('imagemin-gifsicle');

const Mastodon = require('mastodon-api');
const Twit = require('twit');

const config = require('./config');
const guideWords = require('./guide-words');

function main() {

    let content = {
        'text': getText(),
        'media': makeGif()
    }
    sendToot(content);
    sendTweet(content);

    console.log(content);
}

function getText() {

    const distance = Math.floor(Math.random() * 23) + 8;
    const length = guideWords.words.length - distance - 1;
    const place = Math.floor(Math.random() * length);

    const prefix = guideWords.words[place];
    const suffix = guideWords.words[place + distance];

    return [prefix, suffix].join('·');
}

function makeGif() {

    // let gifLength;
    // let grid = makeGrid();
    // let noise = getNoise();
    // let colors = getColors();
    // let velocity;

    // draw(grid, noise, colors, gifLength);

    // optimiseGif();

    return '';
}

function sendToot(content) {

    const M = new Mastodon(config.mastodon);

    M.post('statuses', {
        status: content.text
    });

    // M.post('media', {
    //     file: fs.createReadStream(content.media)
    // }).then(resp => {
    //     const id = resp.data.id;
    //     M.post('statuses', {
    //         status: content.text,
    //         media_ids: [id]
    //     })
    // });

}

function sendTweet(content) {

    const T = new Twit(config.twitter);

    T.post('statuses/update', {
        status: content.text
    }, function (err, data, response) {
        console.log(data)
    })

    // const b64content = fs.readFileSync(content.media, {
    //     encoding: 'base64'
    // });
    // T.post('media/upload', {
    //     media_data: b64content
    // }, function (err, data, response) {
    //     let mediaIdStr = data.media_id_string
    //     let meta_params = {
    //         media_id: mediaIdStr
    //     }
    //     T.post('media/metadata/create', meta_params, function (err, data, response) {
    //         if (!err) {
    //             let params = {
    //                 status: content.text,
    //                 media_ids: [mediaIdStr]
    //             }
    //             T.post('statuses/update', params, function (err, data, response) {
    //                 console.log(data)
    //             })
    //         }
    //     })
    // });

}

main();
