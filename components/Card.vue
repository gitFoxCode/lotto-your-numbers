<template>
    <div class="card" :class="{'near': isNear}">
        <div class="card__date"> {{ date }} </div>
        <div class="card__text" v-if="isNear">Almost! If you modified those numbers a little bit...</div>
        <div class="card__text" v-else>If you had sent these numbers then you would have won!</div>
        <div class="card__numbers">
            <div class="card__number" v-for="number in numbers" :key="number"> {{ number }}</div>
        </div>
    </div>
</template>

<script setup >
const props = defineProps({
    isNear: Boolean,
    date: String,
    numbers: Array
})
</script>

<style lang="scss" scoped>
.card{
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1em;
  width: 100%;
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
</style>