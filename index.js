const express = require('express')
const app = express()
const port = 4000
const cookieParser = require('cookie-parser');
const { User } = require('./models/User');
const { auth } = require('./middleware/auth');
// const bodyParser = require('body-parser');
const config = require('./config/key');

// application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));
// application/json
app.use(express.json());
app.use(cookieParser());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI)
  .then(() => console.log('MongoDB Connnected...'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/api/users/register', (req, res) => {
  // 회원 가입 할 때 필요한 정보들을 client에서 가져오면
  // 그것들을 데이터 베이스에 넣어준다.
  const user = new User(req.body);

  user
    .save()
    .then(() => {
      res
        .status(200)
        .json({
          success: true,
        });
    })
    .catch((err) => {
      res.json({
        success: false,
        err: err,
      });
    });
  
});

app.post('/api/users/login', async (req, res) => {

  // 요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({email: req.body.email})
    .then((user) => {
      if(!user) {
        return res.json({
          oginSuccess: false,
          message: '제공된 이메일에 해당하는 유저가 없습니다.'
        });
      }

      // 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
      user.comparePassword(req.body.password, (err, isMatch) => {
        if(!isMatch)
          return res.json({ loginSuccess: false, message: '비밀번호가 틀렸습니다.' });
      });

      // 비밀번호까지 맞다면 토큰을 생성한다.
      user.generateToken((err, user) => {
        if(err) return res.status(400).send(err);

        // 토큰을 저장한다. 어디에?
        res.cookie('x_auth', user.token)
          .status(200)
          .json({
            loginSuccess: true,
            userId: user._id
          });
      });  

    });   
});

app.get('/api/users/auth', auth, (req, res) => {
  // console.log(req);
  // res.status(200).json({
  //   auth: true,
  // });
  //여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication 이 true 라는 말
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  });
});

app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({_id: req.user._id},
    { token: ''})
    .then((user) => {            
      return res.status(200).send({
        success: true
      });
    })
    .catch((err) => {
      return res.json({ success: false })
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
