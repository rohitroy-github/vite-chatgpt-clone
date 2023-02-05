// mainJSFile

import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

// functionToTypeTextByAi
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// functionToGenerateUID
function generateUniqueId() {
  const timeStamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timeStamp}-${hexadecimalString}`;
}

// functionToGenerateChatStripesForUser/Ai
function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi && "ai"}">
      <div class="chat">
        <div class="profile">
          <img 
          src="${isAi ? bot : user}"
          alt="${isAi ? "bot" : "user"}"
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    `;
}

// fucntionOnHandleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();

  // collectingAskedQuestionFromFromData
  const data = new FormData(form);

  // checkingPurpose
  // console.log({data});

  // generatingUIDForUser
  const uniqueIdUser = generateUniqueId();

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(
    false,
    data.get("prompt"),
    uniqueIdUser
  );

  // clearFormInput
  form.reset();

  // bot's chatstripe
  const uniqueIdAi = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, "", uniqueIdAi);

  // to focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // specific message div
  const messageDiv = document.getElementById(uniqueIdAi);

  // messageDiv.innerHTML = "..."
  loader(messageDiv);

  // fetchingDataFromServer
  const response = await fetch(
    // provideDeployedServerSideLink
    "https://vite-chatgpt-api-clone-server.onrender.com/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: data.get("prompt"),
      }),
    }
  );

  clearInterval(loadInterval);

  // stopTheDotAction
  messageDiv.innerHTML = "";

  // ifFetchedDataIsOkay
  // https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
  if (response.ok) {
    // actualData/Response
    const data = await response.json();
    // parsingData
    const parseData = data.bot.trim();
    typeText(messageDiv, parseData);
  } else {
    // errorHandling
    const error = await response.text();
    messageDiv.innerHTML = "Something went wrong !";
    alert(error);
  }
};

// addEventListenerForSubmitButton
form.addEventListener("submit", handleSubmit);

// addEventListenerForSubmitButtonWRTEnterKey
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
