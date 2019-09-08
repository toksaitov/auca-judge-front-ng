const Sequelize =
    require('sequelize');
const mongoose =
    require("mongoose");

module.exports = function(params) {

    const Op =
        Sequelize.Op;
    const database =
        new Sequelize(
                params.databaseName,
                params.databaseUser,
                params.databasePassword, {
        'host': params.databaseHost,
        'port': params.databasePort,
        'dialect': params.databaseDialect,
        'dialectOptions': {
            'charset': 'utf8'
        }
    });

    const User = database.define('user', {
        'login': {
            'type': Sequelize.STRING,
            'allowNull': false,
            'unique': true
        },
        'credentials': {
            'type': Sequelize.STRING,
            'allowNull': false
        },
        'administrator': {
            'type': Sequelize.BOOLEAN,
            'allowNull': false,
            'defaultValue': false
        }
    });

    const Entry = database.define('entry', {
        'title': {
            'type': Sequelize.STRING,
            'allowNull': false
        },
        'content': {
            'type': Sequelize.TEXT,
            'allowNull': false
        },
        'language': {
            'type': Sequelize.TEXT,
            'allowNull': false
        },
        'tests': {
            'type': Sequelize.TEXT,
            'allowNull': false
        },
        'published': {
            'type': Sequelize.BOOLEAN,
            'allowNull': false,
            'defaultValue': true
        }
    });

    const Comment = database.define('comment', {
        'content': {
            'type': Sequelize.STRING,
            'allowNull': false
        }
    });

    User.hasMany(Entry);
    User.hasMany(Comment);

    Entry.belongsTo(User);
    Entry.hasMany(Comment);

    Comment.belongsTo(User);
    Comment.belongsTo(Entry);

    mongoose.connect(
        params.problemDatabaseURL, { }
    );
    mongoose.model(
        "Problem", require("./models/problem.js")
    );

    const db = {
        'connection':
            database,
        'problemConnection':
            mongoose,

        'user':
            User,
        'entry':
            Entry,
        'comment':
            Comment,

        'start': function() {

            return database.sync().then(() => {
                const credentials =
                    params.bcrypt.hashSync(
                        params.adminPassword,
                        params.bcryptSaltLength
                    );

                return User.upsert({
                    'login': 'administrator',
                    'credentials': credentials,
                    'administrator': true
                });
            }).then(() => {
                const credentials =
                    params.bcrypt.hashSync(
                        params.userPassword,
                        params.bcryptSaltLength
                    );

                return User.upsert({
                    'login': 'user',
                    'credentials': credentials,
                    'administrator': false
                });
            });

        }
    };

    return db;

};

