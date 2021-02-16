const express = require('express');
const app = express();
const bodyParser = require('body-parser');
//body-parser 사용 가능하게 함.
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended : true }));
//8080포트를 열어주고 이 포트로 접근해야만 서버를 열어줌
// app.listen(8080, function () {
//     console.log('listening on 8080');
// });
// 8080 = 서버 띄울 포트 번호 function은 포트 띄운 후 실행 코드

var db;
MongoClient.connect('mongodb+srv://몽고db ID: 비밀번호@cluster0.hthnk.mongodb.net/DB 이름?retryWrites=true&w=majority', function(err, client) {
    
    if(err) return console.log(err)

    db = client.db('todoapp');

    app.listen(8000, function () {
        console.log('listening on 8000');
    });
});

//mongodb는 이 url로 접속해주세요.


app.get('/pet', function(요청 , 응답) {
    응답.send('고양이가 좋아요? 강아지가 좋아요?')
});
//요청 = req, 응답 = res 보기 쉽게 하려고 일단 한글로.

app.get('/beauty', function(req, res) {
    res.send('이뻐지고 싶습니까?');
});
//index.html 불러오기
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
//wirte.html 불러오기
app.get('/write', (req, res) => {
    res.sendFile(__dirname + '/write.html')
});
//list접속하면 db 저장된 자료 html로 보여주기
app.get('/list', function(req, res) {
    res.render('list.ejs');
});

//write.html에서 form태그 서버에 보내기
app.post('/newPost', function(req, res){
    res.send('전송완료');
    db.collection('post').insertOne({_id : 1 , 제목 : req.body.title , 날짜 : req.body.date}, function(err, result) {
        if(err) console.log(err);
        console.log('저장완료');
    });
});