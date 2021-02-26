const express = require('express');
const app = express();
const bodyParser = require('body-parser');
//body-parser 사용 가능하게 함.
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const http = require('http').Server(app);
const io = require('socket.io')(http);

require('dotenv').config();

app.use(methodOverride('_method'));
app.use(session({secret : '비밀코드', resave: true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/shop', require('./routes/shop.js'));
//route폴더에 있는 shop.js를 불러올 때 쓰는 문법

app.use('/board/sub', require('./routes/board.js'));
app.set('view engine', 'ejs');


app.use('/public', express.static('public'));
//내가 만든 css 파일을 사용하기 위해 작성 / public 폴더 안에 만들어 넣어야 됨. 미들웨어(요청과 응답 사이에 동작함) 라고 함

app.use(bodyParser.urlencoded({extended : true }));

var db;
MongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, function(err, client) {
    
    if(err) return console.log(err)

    db = client.db('todoapp');

    http.listen(process.env.PORT, function () {
        console.log('listening on 8080');
    });
});

//mongodb는 이 url로 접속해주세요.


//index.html 불러오기
app.get('/', function(req, res) {
    res.render('index.ejs');
});
//wirte.html 불러오기
app.get('/write', (req, res) => {
    res.render('write.ejs');
});

//list접속하면 db 저장된 자료 html로 보여주기
app.get('/list', function(req, res) {
    db.collection('post').find().toArray(function(err, result){ // post라는 이름을 가진 db에서 모든 데이터 찾아서 갖고 오는 문법
        console.log(result);
        //가져온 값 = result
        res.render('list.ejs', {posts : result});
        // 가져온 값(result)을 posts라고 이름 짓고 렌더링 함. 그러므로 ejs 파일에서는 이 값을 부를 때 posts.제목으로 불러야 됨.
    });
});

app.get('/detail/:id', function(req, res) {
    //user가 /detail/??으로 접속하면
    db.collection('post').findOne({_id : parseInt(req.params.id) }, function(err, result) {
        //db에서 req.params.id 값에 맞는 게시물을 찾아온다. (찾은 게시물 = result)
        //req.params.id == '/detail/:id / 단순히 req.params.id라고 입력하면 id값이 string. 우리는 int값으로 저장했기 때문에 parseInt를 이용해 값을 int로 변경해준다.
        console.log(result);
        res.render('detail.ejs', { data : result });
        //data라는 이름의 찾은 게시물을 렌더링 해준다 (data는 임의로 지은 이름)
    });
});

app.get('/edit/:id', function(req, res) {
    db.collection('post').findOne({_id : parseInt(req.params.id) }, function(err, result) {
        console.log(result);
        res.render('edit.ejs', {post : result });
    });
});

app.get('/login', function(req, res) {
    res.render('login.ejs');
});

app.get('/mypage', checkLogin, function(req, res) {
    //checkLogin 위치가 미들웨어 넣는 위치. mypage로 요청을 하면 checkLogin이 항상 실행 됨.
    console.log(req.user);
    res.render('mypage.ejs', {user : req.user});
    //('mypage.ejs', {이 중괄호를 이용하여 ejs 안에 데이터를 넣을 수 있음})
});

app.get('/chat', function(req, res) {
    res.render('chat.ejs');
});
function checkLogin(req, res , next) {
    if(req.user) {
        next();
        //로그인 후 세션이 있으면 req.user가 항상 있음. 그러므로 req.user가 있으면(로그인해서 세션이 있으면) next()(통과)
    } else {
        res.send('login이 되어있지 않습니다.');
    }
}

app.get('/ownerCheck', function() {
    res.render('ownerCheck.ejs');
});

app.put('/edit', function(req, res) {
    db.collection('post').updateOne({_id : parseInt(req.body.id)}, {$set : {제목 : req.body.title , 날짜 : req.body.date }}, function(err, result) {
    // edit.ejs에서 input의 값을 가져올 때, req.body.input의 name 값 + int 값 이므로 parseInt 
    console.log('수정완료')
    res.redirect('/list');
    });
});

//write.html에서 form태그 서버에 보내기
app.post('/newPost', function(req, res){
    db.collection('counter').findOne({name : '게시물개수'}, function(err, result){
        console.log(result.totalPost);
        var totalPost = result.totalPost;

        db.collection('post').insertOne({ _id : totalPost + 1, 제목 : req.body.title , 날짜 : req.body.date}, function(err, result) {
            if(err) console.log(err);
            console.log('저장완료');
            //counter라는 collection에 totalPost라는 항목에 1을 증가시키기.
            db.collection('counter').updateOne({name : '게시물개수'}, { $inc : {totalPost : 1}}, function(err, result){
                    //$inc = operator라고 함 숫자를 증가 시킬 때 사용. 필요할 때 마다 검색
                    if(err) {return console.log(err)};
                    res.send('전송완료');        
            });
         });    
    });
});

app.post('/login', passport.authenticate('local', {
    //local이라는 방식으로 회원을 인증한다.
    failureRedirect : '/fail'
    //인증 실패시 /fail로 이동
}) ,function(req, res) {
    res.redirect('/');
});

//passport를 이용하여 user의 아이디, 비밀번호 DB에 저장된 값이랑 비교하기
passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password',
    //form에 있는 input창의 name 값
    session: true,
    passReqToCallback: false,
  }, function ( userId, userPw, done) {
      //userId = 유저가 입력한 아이디 userPw = 유저가 입력한 비번
    //console.log( userId, userPw);
    db.collection('login').findOne({ id:  userId }, function (err, result) {
      if (err) return done(err)
  
      if (!result) return done(null, false, { message: '존재하지않는 아이디 입니다.' })
      if (userPw == result.pw) {
        return done(null, result)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));

passport.serializeUser(function(user, done) {
    //로그인 성공시 세션을 저장시키는 코드 user라는 인자 값은 위의 if(userPw == result.pw)에서 return된 result값 (아이디 비번이 다 맞을 때 발동하는 코드 이므로)
    done( null, user.id )
    //id를 이용해서 세션을 저장시키는 코드
    });
passport.deserializeUser(function(id, done) {
    //id == user.id
    db.collection('login').findOne({ id : id }, function(err, result) {
            //로그인 한 유저의 개인정보를 DB에서 찾는 역할
        done(null, result);
    });
});

app.delete('/delete', function(req, res) {
    console.log(req.body);
    req.body._id = parseInt(req.body._id); // parseInt함수를 이용하여 {_id : '1' }인 값을 {_id : 1}로 string을 int로 변경해준다. 
    db.collection('post').deleteOne(req.body, function(err, result){
        console.log('complete delete');
        res.status(200).send({message : ' delete success!'});
    });
});

app.get('/upload', function(req, res) {
    res.render('upload.ejs');
});

let multer = require('multer');
var storage = multer.diskStorage({
    //diskStorage = 하드에 저장하기, memoryStorage = RAM에 저장하기 (휘발성)
    destination : function(req, file, cb) {
        cb(null, './public/image');
        //저장 경로
    },
    filename : function(req, file, cb) {
        cb(null, file.originalname);
        //저장시 파일 원명 그대로 저장하기
    }
});

var upload = multer({ storage : storage });
app.post('/upload', upload.single('profile'), function(req, res) {
    //upload.single('이미지를 받아오는 input의 name 값')
    //upload.single 대신 upload.array('profile', 10)라고 변경하면 10개까지 다중 선택 가능 / 단 input도 바꿔야 됨.
    res.send('업로드 완료');
});

app.get('/image/:imageName', function(req, res) {
    res.sendFile( __dirname + '/public/image/' + req.params.imageName )
});

io.on('connection', function(socket) {
    //socket.io 문법, socket이 연결 될 때마다
    //console.log 실행 / chat.ejs에 연결되어 있기에 chat.ejs에 접근하면 콘솔 뜸
    console.log('socket is connection!');

    socket.on('chat', function(data) {
        //인사말이라는 이벤트가 발생하면 (chat.ejs에서 보낸 것) 코드 실행
        console.log(data);
        io.emit('share', data);
    })
});

