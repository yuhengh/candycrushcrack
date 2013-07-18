CandyCrack = function () {
    var self = this;

    self.FRIEND = 'friend';
    self.RATING = 'rating';
    self.INPUT = 'input';

    self.mode = self.FRIEND;
    self.getUserOnly = false;


    self.getUser = function () {
        var url = 'http://candycrush.king.com/api/poll';
        var params = {};
        params._session = $('#session').attr('value');

        $.get(url, params, function (data) {
            console.log(data);
            var text = JSON.stringify(data);

            $('#dataDiv').text(text);

            $('#userid').attr('value', data.currentUser.userId);

            if (!self.getUserOnly)
                self.getScore();

        }, 'json');

    }

    self.getScore = function () {
        if (self.mode == self.RATING)
            getScoreByRating();
        else if (self.mode == self.FRIEND)
            getScoreByFriend();
        else {
            if ($('#score').attr('value') == '')
                alert('Please enter score!');
            else
                endGame();
        }

    }

    function getScoreByRating() {
        $('#dataDiv').text('Getting Score By Rating...');

        var url = 'http://candycrush.king.com/api/gameStart';
        var params = {};
        params._session = $('#session').attr('value');
        params.arg0 = $('#episode').attr('value');
        params.arg1 = $('#level').attr('value');

        $.get(url, params, function (data) {
            onGetScoreByRatingComplete(data);

        });
    }

    function onGetScoreByRatingComplete(data) {
        $('#dataDiv').text(JSON.stringify(data));

        data = JSON.parse(data.levelData);

        var score = data.scoreTargets[1];

        score = randomizeScore(score);

        $('#score').attr('value', score);

        endGame();

    }

    function getScoreByFriend() {
        $('#dataDiv').text('Getting Score By Friend...');

        var url = 'http://candycrush.king.com/api/getLevelToplist';
        var params = {};
        params._session = $('#session').attr('value');
        params.arg0 = $('#episode').attr('value');
        params.arg1 = $('#level').attr('value');

        $.get(url, params, function (data) {
            var text = JSON.stringify(data);

            $('#dataDiv').text(text);

            onGetScoreByFriendComplete(data);
        });

    }

    function onGetScoreByFriendComplete(data) {
        $('#dataDiv').text(JSON.stringify(data));

        var score = 0;

        if (data.toplist.length == 0) {
            alert("You have no friends on this level. Please select other options");
            return;
        }

        for (var i = 0; i < data.toplist.length; i++) {
            score += data.toplist[i].value;
        }

        score /= i;

        score = randomizeScore(score);

        $('#score').attr('value', score);

        endGame();
    }

    function randomizeScore(score) {
        score += Math.floor(0.3 * (Math.random() * 2 - 1) * score);

        score = Math.floor(score / 20) * 20;

        return score;
    }


    function endGame() {
        var secretKey = "BuFu6gBFv79BH9hk";
        var timeLeftPercent = -1;

        if ($('#score').attr('value') == "")
            $('#score').attr('value', Math.floor(500000 * (1 + Math.random())).toString());

        var episode = $('#episode').attr('value');
        var level = $('#level').attr('value');
        var score = $('#score').attr('value');
        var session = $('#session').attr('value');


        var user = $('#userid').attr('value');
        var seed = $('#seed').attr('value');

        var input = episode + ":" + level + ":" + score + ":" + timeLeftPercent + ":" + user + ":" + seed + ":" + secretKey;
        console.log(input);

        var cs = hash(input).substr(0, 6);

        $('#cs').attr('value', cs);

        $('#dataDiv').text('Completing Level...');

        var data = {};
        data.cs = cs;
        data.seed = seed;
        data.reason = 0;
        data.timeLeftPercent = -1;
        data.score = score;
        data.levelId = level;
        data.episodeId = episode;

        var url = "http://candycrush.king.com/api/gameEnd";
        var params = {};
        params.arg0 = JSON.stringify(data);
        params._session = session;

        console.log(params);

        $.get(url, params, function (data) {
            $('#dataDiv').text(JSON.stringify(data));
        });
    }

    function hash(input) {
        return $.md5(input);
    }

    self.hack = function () {
        self.getUserOnly = false;

        if ($('#session').attr('value') == "") {
            alert("Please input the session key");
            return;
        }

        if ($('#episode').attr('value') == "") {
            alert("Please input an episode");
            return;
        }

        if ($('#level').attr('value') == "") {
            alert("Please input a level");
            return;
        }

        if ($('#userid').attr('value') == "")
            self.getUser();
        else
            self.getScore();

    }
}

var candyCrack = new CandyCrack();


$(document).ready(function () {
    $('#dataDiv').text('');

    $('#getUserButton').click(function () {

        if ($('#session').attr('value') == "") {
            alert("Please input the session key");
            return;
        }

        candyCrack.getUserOnly = true;
        candyCrack.getUser();
    });

    $('#completeLevelButton').click(function () {
        candyCrack.hack();
    });

    $("input[name='scoreBy']").change(function (e) {

        if (e.target.value == candyCrack.FRIEND) {
            candyCrack.mode = candyCrack.FRIEND;
            $('#score').attr('disabled', true);

        }
        else if (e.target.value == candyCrack.RATING) {
            candyCrack.mode = candyCrack.RATING;
            $('#score').attr('disabled', true);
        }
        else {
            candyCrack.mode = candyCrack.INPUT;
            $('#score').removeAttr('disabled');
        }
    });

    var tabId = parseInt(window.location.search.substring(1));

    window.addEventListener("load", function() {
        chrome.webRequest.onBeforeRequest.addListener(onBefore, {urls: [
            "*://candycrush.king.com/api*"
        ]});

    });

    window.addEventListener("unload", function() {
        chrome.webRequest.onBeforeRequest.removeListener(onBefore);
    });

    function onBefore(info)
    {
        var requestURL = info.url;

        var url = parseUrl(parseUrl(requestURL));
        var param = parseParam(url.search.substring(1));

        if (param)
        {
            var data = 'Candy Crush Activity Detected' + '<br>' + requestURL + '<br>';
            $('#dataDiv').html(data);

            if ($('#session').attr('value') == '' && param._session)
                $('#session').attr('value', param._session);
                
            if (param.arg0 && param.arg1)
            {
                if ($('#episode').attr('value') == '')
                    $('#episode').attr('value', param.arg0);

                if ($('#level').attr('value') == '')
                    $('#level').attr('value', param.arg1);
            }  
        }
    }

    function parseParam(param)
    {
        if (param)
        {
            var str = '{"' + decodeURI(param).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}';
            console.log(str);
            return JSON.parse(str);
        }
    }

    function parseUrl(url)
    {
        var a = document.createElement('a');
        a.href = url;
        return a;
    }
});



