const chalk = require('chalk');

const {white, cyan, yellow, green, red, gray} = chalk;

const LEVELS = {
        default: {
                color: white,
                prefix: white('[LOG]'),
        },
        info: {
                color: cyan,
                prefix: cyan('[INFO]'),
        },
        warn: {
                color: yellow,
                prefix: yellow('[WARN]'),
        },
        debug: {
                color: yellow,
                prefix: green('[DEBUG]'),
        },
        error: {
                color: red,
                prefix: red('[ERROR]'),
        },
};

function info(message) {
        log(message, LEVELS.info);
}

function warn(message) {
        log(message, LEVELS.warn);
}

function debug(message) {
        log(message, LEVELS.debug);
}

function error(message) {
        log(message, LEVELS.error);
}

function skipline() {
        console.log('');
}

function log(message, level = LEVELS.info) {
        if (!message) {
                return;
        }

        const date = new Date().toLocaleString();

        const formatted = `${gray(date)} - ${level.prefix} ${level.color(message)}`;
        console.log(formatted);
}

module.exports = {
        LEVELS,
        log,
        info,
        warn,
        debug,
        error,
        skipline,
};