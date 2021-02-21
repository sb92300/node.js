const express = require('express');
const app = express();
const bodyParser = require('body-parser');
//body-parser 사용 가능하게 함.
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');


app.use('/public', express.static('public'));
//내가 만든 css 파일을 사용하기 위해 작성 / public 폴더 안에 만들어 넣어야 됨. 미들웨어(요청과 응답 사이에 동작함) 라고 함

app.use(bodyParser.urlencoded({extended : true }));

var db;
MongoClient.connect('mongodb+srv://ID:PW@cluster0.hthnk.mongodb.net/DBNAME?retryWrites=true&w=majority', { useUnifiedTopology: true }, function(err, client) {
    
    if(err) return console.log(err)

    db = client.db('todoapp');

    app.listen(8000, function () {
        console.log('listening on 8000');
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

app.put('/edit', function(req, res) {
    db.collection('post').updateOne({_id : parseInt(req.body.id)}, {$set : {제목 : req.body.title , 날짜 : req.body.date }}, function(err, result) {
    // edit.ejs에서 input의 값을 가져올 때, req.body.input의 name 값 + int 값 이므로 parseInt 
    console.log('수정완료')
    res.redirect('/list');
    });
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
                    //$inc = operator라고 함 숫자를 증가 시킬 때 사용. 필요할 때 마다 검색
                    if(err) {return console.log(err)};
            });
         });    
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
