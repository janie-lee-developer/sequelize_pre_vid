const {db, syncAndSeed, models: {User}} = require('./db');
const path = require('path');
const express = require('express');
const app = express();
const { append } = require('express/lib/response');

app.use(express.urlencoded({extended: false}));
app.use(require('method-override')('_method'));

app.get('/styles.css', (req, res) => res.sendFile(path.join(__dirname, 'styles.css')));

app.get('/', (req, res) => res.redirect('/users'));
  
app.delete('/users/:id', async(req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        await user.destroy();
        res.redirect('/users');
    }
    catch(ex) {
        next(ex);
    }
})

app.post('/users',async (req, res, next) => {
    try {
        const user = await User.create(req.body);
        res.redirect(`/users/${ user.id }`);
    }
    catch(ex) {
        next(ex);
    }
} )
app.get('/users', async(req, res, next) => {
    try{
        const users = await User.findAll(); 
        res.send(`
            <html>
                <head>
                    <link rel='stylesheet' href='/styles.css'/>
                </head>
                <body>
                    <h1>Users (${users.length})</h1>
                    <form method='POST' id='user-form'>
                        <input name='email' placeHolder='enter email' />
                        <textarea name='bio'></textarea>
                        <button>Create</button>
                    </form>
                    <ul>
                        ${ users.map(user => `
                            <li>
                                <a href='/users/${user.id}'>
                                ${user.email}
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </body>
            </html>
        `);
    } catch(ex) {
        next(ex);
    }
});

app.get('/users/:id', async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        const users = await User.findAll();
        res.send(`
            <html>
                <head>
                    <link rel='stylesheet' href='/styles.css'/>
                </head>
                <body>
                    <h1>Users ${users.length}</h1>
                                <a href='/users/'>
                                ${user.email}
                                </a>
                                <p>
                                ${user.bio}
                                </p>
                    <form method='POST' action='/users/${users.id}?_method=DELETE'>
                        <button>X</button> 
                    </form>
                </body>
            </html>
        `);
    } catch (ex) {
        next(ex);
    }
})

const initt = async() => {
    try {
        await db.authenticate();
        if (process.env.SYNC) {
            await syncAndSeed();
        } 
       
        // console.log(await User.findAll());
        // await User.findAll();
        
        const port = process.env.PORT || 1337;
        app.listen(port, ()=> console.log(`listening on port ${port}`));
    }
    catch(ex) {
        console.log(ex);
    }
}

initt();

/*const {Client} = require('pg');
const client = new Client(process.env.DATABASE_URL || 'postgres://localhost/acme_users_db');

const syncAndSeed = async() => {
    const SQL =    `
        DROP TABLE IF EXISTS "Users";
        CREATE TABLE "Users"(
            id SERIAL PRIMARY KEY,
            email VARCHAR(50) NOT NULL UNIQUE
        );
    `;
    await client.query(SQL);
}

const getUsers = async() => {
    return (await client.query('SELECT * FROM "Users";')).rows;
}

const createUser = async({email}) => {
    return (await client.query('INSERT INTO "Users"(email) VALUES($1) RETURNING *', [email])).rows[0];
}

const init = async() => {
    try{
        await client.connect();
        await syncAndSeed();
        const user = await createUser({email:'moe@gmail.com'});
        console.log(await getUsers());
    }
    catch(ex) {
        console.log(ex);
    }
}

init();
*/