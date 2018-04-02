const AWSregion = 'eu-west-1';  
const Alexa = require('alexa-sdk');
const AWS = require('aws-sdk');

AWS.config.update({
    region: AWSregion
});

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);

    alexa.appId = 'amzn1.ask.skill.79ccd966-de4f-4fa0-914a-3b4751ca7bf6';
    // alexa.dynamoDBTableName = 'YourTableName'; // creates new table for session.attributes

    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
        this.response.speak('welcome to premier league predictor.  ask me a about a match.').listen('try again');
        this.emit(':responseReady');
    },
    

    'MyIntent': function () {
        var MyQuestion = this.event.request.intent.slots.MyQuestion.value;
        console.log('MyQuestion : ' + MyQuestion);
        
        
        const params2 = {
            TableName: 'Fixtures',
            FilterExpression: 'team1 = :value',
            ExpressionAttributeValues: {':value': {"S": MyQuestion.toLowerCase()}}
        };
        const params3 = {
            TableName: 'Fixtures',
            FilterExpression: 'team2 = :value',
            ExpressionAttributeValues: {':value': {"S": MyQuestion.toLowerCase()}}
        };

        readDynamoItem(params2, myResult=>{
            var say = MyQuestion;
            //if nothing is found when scanning for team1, scan team2
            if (myResult == "error"){
                readDynamoItem(params3, myResult2=>{
                    say = myResult2;
                    say =  myResult2 + ' is most likely to score next in the ' + MyQuestion + ' match';
                    this.response.speak(say).listen('try again');
                    this.emit(':responseReady');
                });
            } 
            else{
                say = myResult;
                say =  myResult + ' is most likely to score next in the ' + MyQuestion + ' match';
                this.response.speak(say).listen('try again');
                this.emit(':responseReady');
            }
        });

    },
    'AMAZON.HelpIntent': function () {
        this.response.speak('ask me about who will score next in a football match.').listen('try again');
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak('Goodbye!');
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak('Goodbye!');
        this.emit(':responseReady');
    }
};

//  END of Intent Handlers {} ========================================================================================
//  Helper Function  =================================================================================================

//reading the Fixtures table
function readDynamoItem(params2, callback) {
    var AWS = require('aws-sdk');
    AWS.config.update({region: AWSregion});

    var dynamodb = new AWS.DynamoDB();
    var team1;
    var team2;
    
    

    console.log('reading item from DynamoDB table');
   
    dynamodb.scan(params2, function (err, data){
        if (err) {
            callback("error");
            //console.log(err, err.stack); // an error occurred
        }
        else{
            console.log(data); // successful response
            if(data.Count == 0){
              callback("error");  
            }
            else{
                team1 = jsonToString(data.Items[0].team1);
                team2 = jsonToString(data.Items[0].team2);
                var t1goals = jsonToInt(data.Items[0].t1goals);
                var t2goals = jsonToInt(data.Items[0].t2goals);
                var t1pos = jsonToInt(data.Items[0].t1leaguepos);
                var t2pos = jsonToInt(data.Items[0].t2leaguepos);
                var search;
                var equal = "true";
                var chosenValue = Math.random() < 0.5 ? team1 : team2;
                
                if(t1pos <= 6 && t2pos > 6 || t1pos > 6 && t1pos < 15 && t2pos > 15 || t1pos < 16 && t2pos >= 16){
                    equal = "2false";
                }
                else if(t2pos <= 6 && t1pos > 6 || t2pos > 6 && t2pos < 15 && t1pos > 15 || t2pos < 16 && t1pos >= 16){
                    equal = "1false";
                }
            
                // if goals are equal in a match and both teams are of similar level then it is random which team will score next 
                if(t1goals == t2goals && equal == "true"){
                    search = chosenValue;
                    console.log(equal);
                }
                //if a team has 1 goal more than the other and both teams are of similar level, or both teams are equal but one is of a higher level than the other then it is a 3rd more likely they will score next
                else if(t1goals > t2goals && t1goals == 1 && equal == "true" || t1goals == t2goals && equal == "2false"){
                    console.log(equal);
                    if(randomInt(1, 3) == 1){
                        search = team2;
                    }
                    else{
                        search = team1;
                    }
                }
                else if(t2goals > t1goals && t2goals == 1 && equal == "true" || t1goals == t2goals && equal == "1false"){
                    console.log(equal);
                    if(randomInt(1, 3) == 1){
                        search = team1;
                    }
                    else{
                        search = team2;
                    }
                }
                //if a team has more than 1 goal more than the other and both teams are of similar level, or a team has one goal more than the other but is a higher level than the other then it is a 5th more likely they will score next
                else if(t1goals > t2goals && t1goals > 1 && equal == "true" || t1goals > t2goals && t1goals == 1 && equal == "2false"){
                    if(randomInt(1, 5) == 1){
                        search = team2;
                    }
                    else{
                        search = team1;
                    }
                }
                else if(t2goals > t1goals && t2goals > 1 && equal == "true" || t2goals > t1goals && t2goals == 1 && equal == "1false"){
                    if(randomInt(1, 5) == 1){
                        search = team1;
                    }
                    else{
                        search = team2;
                    }
                }
                //if a team has more than 1 goal more than the other and one team is a higher level than the other then it is a 5th more likely they will score next
                else if(t1goals > t2goals && t1goals > 1 && equal == "2false" ){
                    if(randomInt(1, 7) == 1){
                        search = team2;
                    }
                    else{
                        search = team1;
                    }
                }
                else if(t2goals > t1goals && t2goals > 1 && equal == "1false" ){
                    if(randomInt(1, 7) == 1){
                        search = team1;
                    }
                    else{
                        search = team2;
                    }
                }
            
                var params = {
                    TableName: 'yesno',
                    FilterExpression: 'team = :value',
                    ExpressionAttributeValues: {':value': {"S": search}}
                };
                
                readDynamoFixtures(params, myResult=>{
                    callback(myResult);
                });
            }
        }
    });
}

//read player details from the the yesno table
function readDynamoFixtures(params, callback) {
    var goals =  new Array();
    var playing =  new Array();
    var messages =  new Array();
    var goalsInLast5 =  new Array();
    var form =  new Array();
    var most = 0;
    var mostMessage;
    var dynamodb = new AWS.DynamoDB();
    dynamodb.scan(params, function (err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else{
                        for(var i = 0; i <= (data.Count - 1); i++){
                            console.log(data); // successful response
                            messages[i] = jsonToString(data.Items[i].playername);
                            goals[i] = jsonToInt(data.Items[i].goals);
                            playing[i] = jsonToString(data.Items[i].playing);
                            form[i] = jsonToInt(data.Items[i].form);
                            goalsInLast5[i] = jsonToInt(data.Items[i].goalsinlast5);
                            //compare each players goals
                            if (goals[i] > most && playing[i] == "true" && goalsInLast5[i] > 4){
                                most = goals[i];
                                mostMessage = messages[i];
                            }
                        }
                        
                    }
                    if (mostMessage == null){
                        most = 0;
                        for(i = 0; i <= (messages.length - 1); i++){
                            if (goals[i] > most && playing[i] == "true" && goalsInLast5[i] > 2){
                                most = goals[i];
                                mostMessage = messages[i];
                            }
                        }
                        if (mostMessage == null){
                            for(i = 0; i <= (messages.length - 1); i++){
                                if (goals[i] > most && playing[i] == "true" && form[i] >= 7 && goalsInLast5[i] > 1){
                                    most = goals[i];
                                    mostMessage = messages[i];
                                }
                            }
                            if (mostMessage == null){
                                for(i = 0; i <= (messages.length - 1); i++){
                                        if (goals[i] > most && playing[i] == "true" && form[i] >= 5 && goalsInLast5[i] > 0){
                                        most = goals[i];
                                        mostMessage = messages[i];
                                    }
                                }
                                if (mostMessage == null){
                                    for(i = 0; i <= (messages.length - 1); i++){
                                            if (goals[i] > most && playing[i] == "true"){
                                            most = goals[i];
                                            mostMessage = messages[i];
                                        }
                                    }
                                }
                            }
                        }
                    } 
                    callback(mostMessage);
                });
}

//convert database items from json format to string
function jsonToString(str){
    str = JSON.stringify(str);
    str = str.replace('{\"S\":\"', '');
    str = str.replace('\"}', '');
    return str;
}

//convert database items from json format to integer
function jsonToInt(INT){
    INT = jsonToString(INT);
    INT = parseInt(INT);
    return INT;
}

//get a random int between min and max 
function randomInt(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}
