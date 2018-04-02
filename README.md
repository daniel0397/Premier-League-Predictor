# Premier-League-Predictor
An Amazon Alexa application that predicts who is most likely to score in a premier league football match.

## How it works
Index.js is used in AWS Lambda to use as an Endpoint in the interaction model in Amazon Skills Kit. The Lambda code is also linked to a DynamoDB database with two tables, one under the name yesno and the other named Fixtures. 

## Intercation Model
The interaction model for this skill has one custom intent, the intent name is MyIntent with a slot named MyQuestion here are the sample utterances for MyIntent:
https://gyazo.com/301bd527c2046c8f0c88a064ad41f4ed
The invocation for the project is 'Premier League Predictor'

## Tables 
The yesno table is used to store player information. Here is an example of the records in the yesno table:
https://gyazo.com/d89294bd905cae9d3aa1ba4168d459cd

The fixtures table is used to information about fixtures. Here is an example of the records in the fixtures table:
https://gyazo.com/94c0440afee1bb5d121b36e23fd70314
