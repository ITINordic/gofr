<template>
  <v-container>
    <center>
      <v-card min-height="200" max-width="500" rounded shaped>
        <v-card-title primary-title>
          {{apps.length}} {{ $t(`App.hardcoded-texts.Installed Apps`) }}
          <v-spacer></v-spacer>
          <v-tooltip top v-if="apps.length > 0">
            <template v-slot:activator="{ on, attrs }">
              <v-btn 
                icon 
                color="primary" 
                x-large 
                v-bind="attrs" 
                v-on="on"
                to="uninstall-app"
              >
                <v-icon>mdi-minus</v-icon>
              </v-btn>
            </template>
            <span>{{ $t(`App.hardcoded-texts.Uninstall Apps`) }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn 
                icon 
                color="primary" 
                x-large 
                v-bind="attrs" 
                v-on="on"
                to="install-app"
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </template>
            <span>{{ $t(`App.hardcoded-texts.Install New App`) }}</span>
          </v-tooltip>
        </v-card-title>
        <v-card-text v-if="!loadingApps">
          <v-layout row wrap>
            <v-flex xs3 v-for="(app, index) in apps" :key="index">
              <v-card hover max-width="110" height="170" rounded :href="app | createAppURL">
                <v-card-text>
                  <v-avatar color="primary" size="90">
                    <v-img :src="app.iconBase64"></v-img>
                  </v-avatar>
                  <br>
                  <label style="vertical-align: bottom; display: flex;">
                    {{app.name}}
                  </label>
                </v-card-text>
              </v-card>
            </v-flex>
            <v-spacer></v-spacer>
          </v-layout>
        </v-card-text>
        <v-progress-linear :indeterminate="true" v-else></v-progress-linear>
      </v-card>
    </center>
  </v-container>
</template>
<script>
import axios from 'axios'
export default {
  data() {
    return {
      apps: [],
      loadingApps: false,
      baseURL: ''
    }
  },
  methods: {
    getApps() {
      this.loadingApps = true
      axios.get("/apps/installed").then((response) => {
        this.apps = response.data
        this.loadingApps = false
      })
    }
  },
  filters: {
    createAppURL(app) {
      let baseURL = location.href.split('/')
      baseURL.pop()
      baseURL = baseURL.join('/')
      return "/gofrapp/" + app.app_short_name + "/" + app.launch_path + "?baseURL=" + baseURL 
    }
  },
  created() {
    this.getApps()
    let url = location.href.split('/')
    url.pop()
    url = url.join('/')
    this.baseURL = url
  }
}
</script>