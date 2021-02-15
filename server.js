const express = require('express');
const app = express();
const bodyParser = require('body-parser');
//body-parser 사용 가능하게 함.
app.use(bodyParser.urlencoded({extended : true }));
//8080포트를 열어주고 이 포트로 접근해야만 서버를 열어줌
app.listen(8080, function () {
    console.log('listening on 8080');
});
// 8080 = 서버 띄울 포트 번호 function은 포트 띄운 후 실행 코드

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
//write.html에서 form태그 서버에 보내기
app.post('/add', function(req, res){
    res.send('전송완료');
    console.log(req.body.title);
    console.log(req.body.date);
});