require('dotenv').config();
const express = require('express');
const app = express();

const session = require('express-session');
const pgp = require('pg-promise')();
const connectPgSimple = require('connect-pg-simple')(session);
const flash = require('connect-flash');
const routes = require('./routes');
const path = require('path');
const helmet = require('helmet');
const csrf = require('csurf');
const { middlewareGlobal, checkCsrfError, csrfMiddleware } = require('./src/middlewares/middleware');

const cn = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};

const db = pgp(cn)
  

app.use(helmet());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'public')));

const sessionOptions = session({
  secret: 'akasdfj0út23453456+54qt23qv  qwf qwer qwer qewr asdasdasda a6()',
  store: new connectPgSimple({
    pool: db,
    tableName: 'session',
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true
  }
});

app.use(sessionOptions)
app.use(flash());

db.query('SELECT now()')
  .then(() => {
    console.log('Conexão com o banco de dados realizada com sucesso!')
  })
  .catch((e) => {
    console.log('Erro ao conectar ao banco de dados: ', e);
  })

app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

app.use(csrf());
// Nossos próprios middlewares
app.use(middlewareGlobal);
app.use(checkCsrfError);
app.use(csrfMiddleware);
app.use(routes);

app.listen(process.env.PORT, () => {
  console.log(`Acessar http://localhost:${process.env.PORT}`);
  console.log(`Servidor executando na porta ${process.env.PORT}`);
});