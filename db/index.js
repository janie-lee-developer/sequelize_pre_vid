// const { user } = require('pg/lib/defaults');
// const faker = require('faker');
const { faker } = require('@faker-js/faker');
const Sequelize = require('sequelize');
const { STRING, TEXT } = Sequelize;
const db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_users_db');

// console.log(faker.lorem.paragraphs(3));

const User = db.define('User', {
    email: {
        type: STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    bio: {
        type: TEXT
    }
});

//If not defined, this is a template.
User.beforeSave(user => {
    if (!user.bio) {
        user.bio = `${user.email} BIO is ${faker.lorem.paragraphs(3)}!`;
    }
})

const syncAndSeed = async () => {
    await db.sync({ force: true });
    await User.create({ email: 'moe@gmail.com', bio: 'This is the bio for Moe' });
    await User.create({ email: 'lucy@yahoo.com' });
    await User.create({ email: 'ethyl@aol.com' });
}

module.exports = {
    db,
    syncAndSeed,
    models: {
        User
    }
}