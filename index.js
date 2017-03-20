'use strcit';
var express = require('express');
var app = express();
var fileUpload = require('express-fileupload');
var fs = require('fs')
const Parser = require('./lib/parser');
var Promise = require('bluebird');

app.set('views', 'views');
app.set('view engine', 'pug');
app.use(fileUpload());

/**
 * Render the upload view when there is 
 * a request to get the root page
 */
app.get('/', (req, resp) => {
    resp.render('index', {});
});

app.post('/upload', (req, resp) => {
    if (!req.files) {
        // File not received
        return resp.status(400).send('No files were uploaded.');
    } else {
        // File has been received
        let fileName = req.files.fupload.name;
        let locationToUpload = `D:/${fileName}`;
        req.files.fupload.mv(locationToUpload, (err) => {
            if (err)
                return resp.status(500).send(err);
            else {
                Promise.coroutine(function* () {
                    try {
                        let lineReader = yield Parser.parse(locationToUpload);
                        lineReader.on('line', (line) => {
                            console.log(line + '---');
                            Parser.detectAttack(line).then((attackInfo) => {
                                if (attackInfo.status) {
                                    // Attack detected!
                                    resp.write(`Yes, ${line} \n`);
                                }
                            }).catch((err) => {

                            });
                        });

                        lineReader.on('close', () => {
                            resp.end();
                        });
                    } catch (err) {
                        resp.json(err);
                    }

                })();
            }
        });
    }
});

app.listen(3000);