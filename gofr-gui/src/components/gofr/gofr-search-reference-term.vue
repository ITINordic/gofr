<template>
  <v-menu
    v-if="displayType == 'tree'"
    ref="menu"
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    min-width="290px"
    max-height="500px"
    >
    <template v-slot:activator="{ on }">
      <v-text-field
        v-model="displayValue"
        :label="$t(`App.fhir-resources-texts.${display}`)"
        v-on="on"
        outlined
        hide-details="auto"
        :loading="loading"
        @click:clear="clearSearch()"
        dense
        shaped 
        clearable
      >
        <template #label>{{$t(`App.fhir-resources-texts.${display}`)}}</template>
      </v-text-field>
    </template>
    <v-card>
      <v-treeview
        :active.sync="active"
        :items="items"
        :load-children="fetchChildren"
        :open.sync="open"
        item-disabled="locked"
        activatable
        :multiple-active="false"
        selection-type="independent"
        :loading="loading"
      ></v-treeview>
    </v-card>
  </v-menu>
  <v-autocomplete
    v-else
    v-model="select"
    :loading="loading"
    :items="items"
    :search-input.sync="search"
    cache-items
    flat
    hide-no-data
    hide-details
    :label="$t(`App.fhir-resources-texts.${display}`)"
    outlined
    dense
    placeholder="Start typing for selection"
    @click:clear="clearSearch()"
  >
    <template #label>{{$t(`App.fhir-resources-texts.${display}`)}}</template>
  </v-autocomplete>
</template>

<script>
import axios from 'axios'

const querystring = require('querystring')
const fhirurl = "http://hl7.org/fhir/StructureDefinition/"
export default {
  name: "fhir-reference",
  props: ["field","label","expression","targetProfile","targetResource","slotProps","edit","readOnlyIfSet", "displayType", "initialValue", "overrideValue"],
  data: function() {
    return {
      source: { path: "", data: {} },
      value: { reference: "" },
      qField: "valueReference",
      loading: false,
      search: "",
      menu: false,
      items: [],
      select: "",
      resource: "",
      awaitingSearch: false,
      displayValue: "",
      preset: false,
      disabled: false,
      errors: [],
      lockWatch: false,
      active: [],
      open: [],
      treeLookup: {},
      allAllowed: true
    }
  },
  created: function() {
    this.setupData()
  },
  watch: {
    slotProps: {
      handler() {
        if ( !this.lockWatch ) {
          this.setupData()
        }
      },
      deep: true
    },
    search: function (val) {
      if ( !this.awaitingSearch) {
        setTimeout( () => {
          val && val.length > 1 && this.querySelections( this.search )
          this.awaitingSearch = false
        }, 500 )
      }
      this.awaitingSearch = true
    },
    select: function(val) {
      this.value.reference = val
      this.updateSearch()
    },
    active: function() {
      if ( this.active.length ) {
        this.select = this.active[0]
        this.displayValue = this.treeLookup[ this.select ]
      } else {
        this.select = undefined
        this.displayValue = ""
      }
      this.menu = false
    }
  },
  methods: {
    updateSearch: function() {
      this.$emit('termChange', this.expression, this.value.reference)
    },
    clearSearch: function() {
      this.$emit('termChange', this.expression, [])
    },
    setupData: function() {
      if ( this.targetProfile && this.targetResource ) {
        if ( this.targetProfile.replace( fhirurl, "" ) === this.targetResource ) {
          this.allAllowed = true
        } else {
          this.allAllowed = false
        }
        this.resource = this.targetResource
      }
      if ( this.displayType === "tree" ) {
        this.setupTreeItems()
      }
      if ( this.slotProps && this.slotProps.source ) {
        this.source = { path: this.slotProps.source.path+"."+this.field, data: {} }
        if ( this.slotProps.source.fromArray ) {
          this.source.data = this.slotProps.source.data
        } else {
          let expression = this.$fhirutils.pathFieldExpression( this.field )
          let results = this.$fhirpath.evaluate( this.slotProps.source.data, expression )
          this.source.data = results[0]
        }
        if( this.source.data ) {
          this.preset = true
          this.select = this.source.data.reference
          this.lockWatch = true
        }
      }
      this.disabled = this.readOnlyIfSet && this.preset
    },
    setupTreeItems: function() {
      let treetop = this.initialValue
      if ( this.overrideValue ) {
        treetop = this.overrideValue
      }
      this.loading = true
      let params = {}
      if ( treetop ) {
        params = { "partof": treetop }
      } else {
        params = { "partof:missing": true }
      }
      params._count = 200
      let url = "/fhir/"+this.$store.state.config.userConfig.FRDatasource+"/"+this.resource+"?"+querystring.stringify( params )
      this.items = []
      this.addItems( url, this.items )

    },
    checkChildren: function(item) {
      let params = { "partof": item.id, "_summary": "count" }
      let url = "/fhir/"+this.$store.state.config.userConfig.FRDatasource+"/"+this.resource+"?"+querystring.stringify( params )
      return new Promise( resolve => {
        axios.get( url ).then( response => {
          let data = response.data
          if ( data.total && data.total > 0 ) {
            item.children = []
          }
          resolve()
        } ).catch( err => {
          console.log("failed to check children for",url,err)
          resolve()
        } )
      } )
    },
    addItems: function(url, items) {
      axios.get( url ).then( async(response) => {
        let data = response.data
        if ( data.entry && data.entry.length > 0 ) {
          for( let entry of data.entry ) {
            let locked = this.allAllowed ? false : !entry.resource.meta.profile || !entry.resource.meta.profile.includes( this.targetProfile )
            let item = {
              id: entry.resource.resourceType+"/"+entry.resource.id,
              name: entry.resource.name,
              locked: locked
            }
            await this.checkChildren( item )
            this.treeLookup[ item.id ] = item.name
            items.push( item )
          }
        }
        if ( data.link ) {
          let next = data.link.find( link => link.relation === "next" )
          if ( next ) {
            this.addItems( next.url, items )
          } else {
            this.loading = false
          }
        } else {
          this.loading = false
        }
      } ).catch( err => {
        console.log("Failed to add items for",url,err)
        this.loading = false
      } )
    },
    fetchChildren: function(item) {
      let params = {}
      params = { "partof": item.id, _count: 500 }
      let url = "/fhir/"+this.$store.state.config.userConfig.FRDatasource+"/"+this.resource+"?"+querystring.stringify( params )
      this.loading = true
      this.addItems( url, item.children )
      return new Promise( resolve => {
        let count = 0
        const checkLoading = () => {
          if ( !this.loading || count++ > 100) {
            resolve()
          } else {
            setTimeout( checkLoading, 200 )
          }
        }
        checkLoading()
      } )
    },
    querySelections: function( val ) {
      this.loading = true
      let params = { "name:contains": val }
      if ( !this.targetProfile.endsWith( this.resource ) ) {
        params._profile = this.targetProfile
      }
      let url = "/fhir/"+this.$store.state.config.userConfig.FRDatasource+"/"+this.resource+"?"+querystring.stringify( params )
      axios.get( url ).then( async(response) => {
        let data = response.data
        this.items = []
        if ( data.entry && data.entry.length ) {
          for( let entry of data.entry ) {
            let ref = entry.resource.resourceType+"/"+entry.resource.id
            let item = { value: ref }
            item.text = await this.$fhirutils.resourceLookup( ref )
            this.items.push( item )
          }
        }
      } )
    },
    // getDisplay: function() {
    //   if ( (!this.edit || this.preset) && this.value && this.value.reference ) {
    //     this.loading = true
    //     this.$fhirutils.resourceLookup( this.value.reference ).then( display => {
    //       console.log(display);
    //       this.displayValue = display
    //       if ( this.displayType !== "tree" ) {
    //         this.items.push( {text: display, value: this.value.reference} )
    //       }
    //       this.loading = false
    //     } )
    //   }
    // }
  },
  computed: {
    index: function() {
      if ( this.slotProps ) return this.slotProps.input
      else return undefined
    },
    display: function() {
      if ( this.slotProps && this.slotProps.input) return this.slotProps.input.label
      else return this.label
    },
  }

}
</script>
