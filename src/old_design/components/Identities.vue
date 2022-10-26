<template>
  <div class="first">
    <h1>Neue identität erstellen</h1>
  </div>
  <div class="second">
    <div class="third">
      <h2>Username</h2>
      <InputText class="input" type="text" v-model="value"/>
      <h2>E-Mail</h2>
      <InputText class="input" type="text" v-model="value" />
      <h2>Keypair</h2>
      <div class="checkbox">
        <Checkbox inputId="binary" v-model="checked" :binary="true" />
        <label for="binary">{{msg}}</label>
      </div>
      <div class="oder">
        <p>ODER</p>
      </div>
      <FileUpload mode="basic" name="demo[]" url="./upload" />
    </div>
    <div class="fourth">
      <Button label="Identität erstellen" class="p-button-success" icon="pi-check-circle"></Button>
    </div>
  </div>


</template>

<script>
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
export default {
  name: "Identities",
  components:{
    InputText,
    Checkbox,
    Button,
    FileUpload
  },
  data(){
    return{
      checked: false,
      msg: "Keypair erstellen"
    }
  }
}
</script>

<style>
.first{
  width: 100vw;
  height: 30vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.second{
  text-align: center;
}

.fourth{
  height: 7rem;
  display:flex;
  align-items: center;
  justify-content: center;
}

h1{
  font-size: 5em;
  font-weight: 500;
  color: #66CDAA;
}

h2 {
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 1rem;
  margin-top: 2rem;
  color: #66CDAA ;
}

.checkbox{
  margin-bottom: 1rem;
  padding-left: 1rem;
}

.checkbox > label{
  margin-left: 1rem;
}

.oder{
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>