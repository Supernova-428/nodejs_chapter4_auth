// 필요한 모듈들을 불러옵니다.
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const posts = require('./posts')

const app = express();
const secretText = 'superSecret';
const refreshSecretText = 'supersuperSecret';

let refreshTokens = [];

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin : 'http://127.0.0.1:5500',
    methods: 'POST, GET'
}))

app.post('/login', (req, res) => {
    const username = req.body.username;
    const user = {name: username};

    const accessToken = jwt.sign(user, secretText, {expiresIn: '30s'});

    const refreshToken = jwt.sign(user, refreshSecretText, {expiresIn: '1d'});
    refreshTokens.push(refreshToken)

    res.cookie('jwt', refreshToken, {httpOnly: true, maxAge: 24 * 6 * 60 * 1000})

    res.json({accessToken: accessToken})
})

app.get('/posts', authMiddleware, (req, res) => {
    res.json(posts)
})

function authMiddleware(req, res, next) {
    // 토큰을 request headers에서 가져오기
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.sendStatus(401);

    jwt.verify(token, secretText, (err, user) => {
        if(err) return res.sendStatus(403);
        req.user = user;
        next();
    })
}

// 서버가 4000번 포트에서 듣기를 시작합니다. 서버가 시작되면 콘솔에 메시지를 출력합니다.
const port = 4000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
