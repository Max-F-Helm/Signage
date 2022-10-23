<template>
  <div class="wrapperStartPage">
    <div class="startPageClass">
      <h1>{{msg}}</h1>
      <h3>{{msg2}}</h3>
      <div class="StartPageButtons">
        <div>
          <MyButton @click="loadLatestDocument">{{msg3}}</MyButton>
        </div>
        <div>
          <MyButton @click="loadFile" class="p-button-secondary">{{msg4}}</MyButton>
          <input ref="fileInput" type="file" @change="onFileChange" style="display: none;">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MyButton from 'primevue/button';
import {mocks} from "@/mocks";
import {fileProcessorWrapper} from "@/FileProcessorWrapper";
import BufferReader from "@/processing/buffer-reader";
import {Buffer} from "buffer";

export default {
  name: "StartPage",
  components:{
    MyButton
  },
  data(){
    return{
      msg: "Herzlich Willkommen!",
      msg2: "Was soll geladen werden?",
      msg3: "zuletzt verwendetes Dokument",
      msg4: "Datei auswählen..."
    }
  },
  methods: {
    loadLatestDocument() {
      this.$router.push({path: '/'})
    },
    loadFile() {
      this.$refs.fileInput.click()
    },
    onFileChange(e) {
      let files = e.target.files || e.dataTransfer.files
      if (!files.length)
        return;

      (async () => {
        const mockData = await mocks;
        const data = await files[0].arrayBuffer();
        fileProcessorWrapper.setIdentity(mockData.identity);
        fileProcessorWrapper.init(false);
        fileProcessorWrapper.loadFile(new BufferReader(Buffer.from(data)), null);
      })().then(() => {
        this.$router.push({path: '/'});
      })
    }
  }
}
</script>

<style scoped>
.wrapperStartPage{
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.startPageClass{
  text-align: center;
}

.StartPageButtons{
  display:flex;
  align-items: center;
  justify-content: center;
}

.StartPageButtons > div{
  margin: 10px
}

h1{
  font-size: 5em;
  font-weight: 500;
  color: #66CDAA;
}

h3 {
  font-size: 3rem;
  font-weight: 500;
  margin-bottom: 4rem;
  color: #66CDAA ;
}

</style>
