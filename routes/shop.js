var router = require('express').Router(); //express의 router라는 함수를 사용한다는 의미

function checkLogin(req, res , next) {
    if(req.user) {
        next();
        //로그인 후 세션이 있으면 req.user가 항상 있음. 그러므로 req.user가 있으면(로그인해서 세션이 있으면) next()(통과)
    } else {
        res.send('login이 되어있지 않습니다.');
    };
};

router.use(checkLogin);
//미들웨어를 이렇게 작성하면 밑에 나오는 모든 라우터에 checkLogin을 실행
//router.use('/shirts', checkLogin); 으로 적으면 /shirts에만 적용할 수 있음.
router.get('/shirts', function(req, res) {
    res.send('sale shirts');
});
//app.get 대신 router.get

router.get('/pants', function(req, res) {
    res.send('sales pants');
});

module.exports = router;
//module.exports = 내보낼 변수 명