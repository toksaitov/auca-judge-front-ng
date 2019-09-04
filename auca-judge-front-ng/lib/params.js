const bcrypt =
    require('bcryptjs');
const dotenv =
    require('dotenv').config();

let databaseHost =
    process.env['AUCA_JUDGE_FRONT_DATABASE_HOST'];
let problemDatabaseURL =
    process.env['AUCA_JUDGE_FRONT_PROBLEM_DATABASE_URL'];
let databasePort =
    process.env['AUCA_JUDGE_FRONT_DATABASE_PORT'];
let databaseDialect =
    process.env['AUCA_JUDGE_FRONT_DATABASE_DIALECT'];
let databaseName =
    process.env['AUCA_JUDGE_FRONT_DATABASE_NAME'];
let databaseUser =
    process.env['AUCA_JUDGE_FRONT_DATABASE_USER'];
let databasePassword =
    process.env['AUCA_JUDGE_FRONT_DATABASE_PASSWORD'];

if (databaseHost == null) {
    databaseHost = 'localhost';

    console.warn(
        'The database host "AUCA_JUDGE_FRONT_DATABASE_HOST" is not set in the ' +
        `".env" file. Assuming the database host is "${databaseHost}".`
    );
}

if (problemDatabaseURL == null) {
    problemDatabaseURL = 'mongodb://localhost:27017/auca-judge';

    console.warn(
        'The database URL "AUCA_JUDGE_FRONT_PROBLEM_DATABASE_URL" is not set in the ' +
        `".env" file. Assuming the database URL is "${problemDatabaseURL}".`
    );
}

if (databasePort == null) {
    databasePort = '3306';

    console.warn(
        'The database port "AUCA_JUDGE_FRONT_DATABASE_PORT" is not set in the ' +
        `".env" file. Assuming the database port is "${databasePort}".`
    );
}

if (databaseDialect == null) {
    databaseDialect = 'mysql';

    console.warn(
        'The database dialect "AUCA_JUDGE_FRONT_DATABASE_DIALECT" is not set in the ' +
        `".env" file. Assuming the database dialect is "${databaseDialect}".`
    );
}

if (databaseName == null) {
    databaseName = 'auca_judge_front';

    console.warn(
        'The database name "AUCA_JUDGE_FRONT_DATABASE_NAME" is not set in the ' +
        `".env" file. Assuming the name of the database is "${databaseName}".`
    );
}

if (databaseUser == null) {
    databaseUser = 'auca_judge_front_user';

    console.warn(
        'The database user "AUCA_JUDGE_FRONT_DATABASE_USER" is not set in the ' +
        `".env" file. Assuming the name of the user is "${databaseUser}".`
    );
}

if (databasePassword == null) {
    databasePassword = '';

    console.warn(
        'The database password "AUCA_JUDGE_FRONT_DATABASE_PASSWORD" is not set in the ' +
        '".env" file. Assuming this is an unsecured development or testing ' +
        'database without a password.'
    );
}

let serverPort = process.env['AUCA_JUDGE_FRONT_SERVER_PORT'];
if (serverPort == null) {
    serverPort = '8080';

    console.warn(
        'The server port "AUCA_JUDGE_FRONT_SERVER_PORT" is not set in the ' +
        `".env" file. Assuming the server port is "${serverPort}".`
    );
}

const sessionSecret = process.env['AUCA_JUDGE_FRONT_SESSION_SECRET'];
if (!sessionSecret) {
    throw new Error(
        'The session secret "AUCA_JUDGE_FRONT_SESSION_SECRET" is not set in the ' +
        '".env" file. Please, fix that and restart the server.'
    );
}

const jwtSecret = process.env['AUCA_JUDGE_FRONT_JWT_SECRET'];
if (!jwtSecret) {
    throw new Error(
        'The session secret "AUCA_JUDGE_FRONT_JWT_SECRET" is not set in the ' +
        '".env" file. Please, fix that and restart the server.'
    );
}

const bcryptSaltLength =
    parseFloat(process.env['AUCA_JUDGE_FRONT_BCRYPT_SALT_LENGTH'] || '32');

const adminPassword = process.env['AUCA_JUDGE_FRONT_ADMIN_PASSWORD'];
if (!adminPassword) {
    throw new Error(
        'The administrator\'s password "AUCA_JUDGE_FRONT_ADMIN_PASSWORD" is not set in the ' +
        '".env" file. Please, fix that and restart the server.'
    );
}

const userPassword = process.env['AUCA_JUDGE_FRONT_USER_PASSWORD'];
if (!userPassword) {
    throw new Error(
        'The test user\'s password "AUCA_JUDGE_FRONT_USER_PASSWORD" is not set in the ' +
        '".env" file. Please, fix that and restart the server.'
    );
}

const params = {
    'databaseHost':
        databaseHost,
    'problemDatabaseURL':
        problemDatabaseURL,
    'databasePort':
        databasePort,
    'databaseDialect':
        databaseDialect,
    'databaseName':
        databaseName,
    'databaseUser':
        databaseUser,
    'databasePassword':
        databasePassword,
    'serverPort':
        serverPort,
    'sessionSecret':
        sessionSecret,
    'jwtSecret':
        jwtSecret,
    'bcrypt':
        bcrypt,
    'bcryptSaltLength':
        bcryptSaltLength,
    'adminPassword':
        adminPassword,
    'userPassword':
        userPassword
};

module.exports =
    params;

