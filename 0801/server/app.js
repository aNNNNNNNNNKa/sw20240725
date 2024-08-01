const http = require('http');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

app.set('views', path.join(__dirname, 'views') );
app.set('view engine', 'ejs');
app.set('port', 3000);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.end('{"hello":"world"}');
    var obj = {no:120, name:"HONG"};
});

app.get('/data', (req, res) => {
    const user = req.query.user;
    const message = req.query.message;
    const jsonData = {user, message};

    res.send(jsonData);
});

const todoList = [
    {no: 101, title:'자연 보호 하기', done:true},
    {no: 102, title:'엄마 생일 선물', done:false},
    {no: 103, title:'아빠 집 사주기', done:true},
    {no: 104, title:'취직 하기', done:false},
    {no: 105, title:'여친 여행 시켜주기', done:false}
];

var noSeq = 106;

// 검색
app.get('/todo/search', (req, res) => {
    var keyword = req.query.keyword;
    var newTodoList = todoList.filter((todo) => {
        return todo.title.findIndex(keyword) != -1;
    }); 
    res.send(newtodoList);
});

// 상세보기
app.get('/todo/search', (req, res) => {
    if(req.query.no){
        var no = req.query.no;
        var idx = todoList.findIndex((t) => {
            return t.no == no;
        });
        if(idx != -1){
            res.send(todoList[idx]);
        }
        else{
            res.send(null);
        }
        return;
    }
    res.send(todoList);
});

// 입력
app.post('/todo', (req, res) => {
    var title = req.body.title;
    todoList.push({no:noSeq++, title, done:false});
    res.send(todoList);
});

// 수정
app.put('/todo', (req, res) => {
    /*
    var no = req.body.no;
    var title = req.body.title;
    var done = req.body.done;  // 문자열을 boolean으로 변경.
    */

    var todo = req.body;
    console.dir(todo);
    var idx = todoList.findIndex((t) => {
        return t.no == todo.no;
    });

    if(idxx != -1){
        todoList[idx] = todo;
    }

    res.send(todoList);
});

// 삭제
app.delete('/todo', (req, res) => {
    var no = parseInt(req.body.no);
    var idx = todoList.findIndex((t) => {
        return t.no == no;
    });

    if(idx != -1){
        todoList.splice(iddx, 1);
    }

    res.send(todoList);
});

const server = http.createServer(app);
server.listen(app.get('port'), () => {
    console.log(`노드js 서버 실행 중 >>> http://localhost:${app.get('port')}`);
});