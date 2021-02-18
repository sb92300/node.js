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
MongoClient.connect('mongodb+srv://<id>:<pw>@cluster0.hthnk.mongodb.net/<dbname>?retryWrites=true&w=majority', function(err, client) {
    
    if(err) return console.log(err)

    db = client.db('todoapp');

    app.listen(8000, function () {
        console.log('listening on 8000');
    });
});

//mongodb는 이 url로 접속해주세요.


//index.html 불러오기
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
//wirte.html 불러오기
app.get('/write', (req, res) => {
    res.sendFile(__dirname + '/write.html')
});

//write.html에서 form태그 서버에 보내기
app.post('/newPost', function(req, res){
    res.send('전송완료');
    db.collection('counter').findOne({name : '게시물개수'}, function(err, result){
        console.log(result.totalPost);
        var totalPost = result.totalPost;

        db.collection('post').insertOne({ _id : totalPost + 1, 제목 : req.body.title , 날짜 : req.body.date}, function(err, result) {
            if(err) console.log(err);
            console.log('저장완료');
            //counter라는 collection에 totalPost라는 항목에 1을 증가시키기.
            db.collection('counter').updateOne({name : '게시물개수'}, { $inc : {totalPost : 1}}, function(err, result){
                    //$inc = operator라고 함. 필요할 때 마다 검색
                    if(err) {return console.log(err)};
            });
         });    
    });
});

//list접속하면 db 저장된 자료 html로 보여주기
app.get('/list', function(req, res) {
    db.collection('post').find().toArray(function(err, result){ // post라는 이름을 가진 db에서 모든 데이터 찾아서 갖고 오는 문법
        console.log(result);
        res.render('list.ejs', {posts : result});
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