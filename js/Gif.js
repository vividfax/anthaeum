const gifEncoder = require('gifencoder');
const imagemin = require('imagemin');
const imageminGifsicle = require('imagemin-gifsicle');

const fs = require('fs');

module.exports = class Gif {

    constructor(path, ctx) {

        this.path = path;
        this.ctx = ctx;

        this.encoder = new gifEncoder(ctx.canvas.width, ctx.canvas.height);
    }

    start() {

        const encoder = this.encoder;
        encoder.createReadStream().pipe(fs.createWriteStream(this.path));
        encoder.start();

        encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
        encoder.setDelay(1000 / 5); // frame delay in ms
        encoder.setQuality(1); // color quality. 1 to 20. low is good but slow

        console.log('Making gif...');
    }

    saveFrame() {

        this.encoder.addFrame(this.ctx);
        console.log('+');
    }

    end() {

        this.encoder.finish();
        console.log('Saved gif');
    }

    optimise() {

        imagemin([this.path], '.', {
            use: [imageminGifsicle({

                colors: 100, // 2 to 256. fewer colors for smaller file
                optimizationLevel: 3 // 1 to 3. high is good but slow
            })]
        }).then(() => {
            console.log('Optimized gif');
        });
    }
}
