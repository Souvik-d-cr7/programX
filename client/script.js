import bot from './assets/bot.svg';
import user from "./assets/user.svg";

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chatContainer');

let loadInterval;

// function for loading our messages
function loader(element){
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if(element.textContent === '....'){
      element.textContent = '';
    }
  },300)
}

// function for typing functionality of API
function typeText(element, text){
  let index = 0;

  let interval = setInterval(() =>{
    if(index < text.length){
      element.innerHTML += text.charAt(index);
      index++;
    }else{
      clearInterval(interval);
    }
  },20)
}

// function for generate unique id for every message
function generateId(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

// function for implementing chat stripe
function chatStripe(isAi, value, uniqueId){
  return(
    
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img src="${isAi ? bot : user}" alt="${isAi ? 'bot' : 'user'}"/>
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>

    `
    
  )
}

// function for handling submit trigger
const handleSubmit = async(e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  form.reset();

  // bot's chatstripe
  const uniqueId = generateId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from server
  const response = await fetch('https://programx.onrender.com/',{
    method: 'POST',
    headers:{
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok){
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv,parsedData);
  }else{
    const err = await response.text();

    messageDiv.innerHTML = "something went wrong";

    alert(err);
  }
}

// for actioning the submit function
form.addEventListener('submit',handleSubmit);
form.addEventListener('keyup', (e)=>{
  if(e.keyCode === 13){
    handleSubmit(e);
  }
})