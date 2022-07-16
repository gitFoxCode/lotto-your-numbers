<template>
  <main :class="{'expand': loading.state || isExpand}">
    <a href="https://www.lotto.pl" class="logo">
      <img src="@/assets/images/lotto_logo.svg" alt="logo lotto" />
    </a>
    <section class="box">
      <h1 class="box__title">Check your favourite numbers</h1>
      <p class="box__desc">If you are a time traveller or if you are curious if your numbers ever came out in a draw, enter them here!:
      </p>
      <div class="error-message" v-if="error.state">{{ error.message }}</div>
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
      <div class="loading" v-if="loading.state">
        <span class="loading-text">{{ loading.message }}</span>
        <div class="card-skeleton"></div>
      </div>
      <Card 
        v-for="winner in winners" 
        :key="winner" 
        :numbers="winner.numbers"
        :date="winner.date"
        :isNear="winner.isNear"
        />
      <p class="no-results" v-if="winners.length === 0 && isLoaded">There are no figures in history (yet...): {{ userNumbers.join(', ') }}</p>
    </section>
  </main>
</template>

<script setup>
const error = ref({ 
  state: false,
  message: ''
})
const loading = ref({
  state: false,
  message: ''
})
const isExpand = ref(false)
const winners = ref([])
const isLoaded = ref(false)
const userNumbers = ref([])

if(process.client){

const inputs = document.querySelectorAll('.box__input')

document.addEventListener("paste", (ev)=>{
  const pasted = (ev.clipboardData || window.clipboardData).getData('text')
  const numbers = pasted.trim().split(",")
  if(numbers.length != 0){
    numbers.forEach((num, i)=>{
      const number = parseInt(num, 10)
      if(!Number.isNaN(number) && i <= 5){
        inputs[i].value = number
      }
    })
  }

})

inputs.forEach((input, index)=>{
  input.addEventListener('keyup', async (ev)=>{

    /* Deleting by backspace */
    console.log(ev.target.value.length)
    if(ev.keyCode === 8 && ev.target.value.length === 0){
      if(ev.target.previousElementSibling != null){
        ev.target.previousElementSibling.focus()
      }
    }

    /* Automatic focus on the next item after entering the whole number */
    if(ev.target.value.length >= 2 || ev.keyCode === 32 || ev.keyCode === 13){
      if(ev.target.nextElementSibling != null){
        ev.target.nextElementSibling.focus();
      }
    }

    /* In case of change of numbers we need the appropriate index */
    userNumbers.value[index] = ev.target.value
    console.log(userNumbers.value)

    await validationAndStart()

  })

})

async function validationAndStart(){
  let debounce = null

  clearTimeout(debounce)

  debounce = setTimeout(async ()=>{

    /* Validation */
    if(userNumbers.value.length === 6 && unique(userNumbers.value) && userNumbers.value.every((n)=>n<50) && userNumbers.value[userNumbers.value.length - 1] != ""){
      error.value = { state: false }
      console.log("true")
      //setTimeout(async()=>{ 
        await searchAPI(userNumbers.value) 
      //}, 500)
    }else {
      if(userNumbers.value.length === 6){
        error.value = { state: true, message: 'These must be numbers from 1-49 without duplicates!' }
      }
    }

  }, 200)
}

async function searchAPI(numbers){
  const rawNumbers = Object.values(numbers).map((n)=>parseInt(n, 10))

  loadingAnimation()
  loading.value.message = 'Downloading lotto games...'

  const proxyUrl = 'https://thingproxy.freeboard.io/fetch/'

  const response = await fetch(proxyUrl + 'https://www.lotto.pl/api/lotteries/draw-results/by-gametype?game=Lotto&index=1&size=100000&sort=drawDate&order=DESC')
  if(!response.ok){
    loading.value.state = false
    error.value = { state: true, message: 'An error occurred while downloading the data! Try again' }
    console.error(response)
    return;
  }
  isExpand.value = true
  const { items: data } = await response.json()
  loading.value.message = `Searching ${data.length} lotto games`

  if(!matchNumbers(data, rawNumbers)){
    isLoaded.value = true
  }

}

function matchNumbers(data, numbers){
  let winner = false
  data.forEach((item)=>{
    let winningNumbers = item.results[0].resultsJson
    let winningDate = new Date(item.drawDate).toLocaleDateString('pl-PL', { day:"numeric", month:"numeric", year:"numeric" })

    console.log(winningNumbers, numbers)

    if(winningNumbers.every((winning)=>numbers.includes(winning))){
      winner = true
      loading.value = {state: false}
      isExpand.value = false
      winners.value.push({
        numbers: winningNumbers,
        date: winningDate,
        isNear: false
      })
    }
    if(searchSimilar(winningNumbers, numbers)){
      winner = true
      winners.value.push({
        numbers: winningNumbers, // Numbers in the order given by the user to make them easier to compare 
        date: winningDate,
        isNear: true
      })
    }
  })
  // No results:
  if(winners.value.length === 0){
    loading.value.state = false
    isExpand.value = false
    winner = false
  }
  return winner
}

function loadingAnimation(){
  if(loading.value.state) return;
  loading.value.state = true
}

function unique(array) {
  return !((new Set(array)).size !== array.length)
}

function searchSimilar(original, numbers){
  let positive = 0
  let positiveUP = 0
  let positiveDOWN = 0
  const used = []

  numbers.forEach((number)=>{
    original.forEach((org)=>{
      if(number == org && !used.includes(org)){ positive++; used.push(org); return false;}
      if(number == org-1 && !used.includes(org)){ positiveUP++; used.push(org); return false; }
      if(number == org+1 && !used.includes(org)){ positiveDOWN++; used.push(org); return false; }
    })
  })

  console.log("Similarity:")
  console.log(positive, positiveUP, positiveDOWN)
  if(positiveUP > 1 || positiveDOWN > 1){
    positive = positive + ((positiveUP+positiveDOWN)/2)
  }else{
    positive = positive + positiveUP + positiveDOWN
  }
  // Return boolean
  return (positive >= 6 && JSON.stringify(original.sort((a,b)=>a-b)) !== JSON.stringify(numbers.sort((a,b)=>a-b)))
}

}


</script>

<style lang="scss" scoped>
main{
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: url('@/assets/images/background.svg');
  background-position: center;
  background-size: cover;
  padding-top: 100px;
}
.logo{
  transition: transform 0.5s;
  img{
    width: 300px;
  }
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
.output{
  width: 100%;
  max-width: 55rem;
  margin: 0 10%;
  margin-top: 30px;
}
.card-skeleton{
  width: 100%;
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
.error-message {
    position: absolute;
    top: 54%;
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
    &:empty{
      display: none;
    }
}
.no-results{
  font-family: "Poppins",sans-serif;
  display: block;
  width: 100%;
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
.loading-text{
  display: block;
  margin-bottom: 1rem;
  text-align: center;
  font-family: "Poppins", sans-serif;
}
.expand .logo, .expand .box{
  transform: translateY(-50px);
}
// Skeleton load animation
@keyframes load {
    from {
        left: -150px;
    }
    to   {
        left: 100%;
    }
}
</style>