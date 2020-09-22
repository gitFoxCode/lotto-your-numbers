<template>
  <div id="app">
    <div class="logo">
      <img src="~@/assets/Lotto_logo.svg" alt="Lotto logo">
    </div>
    <section class="box">
      <h1 class="box__title">Check your favourite numbers</h1>
      <p class="box__desc">If you are a time traveller or if you are curious if your numbers ever came out in a draw, enter them here!:
      </p>
      <div class="error-message"></div>
      <div class="box__inputs">
        <input class="box__input" type="number" min="1" max="49" maxlength="2">
        <input class="box__input" type="number" min="1" max="49" maxlength="2">
        <input class="box__input" type="number" min="1" max="49" maxlength="2">
        <input class="box__input" type="number" min="1" max="49" maxlength="2">
        <input class="box__input" type="number" min="1" max="49" maxlength="2">
        <input class="box__input" type="number" min="1" max="49" maxlength="2">
      </div>
    </section>
    <section class="output">

    </section>
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {

    let loadedData = null;
    const userNumbers = [];
    const inputs = document.querySelectorAll(`.box__input`);
    let delay = null;

    inputs.forEach((input, index)=>{
      /** 
      /* The moment of entering the numbers 
      /**/
      input.addEventListener("keyup", (e)=>{



        /* Automatic focus on the next item after entering the whole number */
        if(e.target.value.length >= 2){
          if(e.target.nextElementSibling != null){
            e.target.nextElementSibling.focus();
          }
        }

        /* In case of change of numbers we need the appropriate index */
        userNumbers[index] = e.target.value;
        console.log(userNumbers); // DELETE - debugging

        clearTimeout(delay);

        delay = setTimeout(function () {


          /* Core */
          if(userNumbers.length == 6 && unique(userNumbers)&& userNumbers.every((el)=> (el<50)) && userNumbers[userNumbers.length - 1] !="" ){
            console.log(" Matched! "); // DELETE - debugging
            document.querySelector(".error-message").innerHTML = "";
            setTimeout(()=>{ 
              userNumbers[index] = e.target.value;
              searchAPI(userNumbers) 
            },500);
          }else{
            if(userNumbers.length == 6){
              /* Error display (numbers are not unique and are not in the range from 0 to 49) */
              document.querySelector(".error-message").innerHTML = "Numbers from 1-49 without duplicates!";
            }
          }
        }, 200);

      },false)

    });

    /* In case cors error */
    const proxyurl = "https://cors-anywhere.herokuapp.com/";

    let loaded = false;

    function searchAPI(numbers){

      numbers = numbers.map(numStr => parseInt(numStr));

      console.log(numbers); // DELETE - debugging

      console.log(" searching... "); // DELETE - debugging

      /* Appearing animation */
      document.querySelector(".logo").style.transform = "translateY(-50px)";
      document.querySelector(".box").style.transform = "translateY(-50px)";

      /* Loading card, search start */
      document.querySelector(".output").innerHTML = `<div class="card-skeleton"></div>`;


      if(!loaded){
        fetch(proxyurl + 'https://www.lotto.pl/api/lotteries/draw-results/by-gametype?game=Lotto&index=1&size=100000&sort=drawDate&order=DESC',{method: 'GET'})
          .then(response => response.json())
          .then(data => {
            if(data.code == 200){

              console.log(data.items); // DELETE - debugging
              loaded = true;

              loadedData = data;
              /** LOADED HERE:  **/
              checkNumbers(data, numbers);

            }
          });
        }else{
          console.log(" data loaded arleady! "); // DELETE - debugging
          checkNumbers(loadedData, numbers);
        }

    }

    function checkNumbers(data, numbers){
      let winner = false;

      data.items.forEach((item)=>{

        let win = item.results[0].resultsJson;
        let date = item.drawDate;
        date = new Date(date);
        date = appendLeadingZeroes(date.getDate()) + "." + (appendLeadingZeroes(date.getMonth() + 1)) + "." + date.getFullYear();
        console.log(win,numbers); // DELETE - debugging
        if( win.every(winNumbers => numbers.includes(winNumbers)) ){
          winner = true;
         // item.results
         console.log(" results: "); // DELETE - debugging
         console.log(item); // DELETE - debugging
         clearOutput();
         document.querySelector(".output").innerHTML += createCard(date, win, false);

        } 
        if(similar(win, numbers)){
          winner = true;
          clearOutput();
          document.querySelector(".output").innerHTML += createCard(date, win, true);
          console.log("similar found "); // DELETE - debugging
        }
        
      });

      if(!winner){
        document.querySelector(".output").innerHTML = noResults(numbers);
        console.log(" no results "); // DELETE - debugging
      }
    }

    function noResults(numbers){
      let info = `<p class="no-results">There are no figures in history (yet...): <span>${numbers[0]}, ${numbers[1]}, ${numbers[2]}, ${numbers[3]}, ${numbers[4]}, ${numbers[5]}</span> </p>`;
      return info;
    }

    function createCard(date,numbers,near){

      let card = `<div class="card${near ? ' near' : ''}"><div class="card__date">${date}</div>`;
        if(near){
          card += `<div class="card__text">Almost! If you modified those numbers a little bit...</div>`;
        } else{
          card += `<div class="card__text">If you had sent these numbers then you would have won!</div>`;
        }
        card += `<div class="card__numbers">` +
          `<div class="card__number">${numbers[0]}</div>`+
          `<div class="card__number">${numbers[1]}</div>`+
          `<div class="card__number">${numbers[2]}</div>`+
          `<div class="card__number">${numbers[3]}</div>`+
          `<div class="card__number">${numbers[4]}</div>`+
          `<div class="card__number">${numbers[5]}</div>`+
        `</div>`+
      `</div>`;
      return card;

    }

    function appendLeadingZeroes(n){
      if(n <= 9){
        return "0" + n;
      }
      return n
    }

    function unique(array) {
      return !((new Set(array)).size !== array.length);
    }

    function clearOutput(){
      if(document.querySelector(".card-skeleton")){
        document.querySelector(".output").innerHTML = "";
      }else{
        return false;
      }
    }

    function similar(original, numbers){
      let positive = 0;
      let positiveUP = 0;
      let positiveDOWN = 0;
      let used = [];
      // check if numbers are similar to original:
      numbers.forEach((number, i)=>{
        original.forEach((org)=>{
          if(number == org && !used.includes(org)){ positive++; used.push(org); return false;}
          if(number == org-1 && !used.includes(org)){ positiveUP++; used.push(org); return false; }
          if(number == org+1 && !used.includes(org)){ positiveDOWN++; used.push(org); return false; }
        })
      })
      console.log(positive,positiveUP,positiveDOWN); // DELETE - debugging
      if(positiveUP > 1 || positiveDOWN > 1){
        positive = positive + ((positiveUP+positiveDOWN)/2);
      }else{
        positive = positive+positiveUP+positiveDOWN;
      }

      if(positive >= 6 && JSON.stringify(original.sort((a,b)=>a-b)) !== JSON.stringify(numbers.sort((a,b)=>a-b))){ 
        return true;
      }else{
        return false;
      }
    }


  }
}
</script>

<style lang="scss">
*, *::after, *::before{
  box-sizing: border-box;
  font-size: 16pt;
}
body{
  background: url(~@/assets/background.svg);
  background-size: cover;
  background-position: cover;
}
.output{
  margin-top: 30px;
}
.card-skeleton{
  width: 60%;
  height: 70px;
  margin: 0 auto;
  background-color: #eee;
  border-radius: 90px;
  box-shadow: 0 4px 10px 0 rgba(33, 33, 33, 0.15);
  position: relative;
  overflow: hidden;
}
.card-skeleton::before {
  content: '';
  display: block;
  position: absolute;
  left: -150px;
  top: 0;
  height: 100%;
  width: 150px;
  background: linear-gradient(to right, transparent 0%, #E8E8E8 50%, transparent 100%);
  animation: load 1s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
}
.card{
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 60%;
  font-family: "Lato", sans-serif;
  padding: 10px 70px;
  border-radius: 90px;
  background-color: #eee;
  margin: 0 auto;
  margin-bottom: 10px;
  box-shadow: 0 0 50px -10px rgba(255,215,0,1);
  border: 2px solid gold;
}
.card.near{
  box-shadow: none;
  border: none;
}
.card.near:first-of-type{
  margin-top: 20px;
}
.card__text{
  width: 300px;
  text-align: center;
}
.card__date{
  font-weight: 1000;
  color: #444444;
  font-size: 1.4em;
}
.card__numbers{
  display: flex;
}
.card__text{
  font-size: 0.9em;
  font-style: italic;
  color: #444;
}
.card__number{
  background-color: #FFDA65;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.9em;
  margin: 0 2px;
  color: #444;
  font-weight: 500;
}

.logo img{
  width: 300px;
}
.logo{
  text-align: center;
  margin-top: 100px;
  transition: transform 0.5s;
}
#app{
  transform: translateY(100px);
}
#app{
  transform: translateY(0);
}
.box{
  text-align: center;
  font-family: "Poppins",sans-serif;
  position: relative;
  transition: transform 0.5s;
}
.box__title{
  text-transform: uppercase;
  font-size: 1.5em;
  padding-top: 20px;
  color: #222;
}
.box__desc{
  max-width: 700px;
  margin: 0 auto;
  margin-bottom: 50px;
  color: #292929;
  position: relative;
}
.error-message {
    position: absolute;
    top: 62%;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    color: tomato;
    font-size: 0.6em;
    background-color: #ffe783;
    padding: 10px 55px;
    border-radius: 20px;
    font-weight: bold;
    transition: opacity 0.5s;
}
.error-message:empty{
  display: none;
}
.box__input{
  font-size: sans-serif;
  font-weight: bold;
  color: #555;
  width: 50px;
  height: 50px;
  border-radius: 10px;
  border: 2px solid rgba(#A8A8A8,0.5);
  text-align: center;
  -moz-appearance: textfield;
  outline: none;
  margin: 0 5px;
  transition: border 0.2s;
}
.box__input:focus, input:hover{
  border: 2px solid rgba(#505050,0.5);
  transition: border 0.2s;
}
.box__input:invalid{
  border: 3px solid rgba(#FF5370,1);
  transition: border 0.2s;
}
.box__input::-webkit-outer-spin-button,
.box__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-results{
  font-family: "Poppins",sans-serif;
  display: block;
  width: 43%;
  padding: 20px;
  border-radius: 20px;
  color: #222;
  margin: 0 auto;
  font-weight: 500;
  text-align: center;
  background-color: #ffea83;
}
.no-results span{
  color: #0b8cd5;
}

@keyframes load {
    from {
        left: -150px;
    }
    to   {
        left: 100%;
    }
}

@media (max-width: 1360px) {
  
  .card__text{
    display: none;
  }
}
@media (max-width: 850px) {
  .card{
    flex-direction: column;
  }
}
@media (max-width: 584px) {
  .card{
    width: auto;
  }
}
@media (max-width: 375px) {
  .box__input{
    margin: 0;
  }
}
</style>
