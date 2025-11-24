// utils/palm_reading_responses.js

// 1) All your responses (you'll fill in the text later)
const palmReadingResponse = {
love: [
  "love 1",
  "love 2",
  "love 3",
  "love 4",
  "love 5",
  "love 6",
  "love 7",
  "love 8",
  "love 9",
  "love 10"
],
career: [
  "career 1",
  "career 2",
  "career 3",
  "career 4",
  "career 5",
  "career6",
  "career 7",
  "career 8",
  "career 9",
  "career 10"
],
health: [
  "health 1",
  "health 2",
  "health 3",
  "health 4",
  "health 5",
  "health 6",
  "health 7",
  "health 8",
  "health 9",
  "health 10"
]
}

function getRandomMessage(topic) {
  const arr = palmReadingResponse[topic]
  if(!arr) return null;
  const i = Math.floor(Math.random()* arr.length);
  return arr[i];
//   const filtered = getResponsesForTopic(topic);
//   return getRandomResponse(filtered); // can be null if no matches
 }

module.exports={getRandomMessage};
