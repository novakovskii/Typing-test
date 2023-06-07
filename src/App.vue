<template>
  <header class="header">
    <w-toolbar 
      class="px0 py6" 
      no-border
    >
      <div>
        <div class="title3">Typing test</div>
        <div class="title5 mt2 primary">Check your typing speed by typing latest world news</div>
      </div>
      <div class="spacer"></div>
      <div>
        <w-flex 
          no-grow 
          gap="3" 
          wrap
        >
          <w-select 
            :items="languages" 
            outline 
            fit-to-content
            v-model="languagesOptions"
            inner-icon-left="mdi mdi-translate"
            @input="onLanguageSelect"
          >Language</w-select>
          <w-select 
            :items="countries" 
            outline 
            fit-to-content
            v-model="countriesOptions"
            inner-icon-left="mdi mdi-earth"
            @input="onCountrySelect"
          >Country</w-select>
          <w-select 
            :items="categories" 
            outline 
            fit-to-content
            v-model="categoriesOptions"
            inner-icon-left="mdi mdi-format-list-bulleted-type"
            @input="onCategorySelect"
          >Category</w-select>
          <w-switch
            v-model="isDarkTheme"
            class="mt3 caption"
            @input="onThemeSwitch"
          >
            <template #thumb>
              <w-icon>
                {{ isDarkTheme ? 'mdi mdi-weather-night' : 'mdi mdi-white-balance-sunny' }}
              </w-icon>
            </template>
          </w-switch>
        </w-flex>
        <w-flex class="primary mt3" style="font-size: 12px;">
          <span>Max text length</span>
          <div class="spacer"></div>
          <span>{{ this.textLength }} words</span>
        </w-flex>
        <w-slider
          v-model="textLength"
          color="primary"
          class="mt3"
          :min="60"
          :max="180"
          :step="20"
          @input="onTextLengthChange"
        >
        </w-slider>
      </div>
    </w-toolbar>
  </header>
  <main class="main mt8">
    <w-flex
      v-if="!isLoaded"
      justify-center
    >
      <w-progress circle></w-progress>
    </w-flex>
    <template v-else>
      <w-table
        :items="info.items"
        :headers="info.headers"
        class="body"
        no-headers
      >
      <template #item-cell="{ item, label, header}">
        <a 
          v-if="item.type === 'Link' && header.label === 'Value'" 
          :href="label" 
          target="_blank"
          class="base-color"
          :class="{'primary' : header.label === 'Value'}"
        >
          {{ label }}
        </a>
        <template v-else>
          <span
            :class="{'primary' : header.label === 'Type'}"
          >{{ label }}</span>
        </template>
      </template>
      </w-table>
      <w-card class="body mt4 lh3">
        <template
          v-for="(word, idx) in sourceTextArray"
          :key="idx"
        >
          <span
            :class="{
              'grey-light1' : idx < wordIndex,
              'error' : idx < wordIndex && sourceTextArray[idx] !== inputTextArray[idx]
            }"
          >{{ word + ' '}}</span>
        </template><span class="grey-light1">...</span>
      </w-card>
      <w-textarea
        ref="textarea"
        no-autogrow
        placeholder="Type here"
        outline
        rows="10"
        class="mt3"
        v-model="inputText"
        color="base"
        @input="onInput"
      >
      </w-textarea>
      <w-flex justify-end class="mt3">
        <w-button @click="regenerate">
          <w-icon class="mr1">mdi mdi-refresh</w-icon>
          Regenerate
        </w-button>
      </w-flex>
    </template>
  </main>
  <w-dialog
    v-model="showResultDialog"
    :width="500"
    :overlay-opacity="0.1"
    overlay-color="primary"
    transition="slide-fade-up"
    class="lh3"
    @close="onResultDialogClose"
  >
    <template #title>
      <span class="title4">Current results</span>
    </template>
    Exercise time: <span class="primary">{{ Math.floor(totalTime / 1000) }}s</span> <br>
    Current typing speed: <span class="primary">{{ speed }}</span> words per minute
    <w-divider class="my3"></w-divider>
    <span class="text-center d-block grey-light1">Press ESC to continue</span>
  </w-dialog>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      isLoaded: false,
      isDarkTheme: null,
      languages: [
        { 
          label: 'English',
          value: 'en'
        },
        { 
          label: 'Russian',
          value: 'ru'
        }
      ],
      countries: [
        { 
          label: 'All',
          value: 'all'  
        },
        { 
          label: 'Russia',
          value: 'ru'
        }
      ],
      categories: [
        { 
          label: 'All',
          value: 'all'  
        },
        { 
          label: 'Business',
          value: 'business'  
        },
        { 
          label: 'Entertainment',
          value: 'entertainment'
        },
        { 
          label: 'Environment',
          value: 'environment'
        },
        { 
          label: 'Food',
          value: 'food'
        },
        { 
          label: 'Health',
          value: 'health'
        },
        { 
          label: 'Politics',
          value: 'politics'
        },
        { 
          label: 'Science',
          value: 'science'
        },
        { 
          label: 'Sports',
          value: 'sports'
        },
        { 
          label: 'Technology',
          value: 'technology'
        },
        { 
          label: 'Top',
          value: 'top'
        },
        { 
          label: 'Tourism',
          value: 'tourism'
        },
        { 
          label: 'World',
          value: 'world'
        }
      ],
      languagesOptions: 'en',
      countriesOptions: 'all',
      categoriesOptions: 'all',
      title: '',
      date: null,
      link: '',
      sourceText: '',
      inputText: '',
      isStarted: false,
      startTime: null,
      finishTime: null,
      totalTime: null,
      speed: null,
      url: 'https://newsdata.io/api/1/news?apikey=pub_206834a89204e0fc9393ef17d7f8ea0f5f4e9',
      textLength: 60,
      showResultDialog: false,
      info: {
        headers: [
          { label: 'Type', key: 'type' },
          { label: 'Value', key: 'value' },
        ],
        items: []
      }
    }
  },
  methods: {
    onLanguageSelect () {
      localStorage.setItem('language', this.languagesOptions)
      this.loadNews()
      this.inputText = ''
      this.isStarted = false
    },
    onCountrySelect () {
      localStorage.setItem('country', this.countriesOptions)
      this.loadNews()
      this.inputText = ''
      this.isStarted = false
    },
    onCategorySelect () {
      localStorage.setItem('category', this.categoriesOptions)
      this.loadNews()
      this.inputText = ''
      this.isStarted = false
    },
    onThemeSwitch () {
      this.isDarkTheme ? this.$waveui.switchTheme('dark') : this.$waveui.switchTheme('light')
      localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light')
    },
    async fetchNews(language, country, category, callback) {
      this.isLoaded = false
      let response
      let news = []
      const pageCount = 1
      for (let i = 0; i < pageCount; i++) {  
        const nextPage = response?.nextPage
        const results = await fetch(this.url + 
          `&language=${language}` + 
          `${country !== 'all' ? '&country=' + country : ''}` + 
          `${category !== 'all' ? '&category=' + category : ''}` + 
          `${nextPage !== undefined ? '&page=' + nextPage : ''}`)
        response = await results.json()
        news = news.concat(response.results)
      }
      callback(language, country, category, news);
    },
    onNewsFetch (language, country, category, news) {
      localStorage.setItem(`news_${language}_${country}_${category}`, JSON.stringify(news))
      this.setRandomNews(this.languagesOptions, this.countriesOptions, this.categoriesOptions)
      this.isLoaded = true
      this.$nextTick(() => {
        this.$refs.textarea.$refs.textarea.focus()
      })
    },
    loadNews () {
      const fetchDate = localStorage.getItem(`fetchDate_${this.languagesOptions}_${this.countriesOptions}_${this.categoriesOptions}`)
      if (!fetchDate) {
        this.fetchNews(this.languagesOptions, this.countriesOptions, this.categoriesOptions, this.onNewsFetch)
        localStorage.setItem(`fetchDate_${this.languagesOptions}_${this.countriesOptions}_${this.categoriesOptions}`, new Date())
      } else {
        const fetchDateWithoutTime = new Date(fetchDate).setHours(0, 0, 0, 0)
        const currentDateWithoutTime = new Date().setHours(0, 0, 0, 0)
        if (fetchDateWithoutTime !== currentDateWithoutTime) {
          this.fetchNews(this.languagesOptions, this.countriesOptions, this.categoriesOptions, this.onNewsFetch)
          localStorage.setItem(`fetchDate_${this.languagesOptions}_${this.countriesOptions}_${this.categoriesOptions}`, new Date())
        } else {
          this.isLoaded = true
          this.$nextTick(() => {
            this.$refs.textarea.$refs.textarea.focus()
          })
          this.setRandomNews(this.languagesOptions, this.countriesOptions, this.categoriesOptions)
        }
      }
    },
    setRandomNews (language, country, category) {
      const news = JSON.parse(localStorage.getItem(`news_${language}_${country}_${category}`))
      const randomIndex = Math.floor(Math.random() * news.length)
      this.sourceText = news[randomIndex].content
        .replaceAll(/[‹›‚‘‛’]/g, '\'')
        .replaceAll(/[«»„“‟”]/g, '"')
        .replaceAll(/[–—‒―⸺⸻]/g, '-')
        .replaceAll(/[…]/g, '...')
        .replaceAll(/ \./g, '.')
        .replaceAll(/ ,/g, ',')
      this.title = news[randomIndex].title
      
      this.category = news[randomIndex].category.join(', ')[0].toUpperCase() + news[randomIndex].category.join(', ').slice(1)
      this.link = news[randomIndex].link
      this.date = news[randomIndex].pubDate
      this.info.items = []
      this.info.items.push({type: 'Title', value: this.title})
      this.info.items.push({type: 'Category', value: this.category})
      this.info.items.push({type: 'Link', value: this.link})
      this.info.items.push({type: 'Date', value: this.formattedDate})
    },
    regenerate () {
      this.setRandomNews(this.languagesOptions, this.countriesOptions, this.categoriesOptions)
      this.inputText = ''
      this.isStarted = false
    },
    onInput () {
      if (!this.isStarted) {
        this.isStarted = true
        this.startTime = Date.now()
      }
      if (this.isFinished) {
        this.finishTime = Date.now()
        this.totalTime = this.finishTime - this.startTime
        this.isStarted = false
        this.speed = Math.floor(this.sourceTextArray.length / (this.totalTime / 60000))
        this.openResultDialog()
      }
    },
    openResultDialog () {
      this.showResultDialog = true
    },
    onResultDialogClose () {
      this.showResultDialog = false
      this.setRandomNews(this.languagesOptions, this.countriesOptions, this.categoriesOptions)
      this.inputText = ''
      this.$refs.textarea.$refs.textarea.focus()
    },
    onTextLengthChange () {
      localStorage.setItem('textLength', this.textLength)
      this.inputText = ''
    }
  },
  computed: {
    sourceTextArray () {
      return this.splicedSourceText.split(' ')
    },
    inputTextArray () {
      return this.inputText.split(' ')
    },
    wordIndex () {
      return this.inputTextArray.length - 1
    },
    isFinished () {
      return this.sourceTextArray.length === this.wordIndex
    },
    splicedSourceText () {
      const splicedSourceTextArray = this.sourceText.split(' ')
      splicedSourceTextArray.splice(this.textLength)
      return splicedSourceTextArray.join(' ')
    },
    formattedDate () {
      let date = new Date(this.date)
      let day = ('0' + date.getDate()).slice(-2)
      let month = ('0' + Number(date.getMonth() + 1)).slice(-2)
      let year = date.getFullYear()
      let hours = ('0' + date.getHours()).slice(-2)
      let minutes = ('0' + date.getMinutes()).slice(-2)
      return `${day}.${month}.${year} ${hours}:${minutes}`
    }
  },
  mounted () {
    //theme initialise
    const theme = localStorage.getItem('theme')
    if (!theme) {
      this.isDarkTheme = true
      localStorage.setItem('theme', 'dark')
      this.$waveui.switchTheme('dark')
    } else {
      this.isDarkTheme = theme === 'dark' ? true : false
      this.$waveui.switchTheme(theme)
    }
    //language initialise
    const language = localStorage.getItem('language')
    if (!language) {
      localStorage.setItem('language', this.languagesOptions)
    } else {
      this.languagesOptions = language
    }
    //country initialise
    const country = localStorage.getItem('country')
    if (!country) {
      localStorage.setItem('country', this.countriesOptions)
    } else {
      this.countriesOptions = country
    }
    //category initialise
    const category = localStorage.getItem('category')
    if (!category) {
      localStorage.setItem('category', this.categoriesOptions)
    } else {
      this.categoriesOptions = category
    }
    //max text length initialise
    const textLength = localStorage.getItem('textLength')
    if (!textLength) {
      localStorage.setItem('textLength', this.textLength)
    } else {
      this.textLength = Number(textLength)
    }
    //load news
    this.loadNews()
  }
}
</script>

<style>
  @font-face {
    font-family: 'JetBrainsMono';
    src: url("./fonts/JetBrainsMono-Light.woff2") format('woff2');
  }
  @font-face {
    font-family: 'JetBrainsMono';
    src: url("./fonts/JetBrainsMono-Regular.woff2") format('woff2');
  }
  #app {
    font-family: 'JetBrainsMono';
    max-width: 1000px;
    margin: auto;
    padding: 0 32px;
  }
</style>