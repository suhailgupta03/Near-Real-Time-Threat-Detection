'use strict';

var readline = require('readline');
var fs = require('fs');
var Promise = require('bluebird');
var geoip = require('geoip-lite');


class Parser {

    /**
     * Returns line reader object to listen to 
     * line event on success. Returns an error
     * object on failure
     * @param fileLocation {string}
     */
    static parse(fileLocation) {
        return new Promise((resolve, reject) => {
            try {
                if (fileLocation) {
                    resolve(readline.createInterface({
                        input: fs.createReadStream(fileLocation)
                    }));
                } else {
                    throw new Error('File location missing!');
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    static detectAttack(logLine) {
        return new Promise((resolve, reject) => {
            try {
                if (logLine) {
                    // Check if the client header is "MATLAB R2013a"
                    // If yes, there is an attack
                    let clientHeaderInfo = logLine.match(/HTTP\/\d{1}.?\d?[\s"]+MATLAB R2013a/);
                    if (clientHeaderInfo && clientHeaderInfo.length > 0) {
                        // Attack!
                        resolve({ status: true, statement: `Yes, ${logLine}\n` });
                    }

                    // Check if client ip is from India
                    // If not from India, there is an attack
                    let clientIP = logLine.match(/[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}/);
                    if (clientIP && clientIP.length > 0) {
                        let geo = geoip.lookup(clientIP[0]);
                        if (geo && geo.country !== 'IN') {
                            // Attack!!
                            resolve({ status: true, statement: `Yes, ${logLine}` });
                        } else {
                            throw new Error('No attack detected!');
                        }
                    }
                } else {
                    throw new Error('Logline missing');
                }
            } catch (err) {
                err['status'] = false;
                reject(err);
            }
        });
    }
}

module.exports = Parser;